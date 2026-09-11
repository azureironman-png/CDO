# Agent 02 — UI reference wiring

```mermaid
flowchart LR
  Jira[JIRA / Confluence requirement] --> A1[Agent 01 Requirements]
  A1 -->|updates current_schema| State[(ProjectState)]
  Ref[references/cdo_customer_ui<br/>Angular Customer Data Essentials] --> A2[Agent 02 UI Engine]
  State --> A2
  A2 -->|writes ui_code / Angular file updates| State
  A2 -->|applies changes into| Ref
```

## Behavior

1. Agent 01 evolves `EntitySchema` from the business requirement.
2. Agent 02 loads the Angular baseline under `references/cdo_customer_ui`.
3. Agent 02 proposes Angular Material UI changes that implement the new fields
   while preserving CDE search UX (Legal/Primary address tabs, phone/email columns, etc.).
4. Generated output is stored on `ProjectState.ui_code` for review / apply.
