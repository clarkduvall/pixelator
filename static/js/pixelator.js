$.fn.pixelator = function(sendSocket, receiveSocket, sendInterval) {
  var drawing = false,
      toSend = [],
      id = Math.floor(Math.random() * 1000000),
      $canvas = this,
      canvas = $canvas[0],
      ctx = canvas.getContext('2d'),
      pixels = JSON.parse(PIXELS),
      color = 'black',
      pixelSize = 10;

  ctx.width = canvas.width = WIDTH * pixelSize;
  ctx.height = canvas.height = HEIGHT * pixelSize;

  this.setColor = function(newColor) {
    color = newColor;
  };

  function colorPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * 10, y * 10, 10, 10);
  }

  function mapX(x) {
    return Math.floor((x - $canvas.offset().left) / pixelSize);
  }

  function mapY(y) {
    return Math.floor((y - $canvas.offset().top) / pixelSize);
  }

  $.each(pixels, function(x, yRow) {
    $.each(yRow, function(y, col) {
      colorPixel(x, y, col);
    });
  });

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

  $canvas.bind('mousemove touchmove', function(e) {
    if (!drawing) return;
    e && e.preventDefault();

    if (e.originalEvent.targetTouches)
      e = e.originalEvent.targetTouches[0];

    var x = mapX(e.pageX),
        y = mapY(e.pageY);
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
