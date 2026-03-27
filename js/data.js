// ─── CONSTANTS ────────────────────────────────────────────
const DAILY_QUERIES = 1847;

// ─── AGENTS ───────────────────────────────────────────────
const agents = [
  { id:'a1', name:'Revenue Analyst',     type:'Snowflake · Finance',  acc:97, trend:'+0.8%', trendUp:true,  status:'green', schemaAlert:false, lastRetrained:'3 days ago',  history:[93,94,95,95,96,97,96,97] },
  { id:'a2', name:'GTM Pipeline',        type:'Salesforce · Sales',   acc:94, trend:'+0.1%', trendUp:true,  status:'green', schemaAlert:false, lastRetrained:'5 days ago',  history:[91,92,93,93,94,94,93,94] },
  { id:'a3', name:'Creator Retention',   type:'BigQuery · Product',   acc:88, trend:'−2.3%', trendUp:false, status:'amber', schemaAlert:false, lastRetrained:'9 days ago',  history:[95,94,93,92,91,90,89,88] },
  { id:'a4', name:'Support Triage',      type:'Postgres · CX',        acc:79, trend:'−5.1%', trendUp:false, status:'red',   schemaAlert:true,  lastRetrained:'14 days ago', history:[92,90,88,85,83,81,80,79] },
  { id:'a5', name:'Ads Attribution',     type:'BigQuery · Growth',    acc:76, trend:'−6.7%', trendUp:false, status:'red',   schemaAlert:true,  lastRetrained:'6 days ago',  history:[94,92,89,86,83,80,78,76] },
  { id:'a6', name:'Membership Forecast', type:'Snowflake · Finance',  acc:95, trend:'+0.4%', trendUp:true,  status:'green', schemaAlert:false, lastRetrained:'2 days ago',  history:[92,93,93,94,94,95,94,95] },
];

// ─── FLAGGED QUERIES ──────────────────────────────────────
const flagData = [
  { id:'f1', query:'"What was our Q4 ad spend by campaign type vs. attributed revenue?"', agent:'Ads Attribution',     user:'maya@patreon.com',  time:'9 min ago',  conf:58, disposition:'suppressed',    reason:'Schema drift on ads_spend table — bigquery_ads column removed Nov 14',                        suggestion:'Re-map column alias in semantic layer: ad_spend → campaign_spend_usd' },
  { id:'f2', query:'"Show churn by creator tier for the last 90 days"',                  agent:'Creator Retention',  user:'james@patreon.com', time:'41 min ago', conf:72, disposition:'pending review', reason:'Confidence below 80% — creator_tier dimension added recently without context update',         suggestion:'Add creator_tier to semantic context: free / paid / pro tiers' },
  { id:'f3', query:'"How many support tickets were resolved same-day last month?"',      agent:'Support Triage',     user:'support-bot',       time:'1 hr ago',   conf:63, disposition:'suppressed',    reason:'Null join on ticket_resolution_events — table partition gap Dec 1–4',                        suggestion:'Backfill partition gap or restrict query range to available data' },
  { id:'f4', query:'"Which GTM reps closed deals above quota in Q3?"',                  agent:'GTM Pipeline',       user:'sara@patreon.com',  time:'2 hr ago',   conf:61, disposition:'flagged',       reason:'Low confidence on quota field — quota_target_usd has 3 competing definitions in metadata',     suggestion:'Consolidate quota definition in Salesforce semantic layer' },
  { id:'f5', query:'"Forecast membership revenue for next 2 quarters"',                 agent:'Membership Forecast',user:'cfo@patreon.com',   time:'3 hr ago',   conf:85, disposition:'flagged',       reason:'Forecast model using stale macro parameters (updated Q1 2024)',                              suggestion:'Trigger macro refresh or note data vintage in response' },
  { id:'f6', query:'"What is the P95 latency for video uploads this week?"',            agent:'Support Triage',     user:'eng-bot',           time:'4 hr ago',   conf:54, disposition:'suppressed',    reason:'Agent queried wrong data source — latency data is in Datadog, not Postgres',                 suggestion:'Add routing rule: latency queries → Datadog connector' },
  { id:'f7', query:'"Compare paid creator retention YoY by genre"',                    agent:'Creator Retention',  user:'ana@patreon.com',   time:'5 hr ago',   conf:77, disposition:'flagged',       reason:'genre dimension added 8 months ago — historical data pre-dates it',                         suggestion:'Limit YoY comparison to post-genre-launch date with user note' },
];
