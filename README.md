# PromptGuru — Bulk AI Prompt Generator

PromptGuru is an AI-powered prompt toolkit: turn images or ideas into powerful,
ready-to-use AI prompts automatically.

## Features

- **Bulk Image Prompt Generator** — upload up to 100 images, generate prompts instantly
- **Idea to Prompt Generator** — turn any concept into dozens of AI-ready prompts
- **Prompt Library** — browse curated prompts by category
- **Prompt tools** — Improver, Variations, Expander, Fixer, Translator, Brainstormer
- **Silhouette Prompt Finder** — microstock-style silhouette prompts
- **TXT / CSV export** — download prompts with titles and keywords
- **Bring-your-own-key** — Gemini and Groq API keys, stored only in your browser's localStorage

## Tech

Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui + React Router.

## Run locally

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Deploy

Any static host works (Vercel, Netlify, Cloudflare Pages): build output is `dist/`.
No server or environment variables required — API keys are entered in the
app's Settings page by each user.
