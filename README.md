# Y’s Guys League Platform v2.7

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
