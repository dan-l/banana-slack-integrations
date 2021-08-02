import os
import json

from google.cloud import pubsub_v1

def buildImmediateSlackResponse():
  return {
    'response_type': 'in_channel',
    'text': 'Your request is being processed..'
  }

# command eg. '/stonk', '/rremind', etc.
def getTopicForSlashCommand(command):
  return {
    '/stonk': 'stonk-request',
    '/rremind': 'create-recurring-reminder',
    '/rremind-delete': 'delete-recurring-reminder'
  }[command]

def extractRequestObject(request):
    return {
        'command': request.form['command'],
        'text': request.form['text'],
        'channel': request.form['channel_id'],
        'response_url': request.form['response_url'],
        'user_id': request.form['user_id']
    }

def index(request):
    print('start')
    print(request.form)

    command = request.form['command']
    param_text = request.form['text']
    print(param_text)

    if not param_text.strip():
        return json.dumps({'text': 'command should not be empty!', 'response_type': 'in_channel'}), 200, {'Content-Type': 'application/json'}

    topic_id = getTopicForSlashCommand(command)
    print(topic_id)

    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path('napn-slack', topic_id)
    request = extractRequestObject(request)
    data = json.dumps(request).encode("utf-8")
    publisher.publish(topic_path, data)

    return json.dumps(buildImmediateSlackResponse()), 200, {'Content-Type': 'application/json'}

