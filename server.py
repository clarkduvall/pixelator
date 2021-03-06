from collections import defaultdict
from functools import wraps
import json
import os
from urllib import quote

from flask import Flask
from flask import render_template
import gevent
import redis

from canvas_backend import CanvasBackend
from filters import escapejs
from flask_sockets2 import Sockets


REDIS_URL = os.environ['REDISCLOUD_URL']

# Set up Flask app.
app = Flask(__name__, static_url_path='/s', static_folder='static')
app.jinja_env.filters['jsonify'] = lambda v: escapejs(json.dumps(v))
app.debug = 'DEBUG' in os.environ
sockets = Sockets(app)

# Set up Redis.
r = redis.from_url(REDIS_URL)

# Canvases for each URL.
canvases = {}

def get_or_create_canvas(name):
    if name not in canvases:
        canvases[name] = CanvasBackend(name, r)
    return canvases[name]


def count_key(name):
    return name + '/count'


# Use this to keep count of users on a socket endpoint.
def keep_count(f):
    @wraps(f)
    def inner(ws, name, *args, **kwargs):
        key = count_key(name)
        r.incr(key)
        try:
            return f(ws, name, *args, **kwargs)
        finally:
            r.decr(key)
    return inner


@app.route('/')
@app.route('/<name>')
def canvas(name='main'):
    pixels = r.hgetall(name)
    pixel_dict = defaultdict(lambda: defaultdict(dict))
    for coords, color in pixels.iteritems():
        x, y = coords.split(',')
        try:
            pixel_dict[int(x)][int(y)] = color
        except (ValueError, TypeError):
            pass

    url = 'http://www.pixelator.co'
    if name != 'main':
        url = '%s/%s' % (url, name)

    ctx = {
        'name': name,
        'width': 80,
        'height': 55,
        'pixels': pixel_dict,
        'url': quote(url)
    }
    return render_template('index.html', **ctx)


@sockets.route('/<name>/submit')
def inbox(ws, name):
    while not ws.closed:
        # Sleep to prevent *constant* context-switches.
        gevent.sleep(0.1)
        message = ws.receive()

        if message:
            r.publish(name, message)
            pixels = json.loads(message)['pixels']
            r.hmset(name, {'%s,%s' % (d['x'], d['y']): d['color']
                               for d in pixels})
    return ''


@sockets.route('/<name>/receive')
def outbox(ws, name):
    get_or_create_canvas(name).register(ws)

    while not ws.closed:
        # Context switch while `ChatBackend.start` is running in the background.
        gevent.sleep()
    return ''
