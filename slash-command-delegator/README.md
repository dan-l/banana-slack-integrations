# Slash Command Delegator

This is a receiver cloud function that gets triggered for all banana slash commands:
- /stonk
- /rremind
- /rremind-delete

The request content type is `application/x-www-form-urlencoded`.

It publishes a pub/sub topic for the corresponding handler function to execute in the background and then returns immediate response to Slack (to comply with the 3 second timeout limitation).
