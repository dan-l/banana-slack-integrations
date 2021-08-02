# Send Recurring Reminder

Checks GCP Firestore for reminders matching current day and current hour, and sends Slack message reminder to the specified channel.

This function is triggered periodically (every hour) by GCP Cloud Scheduler.

Reminders are created using `/rremind` command along with reminder text, time of day, and recurring days of the week. See `create-recurring-reminder` for more details.
