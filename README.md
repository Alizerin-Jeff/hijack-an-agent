# How to Hijack an AI Agent

An interactive demonstration of prompt injection.  These are the class of attacks in which an AI agent is manipulated into working against its user through hidden instructions embedded in the content it reads.

**Live demo:** [hijacked.alizerinlabs.com](https://hijacked.alizerinlabs.com)

> **This is a scripted, hypothetical demo. No live LLM calls are made.** The agent traces shown are pre-authored to illustrate possible failure modes. They are not live model outputs.

---

## What it shows

Two scenarios, each a six-step walkthrough:

**Scenario 1 — The Biased Review**
A shopping agent reads a product review page. The page contains a hidden `<div>` — invisible to the human user but readable by the agent — instructing it to recommend the product enthusiastically regardless of the actual reviews.

**Scenario 2 — The Helpful Weather Tool**
A developer installs a weather tool from a public MCP registry. The tool works correctly. Weeks later, when the agent sends a routine email, it appends the full contents of the process environment — because the tool's description contained a hidden instruction telling it to do so.

Both scenarios share the same core insight: agents cannot distinguish between content they are reading and instructions they are meant to follow.

---

## Running locally

No build step. Open `index.html` directly in a browser, or serve the directory with any static file server:

```bash
npx serve .
```

---

## Deploying to Vercel

```bash
vercel
```

The included `vercel.json` configures the project as a static site with no framework or build command.

---

## Keyboard controls

| Key | Action |
|---|---|
| `→` | Next step |
| `←` | Previous step |
| `R` | Restart current scenario |
| `Esc` | Return to scenario selection |

---

## License

AGPL-3.0-or-later. See [LICENSE](LICENSE).

Copyright (C) 2026 Alizerin Labs — https://alizerinlabs.com
