// screen.js

(function($){

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

    return event;
  };

  function registerEventHandlers(){
    // handle DOM Mutation events
    // handle mouse movements
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

  var screenjs = {};

  screenjs.record = function(options){
    options = options || {};
    options.eventCallback = options.eventCallback || function(event){
      console.log(event);
    };

    var events = [];

    var eventType = "start";
    var eventData = {
      html: getPageHTMLWithCSS(),
      height: $(window).height(),
      width: $(window).height()
    };

    events.push(createEvent(eventType, eventData));

    console.log(events);
  };

  window.screenjs = screenjs;

})(window.screenjs$);