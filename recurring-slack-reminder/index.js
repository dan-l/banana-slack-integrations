/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.helloPubSub = async (event, context) => {
  const IncomingWebhook = require('@slack/webhook').IncomingWebhook;

  const { text, webhook_url } = event.attributes;
  const webhook = new IncomingWebhook(webhook_url);
  console.log(JSON.stringify(event));

  const result = await webhook.send({
    text,
    emoji: true,
    type: 'mrkdwn',
  });
  console.log(result);
};
