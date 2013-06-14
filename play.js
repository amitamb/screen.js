// this will be inside the iframe
// it will accept different signals from parent frame and would modify the contents of iframe accordingly


// there should be jquery loaded already

(function($){
  var screenjs = {};

  screenjs.mouseCursor = $("<img></img>");
  screenjs.mouseCursor.attr("src", "mouse4.png").css({
    position:"absolute",
    display:"block",
    left:"-500px",
    top:"-500px"
  });

  // page will be already loaded so no need to wait for page load
  // as play.js is added after some HTML is written to page
  screenjs.mouseCursor.appendTo("body");

  screenjs.setMousePosition = function(left, top){
    // screenjs.mouseCursor.
    screenjs.mouseCursor.css({
      left: left,
      top: top
    });
  };

  window.screenjs = screenjs;
})(window.screenjs$);