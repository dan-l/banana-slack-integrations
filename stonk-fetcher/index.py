import base64
import json

import yfinance as yf
from slack_sdk.webhook import WebhookClient

def index(event, context):
    """Triggered from a message on a Cloud Pub/Sub topic.
    Args:
         event (dict): Event payload.
         context (google.cloud.functions.Context): Metadata for the event.
    """
    slack_request = json.loads(base64.b64decode(event['data']).decode('utf-8'))
    print(slack_request)
    process(slack_request)

def process(slack_request):
    param_text = slack_request['text']
    stock_text = parse(get_ticker_symbol(param_text), get_query_type(param_text))
    print(stock_text)
    text = '<@%s> fetched a quote with: `%s %s`\n%s' % (slack_request['user_id'], slack_request['command'], slack_request['text'], stock_text)
    send_text(slack_request['response_url'], text)

def get_ticker_symbol(param_text):
    return param_text.split(' ')[0]

def get_query_type(param_text):
    splitted_text = param_text.split(' ')

    if len(splitted_text) > 1:
        return splitted_text[1]

    return 'quote'

def parse(ticker_symbol, query_type):
    # TODO add beta, PE, PEG other ratio

    if query_type == 'quote':
        return get_quote(ticker_symbol)

def send_text(response_url, text):
    webhook = WebhookClient(response_url)
    response = webhook.send(text=text, response_type='in_channel')
    print(response.status_code)

def get_quote(ticker_symbol):
    ticker = yf.Ticker(ticker_symbol)
    ticker_info = ticker.info
    print(ticker_info)
    ticker_name = ticker.info['shortName']

    result = '>%s (%s)\n' % (ticker_name, ticker_symbol.upper())

    current_price = ticker_info['regularMarketPrice']
    prev_price = ticker_info['regularMarketPreviousClose']
    chg = current_price - prev_price
    chg_pct = round(chg / prev_price * 100, 2)
    emoji = ':rocket:' if chg_pct > 0 else ':rocket-down:'
    result += '>%s (%s | %s%%) %s\n' % (current_price, round(chg, 2), chg_pct, emoji)

    day_low, day_hi = ticker_info['regularMarketDayLow'], ticker_info['regularMarketDayHigh']
    result += '>Day low: %s, Day hi: %s\n' % (day_low, day_hi)

    low_52, hi_52 = ticker_info.get('fiftyTwoWeekLow'), ticker_info.get('fiftyTwoWeekHigh')
    if low_52 and hi_52:
        result += '>52 low: %s, 52 hi: %s\n' % (low_52, hi_52)

    day_avg_50, day_avg_200 = ticker_info.get('fiftyDayAverage'), ticker_info.get('twoHundredDayAverage')
    if day_avg_50 and day_avg_200:
        result += '>50 day avg: %s, 200 day avg: %s\n' % (day_avg_50, day_avg_200)

    return result

