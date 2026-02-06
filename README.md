# Spark

A local-first AI chatbot built entirely using spec-driven development.

Most AI tools either lock you into a monthly subscription or cap you on a free tier. Spark takes a different approach: bring your own API key, pay only for what you use. If your kid burns through a session of coding questions, it costs pennies. If nobody touches it for two weeks, it costs nothing. No subscriptions, no data leaving your machine, no vendor lock-in.

---

## Why Spark Exists

Every line of code in this repo was planned before it was written.

Not in a "we wrote a PRD" way. In a **"every file change was specified upfront, then verified against the spec after AI generated the code"** way.

This project was built using [Spec This](https://specthis.com) — a methodology and toolset for spec-driven development with AI coding tools. The work plans, file-level specs, and verification artifacts are included in this repo so you can see exactly how it was built — not just what was built.

---

## Features

- **Local-first** — Your API keys, your machine, your data
- **Multi-provider** — OpenAI, Anthropic, and more
- **Conversation management** — Create, continue, and organize chats
- **Extensible** — Clean architecture that's easy to fork and modify
- **Fully specced** — Every feature planned and verified against structured specs

---

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
| `npm run package` | Build and package a distributable app (output to `release/`) |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |

## Tech Stack

- **Electron** — desktop shell
- **TypeScript** — compiled to `dist/`, renderer HTML/CSS served from `src/renderer/`
- **Vanilla HTML/CSS** — no frontend framework

---

## The Spec This Methodology

Check out the `/specs` directory to see how this was built:

- **Work Plans** — High-level intent with acceptance criteria and non-goals
- **Work Items** — Each subtask with planned file changes specified upfront
- **Verification Notes** — How the AI output was checked against the plan

If you're using AI coding tools and finding yourself lost in walls of generated code, wondering if what got built matches what you meant — that's the problem Spec This solves.

[Learn more about Spec This](https://specthis.com)

---

## Contributing

This is an open project under the [Spec This GitHub Org](https://github.com/spec-this). Contributions welcome — but we practice what we preach. PRs should reference a work plan.

---

## License

MIT
