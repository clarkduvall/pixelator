$(function() {
  var wsBaseURL = 'ws://' + location.host + '/' + NAME,
      wsSend = new ReconnectingWebSocket(wsBaseURL + '/submit'),
      wsReceive = new ReconnectingWebSocket(wsBaseURL + '/receive'),
      color = '#000000',
      $canvas = $('.canvas');

  $('.popup .close').click(function(e) {
    e && e.preventDefault();

    $('.overlay').fadeOut();
  });

  $('.help a').click(function(e) {
    e && e.preventDefault();

    $('.overlay').fadeIn();
  });

  $('.new a').click(function(e) {
    e && e.preventDefault();

    window.location.href = '/' +
        Math.floor(Math.random() * 10000000).toString(16);
  });

  $canvas.pixelator(wsSend, wsReceive, 1000, color);

  $('.colorpicker').simplecolorpicker({
    selectColor: color,
    picker: true,
    theme: 'regularfont'
  }).on('change', function() {
    $canvas.setColor($(this).val());
  });
});
