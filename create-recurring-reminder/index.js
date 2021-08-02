const axios = require('axios');
const moment = require('moment');
const { Firestore } = require('@google-cloud/firestore');

const EVERY_DAY = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: true
};

const WEEKDAYS = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true
};

const WEEKENDS = {
  saturday: true,
  sunday: true
};

const DAYS_MAPPING = {
  mon: 'monday',
  tue: 'tuesday',
  wed: 'wednesday',
  thu: 'thursday',
  fri: 'friday',
  sat: 'saturday',
  sun: 'sunday'
};

const firestore = new Firestore();

/*
ReminderData {
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
*/
function buildReminderData(reminderId, slackData) {
  return {
    reminderId: reminderId,
    channel: slackData.channel,
    text: slackData.reminder_text,
    hour: slackData.hour24,
    monday: slackData.monday || false,
    tuesday: slackData.tuesday || false,
    wednesday: slackData.wednesday || false,
    thursday: slackData.thursday || false,
    friday: slackData.friday || false,
    saturday: slackData.saturday || false,
    sunday: slackData.sunday || false
  };
}

async function addNewReminderToFirestore(reminderData) {
  const collectionRef = firestore.collection('banana-slack-reminders');
  await collectionRef.add(reminderData);
}

// returns SlackData
function parseSlackCommand(data) {
  const commands = data.text.split(' ');
  const len = commands.length;
  const recurringDays = parseRecurringDays(commands[len-1]);
  const hour24 = parseInt(moment(commands[len-2], 'h A').format('HH'));
  const reminderText = commands.slice(0, len-2).join(' ');

  return {
    reminder_text: reminderText,
    channel: data.channel,
    user_id: data.user_id,
    response_url: data.response_url,
    hour24: hour24,
    ...recurringDays
  };
}

function parseRecurringDays(days) {
  days = days.toLowerCase();
  if (days === 'everyday') {
    return EVERY_DAY;
  } else if (days === 'weekdays') {
    return WEEKDAYS;
  } else if (days === 'weekends') {
    return WEEKENDS;
  } else {
    days = days.split(',');
    return days.reduce((result, day) => {
      result[DAYS_MAPPING[day]] = true;
      return result;
    }, {});
  }
}

async function sendResponseSuccess(reminderId, slackData) {
  await axios.post(slackData.response_url, {
    response_type: 'in_channel',
    text: `<@${slackData.user_id}> successfully created a reminder \`${slackData.reminder_text}\`. To delete this reminder, use command \`/rremind-delete ${reminderId}\``
  });
}

async function sendResponseFailure(data) {
  await axios.post(data.response_url, {
    response_type: 'in_channel',
    text: 'Error creating a reminder. Banana Reminders currently only support hour granularity. Examples:\n- \`/rremind eat pills 6pm everyday\`\n- \`/rremind start work 9am weekdays\`\n- \`/rremind party 12pm weekends\`\n- \`/rremind life group 7pm thu\`\n- \`/rremind go to the gym 5pm mon,wed,fri\`'
  });
}

async function run(data) {
  try {
    const reminderId = Math.floor(1000 + Math.random() * 9000);
    const slackData = parseSlackCommand(data);
    const reminderData = buildReminderData(reminderId, slackData);
    await addNewReminderToFirestore(reminderData);
    await sendResponseSuccess(reminderId, slackData);
  } catch (err) {
    sendResponseFailure(data);
  }
}

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.helloPubSub = (event, context) => {
  const data = JSON.parse(Buffer.from(event.data, 'base64').toString())
  return run(data);
};
