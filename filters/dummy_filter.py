from __future__ import annotations

from coasti_planner.extensions.models import SQLFilter, Sql


dummy_filter = SQLFilter(
    id="dummy_filter",
    name="Amt",
    description="Filter by Amt",
    target_column="amt",
    sql=Sql(_inline="SELECT DISTINCT amt FROM dummy_table ORDER BY amt"),
)
