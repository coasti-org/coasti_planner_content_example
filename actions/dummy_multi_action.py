from pathlib import Path

from coasti_planner.extensions.models import (
    ActionSequence,
    NotificationAction,
    Sql,
    SqlAction,
)

# imports from neighbouring modules should work:
from .dummy_notify_action import dummy_notify_action

sql_action = SqlAction(
    id="dummy_sql_action",
    name="Update the dummy table",
    description="Randomize the status of the first dummy-table row.",
    sql=Sql(_file=Path("./dummy_sql_action.sql")),
)
another_notification_action = NotificationAction(
    id="another_notification",
    name="Show another notification",
    message="Another notification.",
)

dummy_multi_action = ActionSequence(
    id="dummy_multi_action",
    name="Update and notify",
    description="Update the dummy table and then show two notifications.",
    actions=[
        sql_action,
        dummy_notify_action,
        another_notification_action,
    ],
)
