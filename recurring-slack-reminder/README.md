# Recurring slack reminder

This is a cloud function that uses the PubSub topic as a trigger to execute.

Using a cloud scheduler, you can define the scheduler for which a message will be published to the topic subscribed by this cloud function at a recurring interval.

The message attribute payload format is expected in a format of

```
{
	text: 'The formatted message to sent to Slack',
	webhook_url: 'The Slack webhook url to post the message to'
}
```
