# Stonk request

This is the endpoint that receives Slack Slash command request.

The request content type is `application/x-www-form-urlencoded`.

Due to Slack's requirement that response needs to be within 3 seconds, combined with cloud function doesn't support waiting for threading to finish, this endpoint is responsible for receiving the request and acking.

 It will also offload the actual work to another cloud function `stonk-fetcher` to do the fetching and post the result back to Slack.
