$.fn.downloadable = function(sel, name) {
  var canvas = $(sel)[0],
      that = this;

  this.click(function() {
    that.attr('href', canvas.toDataURL('image/png'));
  });
  this.attr('target', '_blank');
  this.attr('download', name);
};
