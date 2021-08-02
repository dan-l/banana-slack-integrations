# Create Recurring Reminder

Function to create recurring reminder for Slack channel. Reminders are created and stored in GCP Firestore.

Supported examples:
- `/rremind Break time! :facepunch: 12pm weekdays`
- `/rremind Hello <@U123456> 8am everyday`
- `/rremind Attend meeting 2pm mon,wed,fri`

ReminderData Schema:
```
{
    "id": "5146",
    "channel":"CH12345",
    "text":"Break time! :facepunch:",
    "hour":12,
    "monday":true,
    "tuesday":true,
    "wednesday":true,
    "thursday":true
    "friday":true,
    "saturday":true,
    "sunday":true,
}
```
