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
    //screenjs.mirror
    // console.log(data);
    data.args = JSON.parse(data.args);
    handleMessage(data);
  };

  screenjs.scroll = function(eventData){
    var node = screenjs.mirror.deserializeNode(eventData.nodeId);
    $(node).scrollLeft(eventData.scrollLeft);
    $(node).scrollTop(eventData.scrollTop);
  };

  screenjs.changeElementValue = function(eventData) {
    var node = screenjs.mirror.deserializeNode(eventData.nodeId);
    var val = eventData.value;
    var $node = $(node);
    if ( $node.is("input[type=radio]") || $node.is("input[type=checkbox]") ) {
      $node.prop("checked", val)
    }
    else {
      $node.val(val);
    }
  }

  // This is important function to show mouse position at
  // same position across different devices
  // this will be called by mousemove across different devices
  screenjs.getNodeOffsetOffset = function(eventData){
    var node = screenjs.mirror.deserializeNode(eventData.nodeId);
    // TODO: Try avoiding using $ and make it fast
    var nodeOffset = $(node).offset();
    var nodeOffsetOffset = {};
    nodeOffsetOffset.left = eventData.nodeOffset.left - nodeOffset.left;
    nodeOffsetOffset.top = eventData.nodeOffset.top - nodeOffset.top;
    return nodeOffsetOffset;
  };

  screenjs.handleInputselect = function(eventData){
    var node = screenjs.mirror.deserializeNode(eventData.nodeId);
    // TODO: This is temporary fix
    // but handle focus events in seperate
    // event handler
    if ( eventData.selectionStart == null || eventData.selectionEnd == null ) {
      node.blur();
      node.selectionStart = 0;
      node.selectionEnd = 0;
    }
    else {
      node.focus();
      node.selectionStart = eventData.selectionStart;
      node.selectionEnd = eventData.selectionEnd;
    }
  };

  screenjs.handleContentselect = function(eventData) {
    if ( eventData.clear == true ) {
      var selectionObject = window.getSelection();
      if(selectionObject.rangeCount > 0) selectionObject.removeAllRanges();
    }
    else {
      var range = document.createRange();
      var startNode = screenjs.mirror.deserializeNode(eventData.startNodeId);
      var endNode = screenjs.mirror.deserializeNode(eventData.endNodeId);
      $(window).focus();
      // startNode.focus();

      range.setStart(startNode, eventData.startNodeOffset);
      range.setEnd(endNode, eventData.endNodeOffset);
      var selectionObject = window.getSelection();
      if(selectionObject.rangeCount > 0) selectionObject.removeAllRanges();
      selectionObject.addRange(range);
    }
  };

  screenjs.setTransientStyles = function(eventData){
    var node = screenjs.mirror.deserializeNode(eventData.nodeId);
    var style = eventData.nodeStyle;
    node.style.color = style.color;
    node.style.background = style.background;
    node.style.textDecoration = style.textDecoration;
    node.style.border = style.border;
  };

  screenjs.resetTransientStyles = function(eventData){
    var node = screenjs.mirror.deserializeNode(eventData.nodeId);
    node.style.color = null;
    node.style.background = null;
    node.style.textDecoration = null;
    node.style.border = null;
  };

  clearPage();

  showMouseImages();

  window.screenjs = screenjs;
})(window.screenjs$);