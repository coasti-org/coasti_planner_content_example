from __future__ import annotations

from coasti_planner.extensions.models import SqlAction

# Each action writes one stage into the single process_state row, which the
# current_stage outlet reads back. The SQL is inline because the statements are
# small; larger queries can live in a neighbouring .sql file instead.

set_stage_draft = SqlAction(
    id="set_stage_draft",
    name="Set stage to draft",
    description="Write 'draft' into process_state.current_stage.",
    sql="UPDATE process_state SET current_stage = 'draft';",
)

set_stage_locked = SqlAction(
    id="set_stage_locked",
    name="Set stage to locked",
    description="Write 'locked' into process_state.current_stage.",
    sql="UPDATE process_state SET current_stage = 'locked';",
)

set_stage_done = SqlAction(
    id="set_stage_done",
    name="Set stage to done",
    description="Write 'done' into process_state.current_stage.",
    sql="UPDATE process_state SET current_stage = 'done';",
)
