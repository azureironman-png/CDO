# Agentic AI Hackathon

Multi-agent MDM pipeline:

1. **Agent 01 — Requirements**: JIRA/business text → entity schema
2. **Agent 02 — UI**: evolves the Angular **Customer Data Essentials** UI under `references/cdo_customer_ui`
3. **Agent 03 — ETL**: middleware transform code
4. **Agent 04 — MDM**: DDL / governance

## UI reference for Agent 02

The Angular app in [`references/cdo_customer_ui`](references/cdo_customer_ui) is the baseline Customer UI
(search results, account details, Legal/Primary address tabs, contacts, tax, cards, enquiry).

See:

- [`references/cdo_customer_ui/UI_AGENT.md`](references/cdo_customer_ui/UI_AGENT.md)
- [`docs/ui_agent_reference.md`](docs/ui_agent_reference.md)

When a new field arrives from JIRA via Agent 01, Agent 02 proposes Angular file updates against that reference.
