# ⚡ aktivelocal — Lite Local Events & WebMCP Superpowers

> Built for **Devpost's "The WebMCP Challenge"** (OpenAI, Google Chrome, Netlify, Cloudflare, Shopify, Vercel).

**aktivelocal** is a minimalist, agent-native local events web application. It eliminates messy groups, inactive forums, and UI bloat, focusing exclusively on **active local events**, dynamic 7-day horizons, and **WebMCP (Web Model Context Protocol)** agent tools.

---

## 🌟 The WebMCP Philosophy: Agent Composition Over UI Bloat

Traditional event platforms suffer from severe feature bloat: complex recurring event rule builders, multi-step wizards, and heavy configuration panels.

**aktivelocal takes the radical WebMCP approach**:
1. **Atomic Native Primitives**: The web app intentionally provides only simple, lightweight single-event CRUD tools (`create_event`, `search_events`, `rsvp_event`, `get_event_details`).
2. **Autonomous Agent Synthesis (Recurring Events)**: When a user prompts an AI agent:
   > *"Schedule a sunset 5K run every Thursday at 6:30 PM for the next 4 weeks"*
   
   The AI agent uses WebMCP tools to dynamically orchestrate and synthesize the recurring series on top of the web app without requiring a single line of bloated native recurring-event UI code!
3. **Autonomous Weekend Itinerary Planning**: When a user asks:
   > *"Plan my Saturday with an active morning workout and an evening social event under 5 miles, and RSVP me."*

   The AI agent queries the 50-mile radius tool, calculates time slots, avoids conflicts, and auto-RSVPs in a single continuous agentic loop.

---

## 🚀 Key Features & Layout Architecture

- **Minimalist Top Bar & Profile Drawer**:
  - Profile avatar button in top-left opening a slide-out drawer with a deterministic **400×400 px DiceBear SVG avatar**, Display Name, Email, Birth Year, Permanent Location, and 1-click persona switchers.
- **Two-Tone Brand Identity**: `aktivelocal` (cyan `#06b6d4` + coral `#f97316`).
- **Two Primary Tabs**: `[ Search ]` and `[ My Events ]`.
- **Search Tab Flow**:
  - **Search Bar**: Instant 0ms in-memory fuzzy filtering on keystrokes.
  - **Map Pin Button**: Sets search location (stored strictly in device `localStorage`, does not alter permanent profile).
  - **Dynamic 7-Day Horizon**: Dynamic pills (`Today (9/3)`, `Tomorrow (9/4)`, `Saturday (9/5)`, etc.) that trigger 50-mile radius queries.
- **Event Feed & 2-Line Minimalist Cards**:
  - **1st Item**: Always a prominent `+ Create Event` action card.
  - **Event Cards**:
    - **Line 1**: Event Title
    - **Line 2**: `[Time] • [Distance (x mi away)] • [# Attending]`
- **Event Read & Form Modals**:
  - Read view with date, time, distance, description, attendee chips, and **RSVP Toggle** (with cancellation confirmation popup).
  - Creator permission enforcement: Only event creators see the `[Edit Event]` and `[Delete Event]` actions.
- **Interactive WebMCP Agent Dock**:
  - Embedded floating assistant with **1-Click Judge Scenarios** and a **Live JSON-RPC Protocol Stream** showing tool calls, inputs, outputs, and DOM updates in real time.

---

## 🛠️ WebMCP Tool Specifications

aktivelocal implements the official **WebMCP Browser Standard** (`navigator.modelContext` / `window.mcp`):

| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `get_active_profile` | `{}` | Retrieves active user profile (email, name, permanent location). |
| `search_events` | `{ query, date, radius_miles }` | Queries events within 50 miles for a given day. |
| `get_event_details` | `{ event_id }` | Fetches complete event metadata and attendee list. |
| `create_event` | `{ title, datetime, location, description, duration_minutes }` | Creates a single atomic local event. |
| `rsvp_event` | `{ event_id, action }` | RSVPs or cancels RSVP for the active user. |
| `create_recurring_series` | `{ title, day_offset_start, hour, minute, weeks_count, location, description }` | **Agent Superpower**: Synthesizes multi-week recurring series via atomic tools. |
| `plan_weekend_itinerary` | `{ target_weekend_day_offset, vibes, auto_rsvp }` | **Agent Superpower**: Autonomous multi-step weekend planner & auto-RSVP. |

---

## 💻 Local Development & Deployment

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev

# 3. Build for production
npm run build
```

### Deploying to Vercel
```bash
# Connect repo to Vercel or run:
npx vercel --prod
```

---

## 🏆 Devpost Hackathon Submission Checklist
- [x] Working Live App on Vercel
- [x] Standard WebMCP Integration (`navigator.modelContext`)
- [x] Built-in Interactive WebMCP Tool Inspector for Judges
- [x] Full Mobile & Desktop Responsive Design
- [x] Comprehensive Documentation & Architecture Diagrams
