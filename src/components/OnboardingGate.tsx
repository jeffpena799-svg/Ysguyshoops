import React, { useEffect, useMemo, useState } from 'react';

type Player = {
  id: string;
  name: string;
  nickname?: string;
  position?: string;
  photoUrl?: string;
};

type Mode = 'start' | 'existing' | 'new';

const NAVY = '#0A2D5E';
const GOLD = '#C7A24D';

export default function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<Mode>('start');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [position, setPosition] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const existing = localStorage.getItem('yg-my-player');
    const skipped = localStorage.getItem('yg-onboarding-skipped') === '1';
    setShow(!existing && !skipped);
    setReady(true);
  }, []);

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return players;
    return players.filter(player => `${player.name} ${player.nickname ?? ''}`.toLowerCase().includes(query));
  }, [players, search]);

  const loadPlayers = async () => {
    setError('');
    setLoadingPlayers(true);
    try {
      const response = await fetch('/api/league');
      if (!response.ok) throw new Error('Could not load the roster');
      const result = await response.json();
      const roster = Array.isArray(result?.data?.players) ? result.data.players : [];
      setPlayers(roster);
      setMode('existing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the roster');
    } finally {
      setLoadingPlayers(false);
    }
  };

  const choosePlayer = (playerId: string) => {
    localStorage.setItem('yg-my-player', playerId);
    localStorage.removeItem('yg-onboarding-skipped');
    setShow(false);
  };

  const browseAsGuest = () => {
    localStorage.setItem('yg-onboarding-skipped', '1');
    setShow(false);
  };

  const createPlayer = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setCreating(true);
    try {
      const response = await fetch('/api/create-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), nickname: nickname.trim(), position }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Profile could not be created');
      localStorage.setItem('yg-my-player', result.player.id);
      localStorage.removeItem('yg-onboarding-skipped');
      setShow(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile could not be created');
    } finally {
      setCreating(false);
    }
  };

  if (!ready) return null;

  return (
    <>
      {children}
      {show && (
        <div style={styles.backdrop}>
          <section style={styles.card} role="dialog" aria-modal="true" aria-labelledby="welcome-title">
            <div style={styles.logo}>YG</div>
            {mode === 'start' && (
              <>
                <span style={styles.eyebrow}>WELCOME TO Y'S GUYS</span>
                <h1 id="welcome-title" style={styles.title}>Who are you?</h1>
                <p style={styles.copy}>Set up this device once and Y's Guys will remember your player every time you come back.</p>
                <button style={styles.primary} onClick={loadPlayers} disabled={loadingPlayers}>
                  {loadingPlayers ? 'Loading roster…' : "I'm already a Y's Guy"}
                </button>
                <button style={styles.secondary} onClick={() => { setError(''); setMode('new'); }}>
                  I'm new here
                </button>
                <button style={styles.guest} onClick={browseAsGuest}>Just browse for now</button>
              </>
            )}

            {mode === 'existing' && (
              <>
                <button style={styles.back} onClick={() => setMode('start')}>← Back</button>
                <span style={styles.eyebrow}>CLAIM YOUR PLAYER</span>
                <h1 style={styles.title}>Find your name</h1>
                <p style={styles.copy}>Choose your existing player so your stats, history and Sunday activity stay connected.</p>
                <input
                  style={styles.input}
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Search your name or nickname…"
                  autoFocus
                />
                <div style={styles.roster}>
                  {filteredPlayers.map(player => (
                    <button key={player.id} style={styles.playerButton} onClick={() => choosePlayer(player.id)}>
                      {player.photoUrl ? (
                        <img src={player.photoUrl} alt="" style={styles.avatarImage} />
                      ) : (
                        <span style={styles.avatar}>{initials(player.name)}</span>
                      )}
                      <span style={styles.playerText}>
                        <b>{player.name}</b>
                        <small>{[player.nickname, player.position].filter(Boolean).join(' · ') || 'Y’s Guys player'}</small>
                      </span>
                      <strong style={styles.chevron}>›</strong>
                    </button>
                  ))}
                  {!filteredPlayers.length && <p style={styles.empty}>No player found. Try your nickname, or go back and create a new profile.</p>}
                </div>
              </>
            )}

            {mode === 'new' && (
              <form onSubmit={createPlayer}>
                <button type="button" style={styles.back} onClick={() => setMode('start')}>← Back</button>
                <span style={styles.eyebrow}>NEW PLAYER</span>
                <h1 style={styles.title}>Create your profile</h1>
                <p style={styles.copy}>Start with the basics. Your profile can be polished later without losing this device connection.</p>
                <label style={styles.label}>Name
                  <input style={styles.input} value={name} onChange={event => setName(event.target.value)} placeholder="Your name" required maxLength={60} autoFocus />
                </label>
                <label style={styles.label}>Nickname <small style={styles.optional}>optional</small>
                  <input style={styles.input} value={nickname} onChange={event => setNickname(event.target.value)} placeholder="What the league calls you" maxLength={60} />
                </label>
                <label style={styles.label}>Position <small style={styles.optional}>optional</small>
                  <select style={styles.input} value={position} onChange={event => setPosition(event.target.value)}>
                    <option value="">Choose later</option>
                    {['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'G/F', 'F/C'].map(value => <option value={value} key={value}>{value}</option>)}
                  </select>
                </label>
                <button style={styles.primary} disabled={creating}>{creating ? 'Creating profile…' : 'Create My Player'}</button>
              </form>
            )}

            {error && <div style={styles.error}>{error}</div>}
          </section>
        </div>
      )}
    </>
  );
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'YG';
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(4,18,39,.78)',
    display: 'grid', placeItems: 'center', padding: 18, backdropFilter: 'blur(7px)',
  },
  card: {
    width: 'min(520px, 100%)', maxHeight: 'min(760px, 92vh)', overflowY: 'auto',
    background: '#fff', borderRadius: 24, padding: '28px 24px 24px', boxShadow: '0 24px 80px rgba(0,0,0,.28)',
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  logo: {
    width: 58, height: 58, borderRadius: 18, background: NAVY, color: '#fff', display: 'grid', placeItems: 'center',
    fontWeight: 900, fontSize: 20, letterSpacing: -1, marginBottom: 20, boxShadow: `inset 0 -5px 0 ${GOLD}`,
  },
  eyebrow: { display: 'block', color: GOLD, fontWeight: 900, fontSize: 12, letterSpacing: 1.4, marginBottom: 8 },
  title: { margin: '0 0 10px', color: NAVY, fontSize: 34, lineHeight: 1.02, letterSpacing: -1.2 },
  copy: { margin: '0 0 22px', color: '#526174', fontSize: 15, lineHeight: 1.55 },
  primary: {
    width: '100%', border: 0, borderRadius: 14, padding: '15px 17px', marginTop: 10,
    background: NAVY, color: '#fff', fontSize: 16, fontWeight: 850, cursor: 'pointer',
  },
  secondary: {
    width: '100%', border: `2px solid ${NAVY}`, borderRadius: 14, padding: '13px 17px', marginTop: 10,
    background: '#fff', color: NAVY, fontSize: 16, fontWeight: 850, cursor: 'pointer',
  },
  guest: { width: '100%', border: 0, background: 'transparent', color: '#718096', fontWeight: 700, padding: '15px 0 2px', cursor: 'pointer' },
  back: { border: 0, background: '#eef3f8', color: NAVY, borderRadius: 999, padding: '8px 12px', fontWeight: 800, marginBottom: 18, cursor: 'pointer' },
  input: {
    boxSizing: 'border-box', width: '100%', border: '1px solid #d6dee8', borderRadius: 12, padding: '13px 14px',
    fontSize: 16, color: '#15243a', background: '#fff', outline: 'none', marginTop: 7,
  },
  roster: { display: 'grid', gap: 8, marginTop: 14, maxHeight: 390, overflowY: 'auto', paddingRight: 2 },
  playerButton: {
    border: '1px solid #e1e7ef', borderRadius: 14, background: '#f9fbfd', padding: 10, display: 'flex', alignItems: 'center', gap: 11,
    textAlign: 'left', cursor: 'pointer', color: NAVY,
  },
  avatar: { width: 42, height: 42, borderRadius: 12, background: NAVY, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, flex: '0 0 auto' },
  avatarImage: { width: 42, height: 42, borderRadius: 12, objectFit: 'cover', flex: '0 0 auto' },
  playerText: { display: 'grid', gap: 2, flex: 1 },
  chevron: { fontSize: 26, color: GOLD },
  empty: { color: '#69778a', lineHeight: 1.45, textAlign: 'center', padding: 18 },
  label: { display: 'block', color: NAVY, fontWeight: 800, fontSize: 14, marginBottom: 14 },
  optional: { color: '#8793a4', fontWeight: 600 },
  error: { background: '#fff0f0', color: '#9f2424', borderRadius: 12, padding: 12, marginTop: 14, fontWeight: 700, fontSize: 14 },
};
