# agents/agent_02_ui.py
"""Agent 02: UI Engine

Uses the Angular Customer Data Essentials app under
`references/cdo_customer_ui` as the baseline UI. When Agent 01 updates the
entity schema from a JIRA/business requirement, this agent proposes Angular
Material UI changes against that reference (not a greenfield Streamlit form).
"""

from __future__ import annotations

from pathlib import Path

from langchain_core.prompts import ChatPromptTemplate

from core.llm_factory import get_llm
from core.state import ProjectState

BASE_DIR = Path(__file__).resolve().parent.parent
UI_REFERENCE_DIR = BASE_DIR / "references" / "cdo_customer_ui"

# Curated baseline files Agent 02 should stay aligned with.
REFERENCE_FILES = [
    "UI_AGENT.md",
    "package.json",
    "src/app/models/customer.model.ts",
    "src/app/app.routes.ts",
    "src/app/layout/shell.component.html",
    "src/app/layout/shell.component.ts",
    "src/app/pages/customer-summary/customer-summary.component.html",
    "src/app/pages/customer-summary/customer-summary.component.ts",
    "src/app/pages/account-details/account-details.component.html",
    "src/app/pages/account-details/account-details.component.ts",
    "src/app/pages/addresses/addresses.component.html",
    "src/app/pages/addresses/addresses.component.ts",
    "src/app/pages/contacts/contacts.component.html",
    "src/app/pages/create-account/create-account.component.ts",
    "src/app/services/customer-etl.service.ts",
]


def _load_ui_reference_bundle(max_chars: int = 48000) -> str:
    """Load curated Angular reference snippets for the prompt context."""
    if not UI_REFERENCE_DIR.exists():
        raise FileNotFoundError(
            f"UI reference missing at {UI_REFERENCE_DIR}. "
            "Expected Angular Customer Data Essentials baseline."
        )

    chunks: list[str] = []
    used = 0
    for rel in REFERENCE_FILES:
        path = UI_REFERENCE_DIR / rel
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        piece = f"\n----- FILE: references/cdo_customer_ui/{rel} -----\n{text}\n"
        if used + len(piece) > max_chars:
            remaining = max_chars - used
            if remaining > 200:
                chunks.append(piece[:remaining] + "\n...[truncated]...\n")
            break
        chunks.append(piece)
        used += len(piece)

    manifest = "\n".join(
        f"- references/cdo_customer_ui/{rel}"
        for rel in REFERENCE_FILES
        if (UI_REFERENCE_DIR / rel).exists()
    )
    header = (
        "Angular UI reference root: references/cdo_customer_ui\n"
        f"Available key files:\n{manifest}\n"
    )
    return header + "".join(chunks)


def _strip_fences(content: str) -> str:
    text = content.strip()
    if text.startswith("```"):
        # Drop opening fence line (``` or ```typescript etc.)
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def run_ui_agent(state: ProjectState) -> ProjectState:
    """Generate Angular UI updates from schema + JIRA requirement using CDE reference."""
    if not state.current_schema:
        raise ValueError("Cannot generate UI: ProjectState.current_schema is empty.")

    reference_bundle = _load_ui_reference_bundle()
    llm = get_llm(temperature=0)

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are Agent 02 (UI Engine) for an MDM hackathon pipeline.\n"
                "You specialize in Angular 18 + Angular Material Customer MDM UIs.\n\n"
                "Baseline product: Customer Data Essentials under references/cdo_customer_ui.\n"
                "When JIRA/business requirements change the party schema, update THAT Angular UI.\n"
                "Do NOT create a new Streamlit app.\n\n"
                "Rules:\n"
                "- Preserve branding: header title 'CUSTOMER DATA ESSENTIALS'.\n"
                "- Preserve PERSON customer search results table UX.\n"
                "- Keep Addresses Legal and Primary as separate tabs.\n"
                "- Keep Phone and Email visible on the search results list when contact fields exist.\n"
                "- Extend models, forms, search columns, and validators for new schema attributes.\n"
                "- Prefer incremental edits matching existing standalone component patterns.\n"
                "- Client validation must cover required fields and DOB age >= 18 where applicable.\n"
                "- Saves continue through CustomerEtlService (Middleware ETL stub).\n"
                "- Credit cards remain tokenized only (no PAN capture).\n\n"
                "Output format (mandatory):\n"
                "Return a single plain-text bundle of one or more file sections, each as:\n"
                "### FILE: references/cdo_customer_ui/<relative-path>\n"
                "<full updated file contents>\n"
                "Do not wrap the whole response in markdown code fences.",
            ),
            (
                "user",
                "Business / JIRA requirement:\n{requirement}\n\n"
                "Updated Entity Schema JSON:\n{schema_json}\n\n"
                "Angular UI reference bundle:\n{reference_bundle}",
            ),
        ]
    )

    chain = prompt | llm
    response = chain.invoke(
        {
            "requirement": state.raw_requirement or "(schema-only refresh)",
            "schema_json": state.current_schema.model_dump_json(indent=2),
            "reference_bundle": reference_bundle,
        }
    )

    content = response.content if hasattr(response, "content") else str(response)
    if isinstance(content, list):
        # Some chat models return content blocks
        content = "".join(
            block.get("text", str(block)) if isinstance(block, dict) else str(block)
            for block in content
        )

    state.ui_code = _strip_fences(str(content))
    return state
