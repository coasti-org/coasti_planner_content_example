from __future__ import annotations

from coasti_planner.extensions.models import ColumnDType, Outlet

# Reads the single process_state row written by the set_stage_* actions. The
# SQL is inline because the query is small; larger queries can live in a
# neighbouring .sql file instead.
current_stage = Outlet(
    id="current_stage",
    name="Current stage",
    description="Stage stored in the single process_state row.",
    value_type=ColumnDType.STRING,
    sql="SELECT current_stage FROM process_state LIMIT 1;",
)
