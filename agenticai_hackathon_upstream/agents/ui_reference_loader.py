# UI Agent reference helper (optional apply path)

from pathlib import Path
import re

BASE_DIR = Path(__file__).resolve().parent.parent
UI_REFERENCE_DIR = BASE_DIR / "references" / "cdo_customer_ui"
FILE_HEADER = re.compile(
    r"^### FILE:\s*(references/cdo_customer_ui/[^\n]+)\s*$",
    re.MULTILINE,
)


def parse_ui_file_bundle(ui_code: str) -> dict[str, str]:
    """Parse Agent 02 output into {relative_path: file_contents}."""
    matches = list(FILE_HEADER.finditer(ui_code))
    if not matches:
        return {}

    files: dict[str, str] = {}
    for idx, match in enumerate(matches):
        rel = match.group(1).strip()
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(ui_code)
        files[rel] = ui_code[start:end].strip() + "\n"
    return files


def apply_ui_bundle(ui_code: str, dry_run: bool = False) -> list[str]:
    """Write parsed Agent 02 file sections into the Angular reference tree."""
    files = parse_ui_file_bundle(ui_code)
    written: list[str] = []
    for rel, content in files.items():
        if not rel.startswith("references/cdo_customer_ui/"):
            continue
        target = BASE_DIR / rel
        if not dry_run:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8")
        written.append(rel)
    return written
