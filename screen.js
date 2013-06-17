// screen.js

(function($){

  var screenjs = {};

  screenjs.events = []; // for recording and playing

  screenjs.playFrame = null;

  screenjs.recording = false;
  screenjs.playing = false;

  screenjs.debug = true;

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

    var mirrorClient = new TreeMirrorClient(document, {
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
    $(document).on("mousemove.screenjs", function(event){
      appendEvent(
        "mousemove",
        {
          pageX: event.pageX,
          pageY: event.pageY
        }
      );
    });
    // mouse events
    $("*").on("mousedown.screenjs", function(event){
      if ( this == event.target ) {
        console.log("mousedown event called");
        appendEvent(
          "mousedown",
          {
            pageX: event.pageX,
            pageY: event.pageY
          }
        );
      }
    });
    $("*").on("mouseup.screenjs", function(event){
      if ( this == event.target ) {
        console.log("mouseup event called");
        appendEvent(
          "mouseup",
          {
            pageX: event.pageX,
            pageY: event.pageY
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
      screenjs.isMouseDown = false
      var eventData = event.data;
      screenjs.clickCircle.css({
        left: "-500px",
        top: "-500px",
        display: "none"
      });
      // getPlayFrameScreenjs().setMouseStatus(eventData.pageX, eventData.pageY, false);
    }
  };

  var recordKeyboardEvents = function(){
    // TODO : Later
  };
  var playKeyboardEvents = function(){
    // TODO : Later
  };

  var recordContentSelectionEvents = function(){

  };
  var playContentSelectionEvents = function(){

  };

  var recordFormSubmitEvents = function(){

  };
  var playFormSubmitEvents = function(){
    
  };

  var recordNavigationEvents = function(){

  };
  var playNavigationEvents = function(){
    
  };

  var recordMiscEvents = function(){
    // track scrolling
  };
  var playMiscEvents = function(){
    // play scrolling
  };  

  function registerEventHandlers(){
    // handle DOM Mutation events
    recordDOMMutationEvents();

    // handle mouse movements
    recordMouseEvents();

    // handle keyboard events
    // handle text selection events
    // handle form submition event
    // handle navigation event i.e. unloading of page

    // TODO: Investigate how to record mouseover event for
    // elements which use :hover, :active pseudo-elements
    // may be querying for styles on mouseenter and 
    // checking for changes in computed style
    // would be the solution

    // TODO: handle video playback events for youtube and vimeo
  };

  function removeEventHandlers(){
    $("*").off(".screenjs");
  };

  screenjs.record = function(options){
    options = options || {};
    options.eventCallback = options.eventCallback || function(event){
      console.log(event);
    };

    var eventType = "start";
    var eventData = {
      html: getPageHTMLWithCSS(),
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
      var nextEvent = screenjs.events[eventIndex+1];

      if (nextEvent && screenjs.playing){
        var timeDiff = nextEvent.time - event.time;
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
      loadScriptInPlayFrame("play.js?a4");

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