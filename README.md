# Y’s Guys League Platform v2.2

The official mobile-friendly league platform for Y’s Guys basketball.

## Commissioner Mode

- Add, edit, and delete completed games
- Add, edit, and delete player profiles
- Add, edit, and delete league awards
- Validate required fields and prevent duplicate players
- Download complete JSON backups
- Restore backups on this or another device
- Restore the original league dataset
- Safely handle players with zero recorded games

## Run locally

```bash
npm install
npm run typecheck
npm run build
```

## Deploy to Vercel

Framework: Vite  
Build command: `npm run build`  
Output directory: `dist`

Version 2.2 stores commissioner changes in the browser where they are entered. A hosted database and commissioner authentication are the next infrastructure upgrade required for shared cross-device data.
