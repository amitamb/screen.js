// this will be inside the iframe
// it will accept different signals from parent frame and would modify the contents of iframe accordingly


// there should be jquery loaded already

(function($){
  var screenjs = {};

  screenjs.base = "";

  function showMouseImages(){
    screenjs.clickCircle = $("<img></img>");
    screenjs.clickCircle.attr("src", "circle.png").css({
      position:"absolute",
      display:"block",
      left:"-500px",
      top:"-500px",
      "z-index":"9999"
    }).appendTo("body");
    // page will be already loaded so no need to wait for page load
    // as play.js is added after some HTML is written to page

    screenjs.mouseCursor = $("<img></img>");
    screenjs.mouseCursor.attr("src", "mouse4.png").css({
      position:"absolute",
      display:"block",
      left:"-500px",
      top:"-500px",
      "z-index":"10000"
    }).appendTo("body");
  }

  screenjs.mirror = new TreeMirror(document, {
    createElement: function(tagName) {
      if (tagName == 'SCRIPT') {
        var node = document.createElement('NO-SCRIPT');
        node.style.display = 'none';
        return node;
      }

      if (tagName == 'HEAD') {
        var node = document.createElement('HEAD');
        node.appendChild(document.createElement('BASE'));
        node.firstChild.href = screenjs.base;
        return node;
      }
    }
  });

  screenjs.setMousePosition = function(left, top){
    // screenjs.mouseCursor.
    screenjs.mouseCursor.css({
      left: left,
      top: top
    });
  };

  screenjs.setMouseStatus = function(left, top, mouseDown){
    if (mouseDown) {
      screenjs.clickCircle.css({
        left: left - 16,
        top: top - 16,
        display: "block"
      });
    }
    else {
      screenjs.clickCircle.css({
        left: "-500px",
        top: "-500px",
        display: "none"
      });
    }
  };

  function clearPage() {
    while (document.firstChild) {
      document.removeChild(document.firstChild);
    }
  }

  function handleMessage(msg) {
    if (msg.clear)
      clearPage();
    else if (msg.base)
      screenjs.base = msg.base;
    else
      screenjs.mirror[msg.f].apply(screenjs.mirror, msg.args);
  }

  screenjs.handleDOMMutation = function(data){
    screenjs.mirror
    console.log(data);
    data.args = JSON.parse(data.args);
    handleMessage(data);
  };

  clearPage();

  showMouseImages();

  window.screenjs = screenjs;
})(window.screenjs$);