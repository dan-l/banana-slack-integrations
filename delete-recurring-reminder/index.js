const axios = require('axios');
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();

async function deleteReminder(reminderId) {
  const documentSnapshots = await firestore
    .collection('banana-slack-reminders')
    .where('reminderId', '==', parseInt(reminderId))
    .get();

  if (documentSnapshots.empty) {
    return null;
  }

  console.log('Found matching reminder to delete');
  const documentRef = documentSnapshots.docs[0].ref;
  const documentSnapshot = await documentRef.get();
  await documentRef.delete();

  return {
    reminderText: documentSnapshot.get('text')
  };
}

async function sendSuccessfulDeletionResponse(responseUrl, user, reminderId, reminderText) {
  await axios.post(responseUrl, {
    response_type: 'in_channel',
    text: `<@${user}> successfully deleted reminder \`${reminderText}\` with command \`/rremind-delete ${reminderId}\``
  });
}

async function sendUnsucccessfulDeletionResponse(responseUrl, user, reminderId, reminderText) {
  await axios.post(responseUrl, {
    response_type: 'in_channel',
    text: `<@${user}> the reminder id \`${reminderId}\` did not match any existing reminders.`
  });
}

async function run(data) {
  const reminderId = data.text.trim();
  const reminderData = await deleteReminder(reminderId);
  if (reminderData) {
    await sendSuccessfulDeletionResponse(data.response_url, data.user_id, reminderId, reminderData.reminderText);
  } else {
    await sendUnsucccessfulDeletionResponse(data.response_url, data.user_id, reminderId);
  }
}

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.helloPubSub = (event, context) => {
  const data = JSON.parse(Buffer.from(event.data, 'base64').toString());
  return run(data);
};
