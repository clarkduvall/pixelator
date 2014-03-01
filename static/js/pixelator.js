$.fn.pixelator = function(sendSocket, receiveSocket, sendInterval, defaultCol) {
  var $pixelWrappers = this.find('.pixel-wrapper'),
      drawing = false,
      toSend = [],
      id = Math.floor(Math.random() * 1000000),
      color = defaultCol;

  this.setColor = function(newColor) {
    color = newColor;
  };

  function colorPixel(x, y, color) {
    $('[data-x=' + x + '][data-y=' + y + ']').css('background', color);
  }

  function defer(list, timeout) {
    if (!list.length) return;
    var item = list.shift();
    colorPixel(item.x, item.y, item.color);
    setTimeout(function() {
      defer(list, timeout);
    }, timeout);
  }

  receiveSocket.onmessage = function(message) {
    var data = JSON.parse(message.data);
    if (data.id === id) return;
    defer(data.pixels, sendInterval / data.pixels.length);
  };

  // Only draw when the mouse is down.
  $('body').bind('mousedown touchstart', function() {
    drawing = true;
  }).bind('mouseup touchend touchcancel', function() {
    drawing = false;
  });

  $pixelWrappers.bind('mousemove touchmove', function(e) {
    if (!drawing) return;
    e && e.preventDefault();

    var $div = $(this).find('.pixel'),
        x = $div.data('x'),
        y = $div.data('y');
    colorPixel(x, y, color);
    toSend.push({x: x, y: y, color: color});
  });

  // Send our data at regular intervals.
  setInterval(function() {
    if (toSend.length && sendSocket.readyState === 1) {
      sendSocket.send(JSON.stringify({id: id, pixels: toSend}));
      toSend = [];
    }
  }, sendInterval);
};
