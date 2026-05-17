# Demo recording script (Loom, 2–3 minutes)

Goal: prove the prototype works end-to-end without showing any real API keys. Record with `MOCK_MODE=true` so nothing hits Meta or OpenAI.

## Setup before recording

```bash
cp .env.example .env       # leave MOCK_MODE=true
npm run install:all
# terminal 1
npm run dev:server         # http://localhost:3000
# terminal 2
npm run dev:admin          # http://localhost:5173
```

Open two browser windows side by side:
- Left: the React admin at http://localhost:5173
- Right: a terminal tailing the server logs

## Script (read aloud while recording)

**0:00 — Hook (15s)**
"Hi, this is a 2-minute walkthrough of an AI-powered WhatsApp support agent I built. It uses Meta's WhatsApp Cloud API, OpenAI for smart replies, and ships with an admin console for managing conversations and auto-reply rules."

**0:15 — Architecture (20s)**
Show `docs/architecture.svg` on screen.
"Inbound WhatsApp messages hit the Express webhook. The orchestrator first checks for handoff keywords, then runs keyword rules for instant canned answers, and finally falls back to OpenAI with the recent conversation history as context. Everything is persisted to a local JSON store for the demo — production swaps in Postgres."

**0:35 — Send a rule-matched message (25s)**
Open the **Simulator** tab. Type `What are your business hours?` → click Simulate.
"Watch the server log on the right — the orchestrator matched the 'Business hours' rule, so it replied instantly without calling OpenAI. That keeps cost down and response time under a second for common questions."

Switch to the **Conversations** tab and open the new thread.
"The conversation now shows up here, with the source of each reply labeled — `rule`, `ai`, or `human`."

**1:00 — Send an LLM-handled message (30s)**
Back to Simulator → `Hi, do you ship to Japan and how long does it take?`.
"This one doesn't match any rule, so it falls through to OpenAI. In mock mode it returns a stub reply, but with a real `OPENAI_API_KEY` set, this is the GPT-4o-mini response."

**1:30 — Handoff (20s)**
Send `Can I speak to a human agent?` from the simulator.
"'human' is one of the configured handoff keywords, so the agent automatically pauses and flags the conversation. On the right you can see the orange HANDOFF badge."

In the conversation pane, type a reply as the human operator and click Send.
"Human messages are sent via the same outbound endpoint as AI messages — the customer doesn't see any seam."

**1:50 — Admin: rules + prompt (20s)**
Click **Auto-reply rules**.
"Non-technical staff can add or edit rules right here — name, keywords, reply text."
Click **Agent settings**.
"And this is the system prompt — change tone, persona, or escalation policy without touching code."

**2:10 — Close (15s)**
"To go live, the only setup is plugging in a Meta WhatsApp Business phone number and an OpenAI key in `.env`. The codebase is clean, MIT-licensed, and ready to extend with HubSpot / CRM hooks. Happy to walk through the code or jump on a call. Thanks!"

---

## Recording checklist
- [ ] `.env` has `MOCK_MODE=true` (no real keys visible)
- [ ] Browser zoom 110% so text reads on Loom
- [ ] Mic check
- [ ] Close personal tabs
- [ ] Re-record any cut where you say "uh" more than twice
