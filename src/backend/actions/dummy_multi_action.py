from pathlib import Path

from coasti_planner.extension.sdk import (
    ActionSequence,
    NotificationAction,
    SqlAction,
)

# imports from neighbouring modules should work:
from .dummy_notify_action import dummy_notify_action

dummy_sql_action = SqlAction(
    id="dummy_sql_action",
    name="Update the dummy table",
    description="Randomize the status of the first dummy-table row.",
    sql=Path("./dummy_sql_action.sql"),
)
another_notification = NotificationAction(
    id="another_notification",
    name="Show another notification",
    message="Another notification.",
)

dummy_multi_action = ActionSequence(
    id="dummy_multi_action",
    name="Update and notify",
    description="Update the dummy table and then show two notifications.",
    actions=[
        dummy_sql_action,
        dummy_notify_action,
        another_notification,
    ],
)
