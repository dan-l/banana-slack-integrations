
import os
import json

from google.cloud import pubsub_v1

def index(request):
    """Responds to any HTTP request.
    Args:
        request (flask.Request): HTTP request object.
    Returns:
        The response text or any set of values that can be turned into a
        Response object using
        `make_response <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>`.
    """
    print('start')
    print(request.form)

    command = request.form['command']
    param_text = request.form['text']
    print(param_text)

    slack_request = '%s %s' % (command, param_text)
    print(slack_request)

    if not param_text:
        return ''

    project_id = os.environ.get('PUB_SUB_PROJECT_ID')
    topic_id = os.environ.get('PUB_SUB_TOPIC_ID')
    print(project_id, topic_id)

    publisher = pubsub_v1.PublisherClient()

    topic_path = publisher.topic_path(project_id, topic_id)
    request = {
        'text': param_text,
        'response_url': request.form['response_url']
    }
    data = json.dumps(request).encode("utf-8")
    publisher.publish(topic_path, data)

    return ''
