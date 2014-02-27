from flask import Flask
from flask import render_template
from flask_sockets import Sockets

app = Flask(__name__, static_url_path='/s', static_folder='static')
app.debug = True
sockets = Sockets(app)

import logging
logging.error('INITIALIZ')

@sockets.route('/echo')
def echo_socket(ws):
    while not ws.closed:
        message = ws.receive()
        if not ws.closed:
            ws.send(message)


@app.route('/')
def index():
    return render_template('index.html')
