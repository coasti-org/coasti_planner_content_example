from coasti_planner.extensions.models import NotificationAction


dummy_notify_action = NotificationAction(
    id="dummy_notify_action",
    name="Notify about the dummy table",
    description="Notify the user that the dummy table state was updated.",
    message="The dummy table state was updated.",
)
