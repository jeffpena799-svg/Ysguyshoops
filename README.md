# Y’s Guys League Universe v4.5

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

## v3.0 — Player Depth

- Head-to-head player comparison
- Automatic player archetypes
- Gold, Silver, and Bronze achievement badges
- Full-roster Legacy Tracker
- Hall of Fame progress bars
- Expanded 2K-style player identity

## v3.1 — Identity & Recovery

- Automatic cloud restore point after every shared save
- Commissioner revision browser and one-tap restore
- Jersey numbers and player heights
- Signature strengths and signature badges
- Profile banner colors
- Photo-ready player profiles using hosted image URLs
- Safer separation between code rollback and league-data recovery

## v4.0 — Community Studio

- Commissioner-managed Community News
- Create, edit, publish, feature, reorder, and remove stories
- Direct image selection from a phone or computer
- Automatic browser-side photo resizing and compression
- Direct player-profile picture selection
- Public Community page and dynamic Home headlines
- News and photos included in cloud revisions and downloaded backups

## v4.1 — Sunday Run

- Public Going, Maybe, and Not Going responses without accounts or PINs
- Optional arrival time and player note
- Live attendance totals and timestamped response lists
- Commissioner Sunday creation, editing, cancellation, locking, and deletion
- Location, start time, notes, and RSVP deadline controls
- Sunday history preserved in the shared league database
- Home dashboard attendance banner
- Sunday-aware league calendar
- Every attendance update creates a cloud revision

## v4.2 — Player Intelligence

- Career highs derived from official box scores
- Live player averages, win percentage, recorded games, and win streaks
- Expanded historical analytics inside the Record Book

## v4.3 — League Timeline

- Unified chronological history of games, awards, news, and Sunday attendance
- Filterable history categories
- Automatic timeline updates as the league grows

## v4.4 — Voting Center

- Commissioner-created MVP, award, and community polls
- Public one-player/one-vote ballots without accounts or PINs
- Changeable votes while a poll remains open
- Closed-poll results with totals and percentages
- Voting changes protected by cloud revision history

## v4.5 — Share Studio

- Live Instagram-ready 4:5 graphics
- League leader, latest result, Sunday turnout, and featured-news templates
- One-tap PNG downloads generated from current league data
- Commissioner-set player overall ratings with automatic-rating fallback
- Editable career totals, personal awards, and official Awards Center records
