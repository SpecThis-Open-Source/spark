# AI Client

A desktop AI chat client built with Electron and TypeScript.

My son got interested in coding and was burning through free-tier limits in a single session. Rather than paying for a pro subscription, this app lets him chat with an AI using an API key directly — giving me control over usage and costs.

## Status

Early stages — the Electron shell is up with a placeholder UI. Chat functionality is next.

## Getting Started

```bash
npm install
npm start
```

Create a `.env` file in the project root for your API key (gitignored by default).

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Compile TypeScript and launch the app |
| `npm run build` | Compile TypeScript only (output to `dist/`) |
| `npm run package` | Build and package a distributable macOS app (output to `release/`) |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |

## Tech Stack

- **Electron** — desktop shell
- **TypeScript** — compiled to `dist/`, renderer HTML/CSS served from `src/renderer/`
- **Vanilla HTML/CSS** — no frontend framework
