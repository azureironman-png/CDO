# Agentic AI Hackathon

Multi-agent MDM pipeline orchestrated with **LangGraph**:

```text
JIRA / business requirement
        │
        ▼
┌───────────────────┐
│ Agent 01          │  Requirements → EntitySchema
│ requirements      │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Agent 02 (UI)     │  Evolves Angular Customer Data Essentials
│ ui                │  reference: references/cdo_customer_ui
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Agent 03          │  ETL transform code
│ etl               │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Agent 04          │  MDM DDL / upsert SQL
│ mdm               │
└───────────────────┘
```

## Run with LangGraph

```bash
pip install -r requirements.txt
# set GEMINI_API_KEY / GROQ_API_KEY / OPENAI_API_KEY in .env

python run_pipeline.py "Add aadhaar_no as VARCHAR(12) required field"

# optional: write Agent 02 Angular file updates into the reference app
python run_pipeline.py "Add alternate_phone as VARCHAR(20)" --apply-ui
```

Programmatic:

```python
from graph.pipeline import run_mdm_pipeline

state = run_mdm_pipeline("Add risk_rating as VARCHAR(10) required field")
print(state.current_schema)
print(state.ui_code[:500])
```

## UI reference for Agent 02

The Angular app in [`references/cdo_customer_ui`](references/cdo_customer_ui) is the baseline Customer UI
(search results, account details, Legal/Primary address tabs, contacts, tax, cards, enquiry).

See:

- [`references/cdo_customer_ui/UI_AGENT.md`](references/cdo_customer_ui/UI_AGENT.md)
- [`docs/ui_agent_reference.md`](docs/ui_agent_reference.md)
- [`docs/langgraph_pipeline.md`](docs/langgraph_pipeline.md)

When a new field arrives from JIRA via Agent 01, Agent 02 proposes Angular file updates against that reference inside the LangGraph `ui` node.
