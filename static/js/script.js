$(function() {
  var ws = new WebSocket("ws://localhost:5000/echo");

  ws.onopen = function() {
    console.log('opened');
  };

  ws.onclose = function() {
    console.log('closed');
  };

  ws.onmessage = function(message) {
    console.log(message);
  };

  window.ws = ws;
});
