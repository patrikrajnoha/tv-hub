# TV Hub

TV Hub is a lightweight personal homepage for a smart TV browser. It provides large, remote-friendly launcher buttons for TV channels, movies, series, YouTube, media, and other frequently used websites. Channel entries open an internal player route; external entries open their configured website.

## Local development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

The Vite base path is configured for the `tv-hub` GitHub repository at `/tv-hub/`. Vue Router uses hash history for reliable GitHub Pages refreshes, so internal routes look like `/tv-hub/#/watch/markiza`.

## GitHub Pages deployment

Push the project to a GitHub repository named `tv-hub` on the `main` branch. The workflow in `.github/workflows/deploy.yml` builds the app and deploys the `dist` directory using GitHub's current Pages artifact and deployment actions. In the repository settings, set Pages' source to **GitHub Actions**.

## Configure launchers and channels

Edit [`src/data/launchers.ts`](src/data/launchers.ts). External entries use `type: 'external'` and a `url`; channel entries use `type: 'channel'`, a `channelId`, and an internal `route`.

Edit [`src/data/channels.ts`](src/data/channels.ts) to add channel metadata. An authorized HLS URL should later be assigned to its `streamUrl`; keep credentials, tokens, cookies, and private stream details out of the repository.
