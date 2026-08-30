const HISTORY_LIMIT = 20;
const SNAPSHOT_FORMAT = 2;

function isEmbeddedImage(value) {
  return typeof value === "string" && value.startsWith("data:image/");
}

function hasEmbeddedImage(value) {
  if (isEmbeddedImage(value)) return true;
  if (Array.isArray(value)) return value.some(hasEmbeddedImage);
  if (!value || typeof value !== "object") return false;
  return Object.values(value).some(hasEmbeddedImage);
}

export function compactLeagueSnapshot(value) {
  if (Array.isArray(value)) return value.map(compactLeagueSnapshot);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([, item]) => !isEmbeddedImage(item))
    .map(([key, item]) => [key, compactLeagueSnapshot(item)]));
}

function createHistorySnapshot(data) {
  return { ...compactLeagueSnapshot(data), __historyFormat: SNAPSHOT_FORMAT };
}

function preserveCollectionMedia(snapshotItems, currentItems, field) {
  if (!Array.isArray(snapshotItems) || !Array.isArray(currentItems)) return snapshotItems;
  const currentById = new Map(currentItems.map(item => [item?.id, item]));
  return snapshotItems.map(item => {
    const current = currentById.get(item?.id);
    return current && isEmbeddedImage(current[field]) ? { ...item, [field]: current[field] } : item;
  });
}

export function preserveLeagueMedia(snapshot, current) {
  if (!snapshot || !current) return snapshot;
  const { __historyFormat: _historyFormat, ...snapshotData } = snapshot;
  const next = {
    ...snapshotData,
    players: preserveCollectionMedia(snapshotData.players, current.players, "photoUrl"),
    news: preserveCollectionMedia(snapshotData.news, current.news, "imageUrl"),
    history: preserveCollectionMedia(snapshotData.history, current.history, "imageUrl"),
    submissions: preserveCollectionMedia(snapshotData.submissions, current.submissions, "imageUrl"),
  };
  if (isEmbeddedImage(current.branding?.logoUrl)) {
    next.branding = { ...(snapshotData.branding ?? {}), logoUrl: current.branding.logoUrl };
  }
  return next;
}

export async function saveLeagueHistory(database, revision, data, createdAt) {
  const snapshot = createHistorySnapshot(data);
  await database`
    INSERT INTO league_history (revision, data, created_at)
    VALUES (${revision}, ${database.json(snapshot)}, ${createdAt})
    ON CONFLICT (revision) DO NOTHING
  `;
  await database`
    DELETE FROM league_history
    WHERE revision NOT IN (
      SELECT revision
      FROM league_history
      ORDER BY revision DESC
      LIMIT ${HISTORY_LIMIT}
    )
  `;
}

export async function compactLeagueStorage(database, { forceVacuum = false } = {}) {
  const rows = await database`SELECT COUNT(*)::integer AS count FROM league_history`;
  const historyCount = Number(rows[0]?.count ?? 0);
  let deletedCount = 0;

  const latest = historyCount > 0
    ? await database`SELECT data FROM league_history ORDER BY revision DESC LIMIT 1`
    : [];
  const needsSnapshotRebuild = latest.length && (
    latest[0].data?.__historyFormat !== SNAPSHOT_FORMAT || hasEmbeddedImage(latest[0].data)
  );
  if (needsSnapshotRebuild) {
    const current = await database`SELECT data, revision, updated_at FROM league_state WHERE id = 1`;
    if (current.length) {
      const snapshot = createHistorySnapshot(current[0].data);
      // Commit the truncate and reclaim its disk space before writing the compact
      // snapshot. At the project storage ceiling, an atomic rewrite cannot extend
      // the table even though the transaction has logically removed the old rows.
      await database`TRUNCATE TABLE league_history`;
      await database.unsafe("VACUUM league_history");
      await database`
        INSERT INTO league_history (revision, data, created_at)
        VALUES (${current[0].revision}, ${database.json(snapshot)}, ${current[0].updated_at})
      `;
      deletedCount = Math.max(0, historyCount - 1);
      await database.unsafe("VACUUM league_state");
      return { deletedCount, retainedCount: 1, rebuiltWithoutEmbeddedMedia: true };
    }
  }

  if (historyCount > HISTORY_LIMIT) {
    const deleted = await database`
      DELETE FROM league_history
      WHERE revision NOT IN (
        SELECT revision
        FROM league_history
        ORDER BY revision DESC
        LIMIT ${HISTORY_LIMIT}
      )
    `;
    deletedCount = Number(deleted.count ?? historyCount - HISTORY_LIMIT);
  }

  if (deletedCount > 0 || forceVacuum) {
    // VACUUM must run outside a transaction. It makes the deleted snapshot pages
    // reusable by Neon and also reclaims old copies of the single league_state row.
    await database.unsafe("VACUUM league_history");
    await database.unsafe("VACUUM league_state");
  }

  return { deletedCount, retainedCount: Math.min(historyCount, HISTORY_LIMIT), rebuiltWithoutEmbeddedMedia: false };
}
