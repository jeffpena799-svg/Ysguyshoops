const HISTORY_LIMIT = 20;

export async function saveLeagueHistory(database, revision, data, createdAt) {
  await database`
    INSERT INTO league_history (revision, data, created_at)
    VALUES (${revision}, ${database.json(data)}, ${createdAt})
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

  return { deletedCount, retainedCount: Math.min(historyCount, HISTORY_LIMIT) };
}

