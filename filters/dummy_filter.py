from __future__ import annotations

from coasti_planner.extensions.models.filter import SQLFilter


dummy_filter = SQLFilter(
    id="dummy_filter",
    name="Amt",
    description="Filter by Amt",
    target_column="amt",
    sql="SELECT DISTINCT amt FROM dummy_table ORDER BY amt",
)
