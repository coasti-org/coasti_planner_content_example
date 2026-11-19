from __future__ import annotations

from pathlib import Path

from coasti_planner.extension.sdk import ColumnDType, Outlet

has_draft_rows = Outlet(
    id="has_draft_rows",
    name="Has draft rows",
    description="Whether the dummy table contains any draft row.",
    value_type=ColumnDType.BOOLEAN,
    sql=Path("./has_draft_rows.sql"),
)
