# Y’s Guys League Universe v2.9

The shared, mobile-first home of Y’s Guys basketball.

## Release sequence

### v2.3 — Cloud league

- Shared Postgres league state
- Public cloud reads
- Password-protected Commissioner Mode
- Signed seven-day Commissioner sessions
- Local fallback when the network is unavailable

### v2.4 — Box scores

- Per-player game stat lines
- Automatic career point, rebound, assist, turnover, win, and loss adjustments
- Safe reversal when games are edited or deleted
- Public box-score views in Game History

### v2.5 — Team center

- Automatic standings
- Points for, points against, and point differential
- Rankings derived from official game results

### v2.6 — Legacy system

- Live record calculations
- Hall of Fame
- Dynamic legacy qualification

### v2.7 — Sharing and mobile

- Native share sheet and copy-link fallback
- Installable web-app manifest
- Offline application shell
- Cloud-status indicators
- Mobile Commissioner tools

## Development

```bash
npm install
npm run typecheck
npm run build
```

Required Vercel environment variables:

- `POSTGRES_URL`
- `COMMISSIONER_PASSWORD`
- `SESSION_SECRET`

## v2.8 — Game Day

- Schedule upcoming games without affecting standings
- Record start times and locations
- Convert scheduled games into official finals
- Dynamic next-game and latest-final home dashboard
- Separate upcoming schedule and completed results
- Prevent duplicate players in a game box score
- Require a winner before publishing a final
- Calculate standings and records from final games only

## v2.9 — League Universe

- Dedicated full-screen player profiles
- 2K-style overall ratings and player archetypes
- Universal legacy percentage for every player
- Hall of Fame trajectory messaging
- Complete official and player-level trophy cases
- Career box-score game logs
- Month-by-month league calendar
- Official digital Rule Book
- Expanded universe navigation
