# Agent Quality Monitor

A fully functional, single-file HTML prototype for monitoring AI agent health, query confidence, flagged responses, and escalation workflows in enterprise data environments.

Built to solve the **Enterprise Trust Gap** — the "Day 2" problem where companies deploy AI agents on their data but have no visibility into when those agents silently degrade, return wrong answers, or drift after schema changes.

---

## Live Demo

Open `agent_quality_monitor.html` directly in any browser. No build step, no dependencies, no server required.

```bash
open "agent_quality_monitor.html"
```

> Requires an internet connection for Chart.js (CDN) and Google Fonts to render correctly.

---

## The Problem This Solves

| Pain Point | Impact |
|---|---|
| **Invisible degradation** | When a data schema changes, AI agents silently return wrong answers. Users trust them anyway. |
| **No operator surface** | Enterprise admins have no "cockpit" to see which agents are healthy, failing, or why. |
| **Compliance risk** | In regulated industries, a bad AI response isn't just a bug — it's a legal liability. |
| **No feedback loop** | Every failure is wasted learning. There's no mechanism to turn mistakes into model improvements. |

---

## Features

### Navigation
- **Sticky nav bar** with 5 views: Overview, Agents, Flags, Escalations, Settings
- **LIVE indicator** with a real-time refresh counter (counts up every second)
- **HIPAA · GDPR · SOC2 compliance tag** with hover tooltip showing active protections
- **Sidebar** with agent health counts and data source links — clicking any filter navigates to the Agents view

### Overview Dashboard

#### KPI Cards
| Card | What it shows |
|---|---|
| Overall Accuracy | Workspace-wide accuracy score with week-on-week delta |
| Open Flags | Count of flagged queries needing review — updates live as flags are resolved |
| Escalations | Count of queries escalated to the data team — decrements on resolution |
| Queries Today | Total query volume for context (denominator for all other metrics) |

#### 7-Day Accuracy Trend
- Line chart (Chart.js) showing daily overall accuracy across all agents for the past week
- Hover tooltips show exact accuracy per day

#### Confidence Threshold Slider
- Drag to set the minimum confidence score (50–95%) before a response is flagged or suppressed
- Three live counters update instantly: **suppressed**, **flagged**, **ok**
- Business impact line calculates how many queries/day would be affected at the current threshold
- The flag list below filters automatically as you move the slider

#### Agent Performance Table
- One row per agent with animated accuracy bar, color-coded status dot, and week-on-week trend
- `⚡ schema change` badge appears inline on agents with detected schema drift
- Click any row to open the **Agent Detail panel**

#### Active Flags Panel
- 5 system-level alerts with severity badges (CRIT, HIGH, MED, INFO)
- Click any alert to open the linked Flag Detail panel
- **Clear resolved →** hides resolved flags from the list

#### Flagged Queries List
- 7 individual user queries that fell below the confidence threshold
- Color-coded confidence pills (red < 65%, amber 65–80%, green > 80%)
- Shows disposition per query: suppressed / flagged / pending review / escalated / resolved
- Click any row to open the **Flag Detail panel**
- Empty success state shown when all flags are resolved

#### Escalation Workflow
- Visual 4-step pipeline: Score → Threshold check → Notify data team → Retrain & resolve
- **Configure →** navigates to the Settings view

---

### Agent Detail Panel (slide-in)
Opens when clicking any agent row or card.

- 8-week accuracy line chart (Chart.js) with color matching agent health status
- Metadata: data source, current accuracy, week-on-week trend, last retrained timestamp, status
- `⚡ schema change detected` badge if schema drift is active
- **Retrain context** — queues a context retrain, shows toast confirmation
- **Set alert** — opens the Configure Alert modal pre-filled with the agent name

---

### Flag Detail Panel (slide-in)
Opens when clicking any flagged query row or active flag item.

- Full query text displayed in a highlighted block
- Metadata: agent, requesting user, timestamp, disposition
- Visual confidence gauge bar colored by severity
- **Root cause** — explains exactly why confidence was low (schema drift, missing context, wrong data source, partition gap, ambiguous metadata)
- **Suggested fix** — pre-written correction for the data team
- **Mark Resolved** — updates flag status, decrements Open Flags counter, queues correction for retraining
- **Escalate to data team** — routes flag to escalation inbox
- **Dismiss** — marks resolved without escalation
- Resolved / Escalated badge replaces action buttons once actioned

---

### Agents View
Full agent registry with search and filter.

- **Search bar** — filters agents by name or data source in real time
- **Filter chips** — All / Healthy / Warning / Degraded
- **Sidebar filters** — clicking Degraded, Warning, or any data source navigates here and pre-filters
- Agent cards show: accuracy bar, status, trend, last retrained timestamp
- Per-card actions: **Retrain** (toast confirmation) and **Set alert** (opens modal)
- **+ Configure Alert** button in page header

---

### Flags View
Full list of all 7 flagged queries (same data as Overview, always shows all regardless of threshold).

- **Export Report** — downloads `agentiq_flags_report.csv` with all flags, confidence scores, and current resolution status

---

### Escalations View
Live inbox of queries that have been escalated to the data team.

- Populates dynamically from flag state — only shows queries with `escalated` status
- Shows query text, root cause, agent, user, confidence score
- Per-item actions: **Mark resolved** and **Dismiss** with toast confirmations
- Empty state when inbox is clear

---

### Settings View

#### Confidence Thresholds
- Global threshold slider (synced with Overview slider — moving one moves the other)
- Suppression floor dropdown (default: suppress below 60%)
- Flag window dropdown (real-time or batched)

#### Notification Routing
- Slack webhook URL input
- Alert email input
- Notify-on-severity dropdown (CRIT+HIGH only / CRIT+HIGH+MED / All)

#### Compliance & Audit
- Toggle: HIPAA audit logging (retain flagged queries 90 days)
- Toggle: GDPR data residency (restrict to EU nodes)
- Toggle: SOC 2 event logging (log all admin actions)
- Toggle: Export on resolve (auto-export CSV on flag resolution)

#### Role-Based Access
- User list with roles: admin / reviewer / viewer
- **+ Invite team member** button with toast confirmation

#### Save Changes
- **Save Changes** button with toast confirmation

---

### Configure Alert Modal
Opens from `+ Configure Alert` (nav, Overview, Agents view) or `Set alert` in Agent Detail panel.

- Agent selector (pre-fills if opened from Agent Detail)
- Metric selector: accuracy drops below / flag rate exceeds / schema change detected / null join rate exceeds
- Threshold number input
- Notify via: Slack / Email / Slack + Email / In-app only
- Slack channel input
- Severity selector
- Save with toast confirmation

---

### Export
- Downloads `agentiq_flags_report.csv`
- Columns: Query, Agent, User, Time, Confidence, Disposition, Status
- Available from Overview and Flags view
- Shows toast confirmation on download

---

## Data Model

### Agents
```js
{
  id: string,
  name: string,            // e.g. 'Revenue Analyst'
  type: string,            // e.g. 'Snowflake · Finance'
  acc: number,             // current accuracy % (0–100)
  trend: string,           // week-on-week delta e.g. '+0.8%'
  trendUp: boolean,
  status: 'green' | 'amber' | 'red',
  schemaAlert: boolean,    // true if schema drift detected
  lastRetrained: string,   // e.g. '3 days ago'
  history: number[]        // 8-week accuracy history for chart
}
```

### Flagged Queries
```js
{
  id: string,
  query: string,           // the original user question
  agent: string,           // which agent handled it
  user: string,            // who asked (email or bot name)
  time: string,            // relative timestamp
  conf: number,            // confidence score 0–100
  disposition: string,     // 'suppressed' | 'flagged' | 'pending review'
  reason: string,          // root cause explanation
  suggestion: string       // suggested fix for the data team
}
```

### State
```js
{
  flagStatuses: {},        // { flagId: 'open' | 'resolved' | 'escalated' }
  threshold: 80,           // current confidence threshold
  agentFilter: 'all',      // current sidebar/chip filter
  agentSearch: '',         // current search query
  resolvedCount: 41,       // running total of resolved flags (for sidebar)
  agentChart: null,        // active Chart.js instance in agent panel
  trendChart: null,        // active Chart.js instance in overview
  refreshSeconds: 0        // live counter for "last refreshed" timestamp
}
```

---

## How Confidence Scoring Works

Every query is scored by the AI engine before the response reaches the user:

```
Score >= threshold (default 80%)  →  Delivered normally         ✓
Score 60% – threshold             →  Delivered with warning     ⚠️
Score < 60%                       →  Suppressed entirely        🔇
```

The threshold is configurable per workspace. Moving it higher catches more uncertain responses but suppresses more answers. The business impact line on the slider quantifies this trade-off in queries/day.

---

## Escalation Flow

```
1. Query received & scored
   └── Adaptive Context Engine assigns confidence score

2. Threshold check
   └── >= threshold → delivered
   └── 60–threshold → warning label
   └── < 60% → suppressed

3. Data team notified
   └── Slack / email with query, root cause, suggested fix

4. Context retrained & resolved
   └── Approved fix feeds back into the engine
   └── Accuracy delta tracked per correction cycle
```

---

## Compliance

| Standard | What's implemented |
|---|---|
| **HIPAA** | All flagged queries retained in audit log for 90 days |
| **GDPR** | EU data residency toggle, data minimization controls |
| **SOC 2 Type II** | Admin action logging, single-tenant architecture, row/column-level security |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, grid, flexbox, animations) |
| Charts | [Chart.js 4.4.1](https://www.chartjs.org/) via CDN |
| Fonts | [DM Sans + DM Mono](https://fonts.google.com/) via Google Fonts |
| Logic | Vanilla JavaScript (no framework, no build step) |
| Data | Hardcoded JS arrays (no backend) |

---

## Project Structure

```
AgentQualityMonitor/
├── wisdomai_agent_monitor_prototype (1).html   # entire app — single file
├── .gitignore
└── README.md
```

---

## Agents in the Demo

| Agent | Data Source | Domain | Accuracy | Status |
|---|---|---|---|---|
| Revenue Analyst | Snowflake | Finance | 97% | ✅ Healthy |
| GTM Pipeline | Salesforce | Sales | 94% | ✅ Healthy |
| Creator Retention | BigQuery | Product | 88% | ⚠️ Warning |
| Support Triage | Postgres | CX | 79% | 🔴 Degraded |
| Ads Attribution | BigQuery | Growth | 76% | 🔴 Degraded |
| Membership Forecast | Snowflake | Finance | 95% | ✅ Healthy |

Support Triage and Ads Attribution both have active `⚡ schema change` alerts explaining their degradation.

---

## Flagged Queries in the Demo

| Query | Agent | Confidence | Root Cause |
|---|---|---|---|
| Q4 ad spend by campaign type | Ads Attribution | 58% | Schema drift — `bigquery_ads` column removed |
| Churn by creator tier (90 days) | Creator Retention | 72% | `creator_tier` dimension missing from context |
| Support tickets resolved same-day | Support Triage | 63% | Null join — Postgres partition gap Dec 1–4 |
| GTM reps above quota in Q3 | GTM Pipeline | 61% | 3 competing definitions of `quota_target_usd` |
| Membership revenue forecast | Membership Forecast | 85% | Stale macro parameters from Q1 2024 |
| P95 latency for video uploads | Support Triage | 54% | Wrong data source — latency data is in Datadog |
| Creator retention YoY by genre | Creator Retention | 77% | `genre` dimension predates historical data range |

---

## Author

**Neharika Srivastav**
Product Manager · [github.com/neharikasrivastav](https://github.com/neharikasrivastav)
