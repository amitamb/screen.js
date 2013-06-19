// screen.js

(function($){

  var screenjs = {};

  screenjs.events = []; // for recording and playing

  screenjs.playFrame = null;

  screenjs.recording = false;
  screenjs.playing = false;

  screenjs.debug = true;

  // this is used while recording and
  // playing as well
  screenjs.isMouseDown = false;

  var getPlayFrameScreenjs = function(){
    return screenjs.playFrame.contentWindow.screenjs;
  };

  function loadScriptInPlayFrame(filename){
    var frameDocument = screenjs.playFrame.contentDocument;
    var scriptRef = frameDocument.createElement('script');
    scriptRef.setAttribute("type","text/javascript");
    scriptRef.setAttribute("src", filename);
    frameDocument.getElementsByTagName("head")[0].appendChild(scriptRef)
  };

  function getPageHTMLWithCSS(){
    var re = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
    var htmlElem = $("html").clone();
    htmlElem.find("script").remove();

    // TODO: Convert stylesheets to inline css or
    // make sure URL changes happening in future doesn't
    // botch up the page

    // TODO: Also convert images to base64 encoded
    // string so as that is also not an external dependancy

    return htmlElem.html();
  };

  function showMouseImages(){
    screenjs.clickCircle = $("<img></img>");
    screenjs.clickCircle.attr("src", "circle.png").css({
      position:"absolute",
      display:"block",
      left:"-500px",
      top:"-500px",
      opacity:"0.5",
      "z-index":"9999"
    }).appendTo(screenjs.frameOverlay);
    // page will be already loaded so no need to wait for page load
    // as play.js is added after some HTML is written to page

    // TODO: Show different cursor as user moves over links
    // and input boxes
    screenjs.mouseCursor = $("<img></img>");
    screenjs.mouseCursor.attr("src", "mouse4.png").css({
      position:"absolute",
      display:"block",
      left:"-500px",
      top:"-500px",
      "z-index":"10000"
    }).appendTo(screenjs.frameOverlay);
  }

  function createEvent(eventType, eventData){
    var event = {};

    event.time = Number(new Date());
    event.type = eventType;
    event.data = eventData;

    if (screenjs.debug) {
      //console.log(event);
    }

    return event;
  };

  function appendEvent(eventType, eventData){
    screenjs.events.push(createEvent(eventType, eventData));
  };

  function checkEventType(event, expectedType){
    if (expectedType instanceof Array) {
      return expectedType.indexOf(event.type) >= 0;
    }
    else {
      return event.type == expectedType;
    }
  };

  function getNextEvent(dontIncrement){
    if (!dontIncrement) {
      screenjs.currentEventIndex++;
    }
    return screenjs.events[screenjs.currentEventIndex];
  };

  var recordDOMMutationEvents = function(){

    // TODO: When elements are added asign
    // global event handlers like mousedown/mouseup/keypress

    screenjs.mirrorClient = new TreeMirrorClient(document, {
      initialize: function(rootId, children) {
        appendEvent("DOMMutation", {
          f: 'initialize',
          args: JSON.stringify([rootId, children])
        });
      },

      applyChanged: function(removed, addedOrMoved, attributes, text) {
        appendEvent("DOMMutation", {
          f: 'applyChanged',
          args: JSON.stringify([removed, addedOrMoved, attributes, text])
        })
        console.log(JSON.stringify([removed, addedOrMoved, attributes, text]));
      }
    });

  };

  var playDOMMutationEvents = function(event){
    if ( checkEventType(event, "DOMMutation") ) {
      var eventData = event.data;
      getPlayFrameScreenjs().handleDOMMutation(eventData);
    }
  };

  var recordMouseEvents = function(){
    // mouse movements

    var $window = $(window);

    $(document).on("mousemove.screenjs", function(event){
      appendEvent(
        "mousemove",
        {
          pageX: event.pageX - $window.scrollLeft(),
          pageY: event.pageY - $window.scrollTop()
        }
      );
    });
    // mouse events
    $("*").on("mousedown.screenjs", function(event){
      // TODO: Identify and process which key was pressed
      if ( this == event.target ) {
        console.log("mousedown event called");

        // only consider mouseDown when left mouse button 
        // is pressed
        if ( event.which == 1 ) {
          screenjs.isMouseDown = true;
        }

        appendEvent(
          "mousedown",
          {
            pageX: event.pageX - $window.scrollLeft(),
            pageY: event.pageY - $window.scrollTop()
          }
        );
        // TODO : Need to investigate this more
        // but mouseup doesn't get called for select
        // so this is a workaround
        if ( $(this).is("select") && $.browser.webkit ) {
          console.log("Forced mouseup");
          (function(event, $window){
            //setTimeout(function(){
              appendEvent(
                "mouseup",
                {
                  pageX: event.pageX - $window.scrollLeft(),
                  pageY: event.pageY - $window.scrollTop()
                }
              );
            //}, 100);
          })(event, $window);
        }
      }
    });
    // TODO: Identify and process which key was pressed
    $("*").on("mouseup.screenjs", function(event){
      if ( this == event.target ) {

        // only consider mouseDown when left mouse button 
        // is pressed
        if ( event.which == 1 ) {
          screenjs.isMouseDown = false;
        }

        console.log("mouseup event called");
        appendEvent(
          "mouseup",
          {
            pageX: event.pageX - $window.scrollLeft(),
            pageY: event.pageY - $window.scrollTop()
          }
        );
      }
    });
  };
  var playMouseEvents = function(event){
    if ( checkEventType(event, "mousemove") ) {
      // TODO: change position of mouse image on page
      var eventData = event.data;
      // TODO: Make sure it works in IE
      screenjs.mouseCursor.css({
        left: eventData.pageX,
        top: eventData.pageY
      });
      if (screenjs.isMouseDown){
        screenjs.clickCircle.css({
          left: eventData.pageX - 16,
          top: eventData.pageY - 16,
          display: "block"
        });
      }
      else {
        if ( screenjs.clickCircle.css("display") != "none" ) {
          console.log("Hiding clickCircle");
          screenjs.clickCircle.css({
            left: "-500px",
            top: "-500px",
            display: "none"
          });
        }
      }
      // getPlayFrameScreenjs().setMousePosition(eventData.pageX, eventData.pageY);
    }
    else if ( checkEventType(event, "mousedown") ) {
      console.log("mousedown found");
      screenjs.isMouseDown = true;
      var eventData = event.data;
      screenjs.clickCircle.css({
        left: eventData.pageX - 16,
        top: eventData.pageY - 16,
        display: "block"
      });
      // getPlayFrameScreenjs().setMouseStatus(eventData.pageX, eventData.pageY, true);
    }
    else if ( checkEventType(event, "mouseup") ) {
      console.log("mouseup found");
      screenjs.isMouseDown = false;
      (function(eventData){
        // TODO: Hide click circle when mouse moves i.e. make it better
        setTimeout(function(){
          if ( screenjs.isMouseDown == false ) {
            screenjs.clickCircle.css({
              left: "-500px",
              top: "-500px",
              display: "none"
            });
          }
        }, 200);
      })(event.data);
      // getPlayFrameScreenjs().setMouseStatus(eventData.pageX, eventData.pageY, false);
    }
  };

  var recordKeyboardEvents = function(){
    $("*").on("keypress.screenjs", function(domEvent){
      if ( this == domEvent.target ) {
        // This is needed only for keypress
        // but won't hurt for other events
        (function(domEvent, that){
          setTimeout(function(){
            var val = $(domEvent.target).val();
            if ( $(domEvent.target).is("input[type=password]") ) {
              val = val.replace(/./g, "-");
            }
            appendEvent("keypress",
            {
              nodeId: screenjs.mirrorClient.serializeNode(domEvent.target),
              value: val
            });
          }, 0);
        })(domEvent, this);
      }
    });
  };
  var playKeyboardEvents = function(event){
    if ( checkEventType(event, "keypress") ) {
      getPlayFrameScreenjs().changeElementValue(event.data);
    }
  };

  var recordSelectionEvents = function(){

    // TODO: Decide if we can handle focus events here
    // and even we need to
    // Need more effort on this front

    // for input and textarea
    function recordSelection(input_field){
      var start = input_field.selectionStart;
      var end = input_field.selectionEnd;
      if (start != end){
        appendMicroEvent("inputselect", { jqueryPath : jqueryPath(input_field), start : start, end : end });
      }
    }

    // TODO: Handle a possible bug here
    // clear this lastEvent when element gets deselected
    var lastInputselectEventData = null;
    var lastInputselectElement = null;

    // First record input and textarea selection
    // for it need to track mouse movements
    $(":input").on("mousemove.screenjs", function(domEvent){
      if ( screenjs.isMouseDown ) {
        console.log("Selection event");
        var eventData = {
          nodeId: screenjs.mirrorClient.serializeNode(domEvent.target),
          selectionStart: event.target.selectionStart,
          selectionEnd: event.target.selectionEnd
        };
        if ( lastInputselectEventData != eventData ) {
          console.log(eventData);
          console.log(eventData);
          appendEvent("inputselect", eventData);
          lastInputselectEventData = eventData;
        }
      }
    });

    // also use general select event
    $(":input").on("select.screenjs  mouseup.screenjs", function(domEvent){
      console.log("Selection event 2");
      var eventData = {
        nodeId: screenjs.mirrorClient.serializeNode(domEvent.target),
        selectionStart: event.target.selectionStart,
        selectionEnd: event.target.selectionEnd
      };
      if ( lastInputselectEventData != eventData ) {
        appendEvent("inputselect", eventData);
        lastInputselectEventData = eventData;
      }
    });

    // TODO: This should rather be on all the elements as
    // some nodes can cancel bubbling
    // to avoid having multiple $("*").on event handlers
    // hande single one which will call all required functions
    $(document).on("mousedown.screenjs", function(domEvent){

      // This mouseup is used to capture deselection when user clicks outside or event inside of
      // the textarea or input
      console.log("Selection event 3");

      if ( lastInputselectElement ) {
        var eventData = {
        nodeId: screenjs.mirrorClient.serializeNode(lastInputselectElement),
        selectionStart: lastInputselectElement.selectionStart,
        selectionEnd: lastInputselectElement.selectionEnd
        };
        if ( lastInputselectEventData != eventData ) {
          appendEvent("inputselect", eventData);
          lastInputselectEventData = eventData;
        }
      }
    });

    // Now handle content selection

    // TODO: Handle a possible bug here as well
    // clear this lastEvent when element gets deselected
    var lastContentselectEventData = null;

    function getRangeObject(selectionObject) {
      if (selectionObject.getRangeAt)
        return selectionObject.getRangeAt(0);
      else { // Safari!
        var range = document.createRange();
        range.setStart(selectionObject.anchorNode,selectionObject.anchorOffset);
        range.setEnd(selectionObject.focusNode,selectionObject.focusOffset);
        return range;
      }
    }

    // TODO: Figure out how to handle stopped bubbling
    // of mousedown and mouseup
    $(document).on("mousemove.screenjs mousedown.screenjs mouseup.screenjs", function(domEvent){
      if ( screenjs.isMouseDown || domEvent.type == "mousedown" || domEvent.type == "mouseup" ) {
        var selectionObject = window.getSelection()
        if ( window.getSelection().toString() != "" && selectionObject.rangeCount > 0 ) {
          rangeObject = getRangeObject(selectionObject);
          var eventData = {
            startNodeId: screenjs.mirrorClient.serializeNode(rangeObject.startContainer),
            startNodeOffset: rangeObject.startOffset,
            endNodeId: screenjs.mirrorClient.serializeNode(rangeObject.endContainer),
            endNodeOffset: rangeObject.endOffset
          };
          if ( lastContentselectEventData != eventData ) {
            console.log(eventData);
            console.log(lastContentselectEventData);
            appendEvent("contentselect", eventData);
            lastContentselectEventData = eventData;
          }
        }
        setTimeout(function(){
          if ( lastContentselectEventData && ( window.getSelection().toString() == "" || selectionObject.rangeCount <= 0 ) )  {
            var eventData = {
              clear: true
            };
            appendEvent("contentselect", eventData);
            lastContentselectEventData = null;
          }
        }, 0);
      }
    });

    // $(document).on("mousedown.screenjs", function(domEvent){
    //   // This mouseup is used to capture deselection when user clicks outside or event inside of
    //   // the textarea or input
    //   console.log("Content Selection event 2");

    //   if ( lastInputselectElement ) {
    //     var eventData = {
    //     nodeId: screenjs.mirrorClient.serializeNode(lastInputselectElement),
    //     selectionStart: lastInputselectElement.selectionStart,
    //     selectionEnd: lastInputselectElement.selectionEnd
    //     };
    //     if ( lastInputselectEventData != eventData ) {
    //       appendEvent("inputselect", eventData);
    //       lastInputselectEventData = eventData;
    //     }
    //   }
    // });

  };
  var playSelectionEvents = function(event){
    if ( checkEventType(event, "inputselect") ) {
      // TODO: Consider using a generic way of calling such handlers rather than a seperate
      // function for each event
      getPlayFrameScreenjs().handleInputselect(event.data);
    } else if ( checkEventType(event, "contentselect") ) {
      console.log(event.data);
      getPlayFrameScreenjs().handleContentselect(event.data);
    }
  };

  var recordFormEvents = function(){
    // TODO: Select doesn't open and can not be opened with js
    // need to figure this out
    $("input,select,textarea").on("change.screenjs", function(domEvent){
      console.log("Change change event");
      if ( this == domEvent.target ) {
        console.log("Recording event called");
        var $element = $(domEvent.target);
        var val = $element.val();

        if ( $element.is("input[type=radio]") || $element.is("input[type=checkbox]") ) {
          if ( $element.is(":checked") ) {
            val = true;
          }
          else {
            val = false;
          }
        }
        else if ( $(domEvent.target).is("input[type=password]") ) {
          val = val.replace(/./g, "-");
        }
        appendEvent("change",
        {
          nodeId: screenjs.mirrorClient.serializeNode(domEvent.target),
          value: val
        });
      }
    });

    $("input,select,textarea").on("paste.screenjs", function(domEvent){
      console.log("Paste change event");
      if ( this == domEvent.target ) {
        (function(domEvent){
          setTimeout(function(){
            var $element = $(domEvent.target);
            var val = $element.val();

            if ( $(domEvent.target).is("input[type=password]") ) {
              val = val.replace(/./g, "-");
            }
            appendEvent("change",
            {
              nodeId: screenjs.mirrorClient.serializeNode(domEvent.target),
              value: val
            });
          }, 0);
        })(domEvent);
      }
    });
  };
  var playFormEvents = function(event){
    if ( checkEventType(event, "change") ) {
      getPlayFrameScreenjs().changeElementValue(event.data);
    }
  };

  var recordNavigationEvents = function(){

  };
  var playNavigationEvents = function(){
    
  };

  var recordMiscEvents = function(){
    // track scrolling
    // TODO: Track scrolling event inside a div
    var scrollHandler = function(domEvent){
      console.log(screenjs.mirrorClient.serializeNode(domEvent.target));
      if ( this == domEvent.target ) {

        appendEvent("scroll",
        {
          nodeId: screenjs.mirrorClient.serializeNode(domEvent.target),
          scrollTop: $(this).scrollTop(),
          scrollLeft: $(this).scrollLeft()
        });
      }
    };
    $(document).on("scroll.screenjs", scrollHandler);
    $("*").on("scroll.screenjs", scrollHandler);
  };
  var playMiscEvents = function(event){
    // play scrolling
    if ( checkEventType(event, "scroll") ) {
      var eventData = event.data;
      getPlayFrameScreenjs().scroll(eventData);
    }
  };  

  function registerEventHandlers(){
    // handle DOM Mutation events
    recordDOMMutationEvents();

    // handle mouse movements
    recordMouseEvents();

    // handle keyboard events
    recordKeyboardEvents();

    // handle text selection events
    recordSelectionEvents();

    // handle form submition event
    recordFormEvents();

    // handle navigation event i.e. unloading of page

    // misc events like scroll
    recordMiscEvents();

    // TODO: Investigate how to record mouseover event for
    // elements which use :hover, :active pseudo-elements
    // may be querying for styles on mouseenter and 
    // checking for changes in computed style
    // would be the solution

    // TODO: handle video playback events for youtube and vimeo
  };

  function removeEventHandlers(){
    $(document).off(".screenjs");
    $("*").off(".screenjs");
  };

  screenjs.record = function(options){
    options = options || {};
    options.eventCallback = options.eventCallback || function(event){
      console.log(event);
    };

    // TODO: Create seperate function to do intialization
    screenjs.isMouseDown = false;

    var eventType = "start";
    var eventData = {
      //html: getPageHTMLWithCSS(),
      base: window.location.href.match(/^(.*\/)[^\/]*$/)[1],
      height: $(window).height(),
      width: $(window).width()
    };

    appendEvent(eventType, eventData);

    registerEventHandlers();

    screenjs.recording = true;
  };

  screenjs.stopRecording = function(){
    removeEventHandlers();
    screenjs.recording = false;
    var events = screenjs.events;
    screenjs.events = [];
    return events;
  };

  screenjs.playEvent = function(event){
    if ( checkEventType(event, ["mousemove", "mousedown", "mouseup"]) ) {
      playMouseEvents(event);
    }
    else if ( checkEventType(event, "DOMMutation") ) {
      playDOMMutationEvents(event);
    }
    else if ( checkEventType(event, ["keypress"]) ) {
      playKeyboardEvents(event);
    }
    else if ( checkEventType(event, ["inputselect", "contentselect"]) ) {
      playSelectionEvents(event);
    }
    else if ( checkEventType(event, ["change"]) ) {
      playFormEvents(event);
    }
    else {
      playMiscEvents(event);
    }
    return event.time;
  };

  screenjs.startEventLoop = function(){
    var frameRate = 100;
    var interval = 1000 / frameRate;
    var $playFrame = $(screenjs.playFrame);
    screenjs.playFrame.left = 0;
    screenjs.playFrame.top = 0;

    // screenjs.intervalId = setInterval(function(){
    //   // console.log("Inside interval");
    //   var curTime = Number(new Date());
    //   var curTimeOffset = curTime - screenjs.startPlayTime;
    //   var event = null;
    //   while ( event = getNextEvent() ){
    //     var eventOffset = event.time - screenjs.startEventTime;
    //     screenjs.playEvent(event);
    //     if ( eventOffset >= curTimeOffset ) {
    //       break;
    //     }
    //   }
    //   if (!event) {
    //     screenjs.stopPlaying();
    //   }
    // }, interval);

    function playNextEvent(eventIndex){
      var event = screenjs.events[eventIndex];
      var prevEvent = screenjs.events[eventIndex-1];

      if (event && screenjs.playing){
        var timeDiff = 0;
        if (prevEvent) { // which shoulbe be true always except for 1st
          timeDiff = event.time - prevEvent.time;
        }
        screenjs.timeoutId = setTimeout(function(){
          screenjs.playEvent(event);
          playNextEvent(eventIndex+1);
        }, timeDiff);
      }
    };

    playNextEvent(0);
    
    console.log("Interval created ID: " + screenjs.intervalId);
  };

  screenjs.play = function(options){

    screenjs.playerContainer = options.playerContainer;

    $playerContainer = $(playerContainer);

    $playerContainer.html("<div><iframe></iframe></div>");

    // TODO: Use class for this
    screenjs.frameOverlay = $playerContainer.find("div").css({
      width:"100%",
      height:"100%",
      overflow:"hidden",
      position:"relative"
    })[0];

    showMouseImages();

    // TODO: Use class for this
    $playerContainer.find("iframe").css({
      width:"100%",
      height:"100%",
      border:"0"
    });

    screenjs.playFrame = $playerContainer.find("iframe")[0];
    screenjs.events = options.events;
    screenjs.currentEventIndex = -1;

    // TODO: Do initialization in seperate function
    screenjs.isMouseDown = false;

    var event = getNextEvent();
    var eventData = screenjs.events[0].data;

    // var frame = $("<iframe></iframe>");
    // frame.css({
    //   width: eventData.width,
    //   height: eventData.height
    // });

    // frame[0].contentDocument.write(eventData.html);

    screenjs.playFrame.src = "about:blank";
    setTimeout(function(){
      //screenjs.playFrame.contentDocument.write(eventData.html);

      loadScriptInPlayFrame("http://code.jquery.com/jquery-1.9.1.min.js");
      loadScriptInPlayFrame("init.js");
      loadScriptInPlayFrame("mutation_summary.js");
      loadScriptInPlayFrame("tree_mirror.js");
      loadScriptInPlayFrame("play.js?a16");

      // TODO: Wait for play.js to load and then continue
      // imnprove it from simple setTimeout
      setTimeout(function(){

        var t = eventData.base;
        getPlayFrameScreenjs().base = eventData.base

        screenjs.startPlayTime = Number(new Date());
        screenjs.startEventTime = event.time;
        screenjs.playing = true;

        screenjs.startEventLoop();
      }, 300);
    }, 10)
  };

  screenjs.stopPlaying = function(){
    screenjs.playing = false;
    console.log("Interval cleared : " + screenjs.intervalId);
    clearInterval(screenjs.timeoutId);
  };

  window.screenjs = screenjs;

})(window.screenjs$);