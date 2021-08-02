const { Firestore } = require('@google-cloud/firestore');
const { WebClient } = require('@slack/web-api');

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const firestore = new Firestore();
const slackWeb = new WebClient(process.env.SLACK_TOKEN);

// returns current day/hour eg.['monday', 14] for monday 2pm
function getCurrentDayAndHour() {
  const d = new Date();
  return [DAYS_OF_WEEK[d.getDay()], d.getHours()];
}

/*
ReminderData {
    "channel":"CH123456",
    "text":"Break time! :facepunch:",
    "hour":12,
    "sunday":true,
    "monday":true,
    "tuesday":true,
    "wednesday":true,
    "thursday":true
    "friday":true,
    "saturday":true,
}
*/
async function sendReminder(reminderData) {
  const { text, channel } = reminderData;
  slackWeb.chat.postMessage({ text, channel });
}

async function fetchRemindersToSend() {
  const [currentDay, currentHour] = getCurrentDayAndHour();
  const collectionRef = firestore.collection('banana-slack-reminders');
  console.log(currentDay);
  console.log(currentHour);
  collectionRef
    .where(currentDay, '==', true)
    .where('hour', '==', currentHour)
    .get().then(results => {
      results.forEach(documentSnapshot => {
        const reminderData = documentSnapshot.data();
        console.log(`Retrieved data: ${JSON.stringify(reminderData)}`);
        sendReminder(reminderData);
      });
  });
}

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.helloPubSub = (event, context) => {
  fetchRemindersToSend();
};
