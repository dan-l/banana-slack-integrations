# Stonk fetcher

This is a cloud function that gets triggered when its gets a PubSub message. The trigger comes from `stonk-request` cloud function when they received the request from Slack Slash command.

This function will then fetch the stonk information via Yahoo Finance API before posting a formatted message back to Slack via webhooks.
