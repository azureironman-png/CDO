# Apply to shashankwv/agenticai_hackathon

This export includes the LangGraph pipeline + Angular UI reference for Agent 02.

```bash
git clone https://github.com/shashankwv/agenticai_hackathon.git
cd agenticai_hackathon
git checkout -b cursor/ui-agent-cdo-reference-f328
rsync -a /path/to/CDO/agenticai_hackathon_upstream/ ./
git add -A
git commit -m "Add LangGraph pipeline and CDO Angular UI reference for Agent 02"
git push -u origin cursor/ui-agent-cdo-reference-f328
```

Run:

```bash
python run_pipeline.py "Add aadhaar_no as VARCHAR(12) required field"
python run_pipeline.py "Add alternate_phone as VARCHAR(20)" --apply-ui
```
