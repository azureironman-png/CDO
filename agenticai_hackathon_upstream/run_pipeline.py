#!/usr/bin/env python3
"""CLI entrypoint for the LangGraph MDM multi-agent pipeline.

Example:
  python run_pipeline.py "Add aadhaar_no as VARCHAR(12) required field"

Agent 02 updates the Angular Customer Data Essentials UI reference based on
the schema produced by Agent 01 from the JIRA/business requirement.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from graph.pipeline import run_mdm_pipeline  # LangGraph runner


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run LangGraph MDM agent pipeline")
    parser.add_argument(
        "requirement",
        nargs="?",
        default="Add aadhaar_no as VARCHAR(12) required field to Party",
        help="JIRA / business requirement text",
    )
    parser.add_argument(
        "--dump",
        type=Path,
        default=None,
        help="Optional path to write final ProjectState JSON",
    )
    parser.add_argument(
        "--apply-ui",
        action="store_true",
        help="Apply Agent 02 FILE bundle into references/cdo_customer_ui",
    )
    args = parser.parse_args(argv)

    print("▶ Starting LangGraph pipeline (requirements → ui → etl → mdm)")
    print(f"  requirement: {args.requirement}")

    state = run_mdm_pipeline(args.requirement)

    schema_fields = []
    if state.current_schema:
        schema_fields = [a.name for a in state.current_schema.attributes]

    print("✔ Pipeline finished")
    print(f"  schema fields ({len(schema_fields)}): {', '.join(schema_fields)}")
    print(f"  ui_code chars: {len(state.ui_code)}")
    print(f"  etl_code chars: {len(state.etl_code)}")
    print(f"  mdm_ddl chars: {len(state.mdm_ddl)}")
    if state.errors:
        print(f"  errors: {state.errors}")

    if args.apply_ui and state.ui_code:
        from agents.ui_reference_loader import apply_ui_bundle

        written = apply_ui_bundle(state.ui_code, dry_run=False)
        print(f"  applied UI files ({len(written)}):")
        for path in written:
            print(f"    - {path}")

    if args.dump:
        args.dump.write_text(
            json.dumps(state.model_dump(mode="json"), indent=2),
            encoding="utf-8",
        )
        print(f"  wrote state dump → {args.dump}")

    return 0 if not state.errors else 1


if __name__ == "__main__":
    sys.exit(main())
