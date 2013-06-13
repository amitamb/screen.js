// screen.js

(function($){

  var screenjs = {};

  screenjs.events = [];

  screenjs.recording = false;
  screenjs.playing = false;

  screenjs.debug = true;

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
    return event.type == expectedType;
  };

  var recordDOMMutationEvents = function(){
    var observer = new MutationSummary({
      callback: function(summaries){
        console.log(summaries);
        for(var i=0,len=summaries.length;i<len;i++){
          var summary=summaries[i];
          if (summary.added.length > 0) {
            // element added
            
          }
        }
      },
      queries: [{ 
        element: "*"
      },
      {
        attribute:"style"
      }]
    });
  };
  var playDOMMutationEvents = function(){};

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
    if ( checkEventType(event, "mouseMove") ) {
      // TODO: change position of mouse image on page
      // TODO: Show mousedown event
      // TODO: Show mouseup event
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

  screenjs.play = function(options){
    var playFrame = options.playFrame;
    var events = options.events;

    var eventData = events[0].data;

    console.log(events);

    // var frame = $("<iframe></iframe>");
    // frame.css({
    //   width: eventData.width,
    //   height: eventData.height
    // });

    // frame[0].contentDocument.write(eventData.html);

    playFrame.contentDocument.write(eventData.html);

    screenjs.playing = true;
  };

  screenjs.stopPlaying = function(){
    screenjs.playing = false;
  };

  window.screenjs = screenjs;

})(window.screenjs$);