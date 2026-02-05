# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A desktop AI chat client built with Electron and TypeScript. The goal is to provide a local app where a kid can use an AI API key directly (avoiding paid subscriptions and giving parents control over usage/costs).

The app is in early stages — currently just the Electron shell with a placeholder UI.

## Commands

- `npm start` — compile TypeScript and launch the Electron app
- `npm run build` — compile TypeScript only (output to `dist/`)
- `npm run package` — build + package into a distributable macOS app (output to `release/`)
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run format:check` / `npm run format` — Prettier

## Architecture

**Electron two-process model:**

- **Main process** (`src/main/main.ts`) — creates the BrowserWindow, loads the renderer HTML. Standard Electron lifecycle handling (macOS dock reactivation, quit-on-close for non-mac).
- **Preload** (`src/main/preload.ts`) — exposes `window.electronAPI` to the renderer via `contextBridge`. Currently only exposes `platform`. This is the bridge for any future IPC between main and renderer.
- **Renderer** (`src/renderer/`) — plain HTML + CSS, no framework. `index.html` loads `styles.css`. The renderer has a strict CSP (`default-src 'self'; style-src 'self'`).

Security: `contextIsolation: true`, `nodeIntegration: false`. All main-to-renderer communication must go through the preload bridge.

## Code Style

- Prettier: single quotes, trailing commas, 100 char line width, LF endings
- ESLint enforces strict limits: max 500 lines/file, complexity 10, max depth 4, max params 4, max nested callbacks 3
- Unused vars prefixed with `_` are allowed

## Key Decisions

- No frontend framework — vanilla HTML/CSS/JS in the renderer
- CommonJS modules (`"type": "commonjs"` in package.json, `"module": "commonjs"` in tsconfig)
- TypeScript compiles `src/` → `dist/`, but renderer HTML/CSS are loaded directly from `src/renderer/`
- `.env*` files are gitignored — API keys go there
