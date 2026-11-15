"""Write sample Excel files for testing the dummy_table_excel import in the UI.

The files are built from the same deterministic rows as data/dummy.sqlite, so
their changes are relative to a freshly generated database. They are written
to data/excel/, which is git-ignored.

Needs polars, which coasti-planner[excel] installs, e.g.:

    uv run --project ../framework/backend python -m scripts.generate_excel_samples

Run it from the extension root.
"""

from __future__ import annotations

import shutil
from datetime import date
from pathlib import Path
from typing import Any

from scripts.generate_dummy_database import build_rows

try:
    import polars as pl
except ImportError as error:  # pragma: no cover - depends on the install
    raise SystemExit(
        "polars is missing; run this script in an environment with "
        "coasti-planner[excel] installed."
    ) from error

SHEET = "Daten"

# Excel headers are the column names of dummy_table, as the export writes them.
HEADERS = {
    "row_id": "Row ID",
    "kreis": "Kreis",
    "amt": "Amt",
    "haushaltstelle": "Haushaltstelle",
    "konto": "Konto",
    "betrag": "Betrag",
    "datum": "Datum",
    "is_active": "On?",
    "can_edit_roles": "Bearbeitungsrollen",
    "status": "Status",
}

Record = dict[str, Any]


def base_records() -> list[Record]:
    return [
        {
            "row_id": row_id,
            "kreis": kreis,
            "amt": amt,
            "haushaltstelle": haushaltstelle,
            "konto": konto,
            "betrag": betrag,
            "datum": date.fromisoformat(datum),
            "is_active": bool(is_active),
            "can_edit_roles": roles,
            "status": status,
        }
        for (
            row_id,
            kreis,
            amt,
            haushaltstelle,
            konto,
            betrag,
            datum,
            is_active,
            roles,
            status,
        ) in build_rows()
    ]


def edit(records: list[Record], target: int, changes: Record) -> list[Record]:
    return [
        {**record, **changes} if record["row_id"] == target else record
        for record in records
    ]


def valid_changes(records: list[Record]) -> list[Record]:
    """Change three amounts, drop leading zeros of one account, add one row."""
    records = edit(records, 1, {"betrag": 1000.5})
    records = edit(records, 4, {"betrag": 2000.5})
    records = edit(records, 7, {"betrag": 3000.5})
    records = edit(records, 10, {"konto": "4271"})
    new_row = {
        **records[0],
        "row_id": len(records) + 1,
        "betrag": 4711.0,
        "datum": date(2026, 1, 15),
        "status": "draft",
    }
    return [*records, new_row]


def with_errors(records: list[Record]) -> list[Record]:
    """Break three rules: a negative amount, an unknown status, no row id."""
    records = edit(records, 1, {"betrag": -250.0})
    records = edit(records, 4, {"status": "archiviert"})
    return edit(records, 7, {"row_id": None})


def locked_row(records: list[Record]) -> list[Record]:
    """Change the amount of row 3, whose status is done."""
    return edit(records, 3, {"betrag": 99999.0})


def replace_subset(records: list[Record]) -> list[Record]:
    """Keep the first 290 rows; replace mode deletes the other 10."""
    return records[:290]


def write(path: Path, records: list[Record]) -> None:
    frame = pl.DataFrame(records, schema_overrides={"row_id": pl.Int64})
    frame.rename(HEADERS).write_excel(path, worksheet=SHEET)


def generate_samples() -> None:
    output = Path(__file__).resolve().parents[1] / "data" / "excel"
    if output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True)

    records = base_records()
    samples = {
        "dummy_table_unchanged.xlsx": records,
        "dummy_table_valid.xlsx": valid_changes(records),
        "dummy_table_with_errors.xlsx": with_errors(records),
        "dummy_table_locked_row.xlsx": locked_row(records),
        "dummy_table_replace.xlsx": replace_subset(records),
    }
    for name, sample in samples.items():
        write(output / name, sample)
    print(f"Wrote {len(samples)} sample files to {output}.")


if __name__ == "__main__":
    generate_samples()
