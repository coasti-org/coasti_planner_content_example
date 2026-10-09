from action_base import ActionSequence, NotificationAction, SqlAction
from dummy_notify_action import dummy_notify_action


dummy_multi_action = ActionSequence(
    actions=(
        SqlAction("dummy_sql_action.sql"),
        dummy_notify_action,
        NotificationAction("Another notification."),
    ),
)
