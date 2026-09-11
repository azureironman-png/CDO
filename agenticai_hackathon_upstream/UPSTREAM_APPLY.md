# Apply this UI-agent reference to `shashankwv/agenticai_hackathon`

This folder is a full export of feature branch
`cursor/ui-agent-cdo-reference-f328` prepared for
https://github.com/shashankwv/agenticai_hackathon

The cloud agent could not push to that remote (403 — no collaborator write access).

## What was added

1. `references/cdo_customer_ui/` — Angular **Customer Data Essentials** UI baseline
2. `agents/agent_02_ui.py` — Agent 02 now evolves that Angular UI from JIRA/schema updates
3. `agents/ui_reference_loader.py` — parse/apply Agent 02 file bundles
4. Docs: `docs/ui_agent_reference.md`, updated architecture flowchart + README

## Apply upstream (you need write access / a fork)

```bash
git clone https://github.com/shashankwv/agenticai_hackathon.git
cd agenticai_hackathon
git checkout -b cursor/ui-agent-cdo-reference-f328

# Option A: copy this export
rsync -a --delete /path/to/CDO/agenticai_hackathon_upstream/ ./
# (keep .git)

# Option B: apply the patch from artifacts
git am /path/to/0001-Add-CDO-Angular-UI-as-Agent-02-reference-baseline.patch

git push -u origin cursor/ui-agent-cdo-reference-f328
# then open a PR into main
```

## Flow

JIRA requirement → Agent 01 (schema) → Agent 02 reads `references/cdo_customer_ui` → emits Angular file updates into `ProjectState.ui_code`.
