import gevent


class CanvasBackend(object):

    def __init__(self, channel, redis):
        self.clients = []
        self.pubsub = redis.pubsub()
        self.pubsub.subscribe(channel)
        self.start()

    def _iter_data(self):
        for message in self.pubsub.listen():
            data = message.get('data')
            if message['type'] == 'message':
                yield data

    def register(self, client):
        self.clients.append(client)

    def send(self, client, data):
        try:
            client.send(data)
        except Exception:
            if client in self.clients:
                self.clients.remove(client)

    def run(self):
        for data in self._iter_data():
            for client in self.clients:
                gevent.spawn(self.send, client, data)

    def start(self):
        gevent.spawn(self.run)
