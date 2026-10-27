from __future__ import annotations

from pathlib import Path

from coasti_planner.extensions.models import ColumnDType, Outlet

amt_options = Outlet(
    id="amt_options",
    name="Amts",
    description="Distinct amt values in the dummy table.",
    value_type=ColumnDType.STRING,
    sql=Path("./amt_options.sql"),
)
