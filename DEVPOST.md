# aktivelocal — WebMCP Powered Local Sports & Community Platform

## Inspiration

Traditional community and event platforms suffer from heavy administrative overhead, clunky recurring event setup interfaces, and disconnected AI experiences that cannot actually interact with live web applications. When organizing local activities—from spontaneous 5K sunset runs to weekend bouldering sessions—users are forced through tedious multi-step form wizards, while AI assistants remain passive chatbots trapped in separate browser tabs.

With the emergence of the **WebMCP (Model Context Protocol)** standard, web applications can now expose native, structured capabilities directly to AI agents. We envisioned **aktivelocal**: a lightning-fast local community event discovery platform designed from the ground up for both human athletes and autonomous browser agents. By bridging client-side WebMCP standards with serverless cloud infrastructure, **aktivelocal** empowers AI agents to seamlessly discover, schedule recurring series, and plan active itineraries alongside human community members.

---

## What it does

**aktivelocal** is a real-time local sports and community event discovery platform centered around a dynamic **7-day horizon** and a **50-mile geographic radius**:

1. **Autonomous WebMCP Integration**: Implements the WebMCP standard (`navigator.modelContext` & `window.mcp`) with 7 tools—allowing AI agents (ChatGPT, Chrome WebMCP Extension, Claude) to query events, create single or recurring meetups, and execute intelligent RSVPs.
2. **Dynamic 7-Day Rolling Horizon**: Groups and filters activities across today and the next 6 days with day-pill navigation, sub-millisecond in-memory filtering, and full `sessionStorage` persistence.
3. **50-Mile Radius Proximity Engine**: Computes exact distances from the user’s search location using the Haversine formula and OpenStreetMap Nominatim reverse geocoding.
4. **Passwordless Cloud Identity**: Simple email-based passwordless identity backed by Neon Postgres, complete with 1-click persona switchers for judges, avatar personalization, and zero session lag.
5. **Interactive WebMCP Inspector Dock**: A built-in protocol HUD featuring live JSON-RPC telemetry logs and 1-click autonomous agent scenarios (e.g., *Synthesizing 4-Week Series*, *Planning Saturday Itineraries & Auto-RSVPing*).
6. **Unified Dual Feeds**: Seamlessly toggles between local discovery search and **"My Events"** (tracking hosted meetups and active RSVPs).

---

## How we built it

- **Frontend & UI**: React 18 with Vite, Tailwind CSS, Lucide Icons, and custom glassmorphic styling optimized for 60fps responsiveness.
- **WebMCP Core**: Registered 7 tool schemas on `navigator.modelContext` and `window.mcp` covering `get_active_profile`, `search_events`, `get_event_details`, `create_event`, `rsvp_event`, `create_recurring_series`, and `plan_weekend_itinerary`.
- **Backend & Database**: **Neon Serverless Postgres** via `@neondatabase/serverless` hosted on **Vercel Serverless Functions**, handling dynamic schema migrations, relational RSVP mapping, and user identity lookups.
- **Geolocation & Mapping**: Geolocation API paired with OpenStreetMap Nominatim for address suggestions, reverse geocoding, and distance calculations.
- **State & Offline Resilience**: Dual-tier architecture featuring direct serverless database queries with automatic local storage caching fallback.

---

## Challenges we ran into

1. **Dual-Model WebMCP Tool Execution**: Ensuring WebMCP tools worked identically whether triggered via external browser extensions/chat agents or executed through the internal React inspector dock. We resolved this by unifying the execution bus with custom event dispatchers (`aktivelocal:datachange`).
2. **Timezone & Horizon Synchronization**: Handling rolling UTC timestamps versus local browser timezone offsets across the 7-day pill bar so newly scheduled events immediately land in the correct day bucket.
3. **Zero-Latency Database & Cache Sync**: Balancing instant optimistic UI updates with persistent cloud database writes in serverless environments, ensuring newly created events appear instantly across search feeds and user profile views.

---

## Accomplishments that we're proud of

- **True Agentic Superpowers**: Instead of building bloated UI forms for recurring event management, we delegated recurrence synthesis entirely to the WebMCP agent (`create_recurring_series`), which intelligently creates individual atomic events across consecutive weeks.
- **Production-Ready Neon Integration**: Deployed a fully operational serverless Postgres database with automatic table provisioning, relational foreign-key integrity, and real-time RSVP cascades.
- **Developer & Judge Experience**: Created the floating **WebMCP Dock**, giving judges transparent visibility into real-time JSON-RPC request/response payloads, latency metrics, and 1-click executable demo scenarios.
- **Rich Silicon Valley & Bay Area Seed Dataset**: Pre-populated with dozens of realistic events across Santa Clara, San Jose, Mountain View, Milpitas, and Sunnyvale.

---

## What we learned

- **WebMCP is the Future of Web Apps**: Exposing structured agent tools turns web applications into programmable environments where AI models can act as intelligent personal assistants rather than mere text generators.
- **Serverless Postgres Performance**: Neon's WebSocket-based connection pooling delivers near-zero latency for serverless API endpoints, making relational cloud databases viable for high-frequency interactive apps.
- **Agent-First Schema Design**: Designing database models with atomic simplicity makes it easier for LLMs to reason about, orchestrate, and validate complex workflows without hallucinating state.

---

## What's next for aktivelocal

- **Agentic Route Optimization**: Extending WebMCP tools to generate carpool coordination and public transit routes for attendees traveling to community events.
- **Live Group Chat & Broadcasts**: Adding WebMCP-managed notification agents that ping attendees about weather changes or meeting spot adjustments.
- **Federated Activity Sync**: Connecting aktivelocal to Strava, Apple Fitness, and Google Calendar via automated MCP bridges.
