// screen.js

(function($){
  $(function(){

    
    function getPageHTML(){
      var re = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
      var html = $("html").html().replace(re, "");
      if ( html.indexOf("<head>") >= 0 ) {
        html = html.replace("<head>", "<head><base href='"+ window.location.href +"' />");
      }
      return html;
    };

    console.log(getPageHTML());

    var screen = {};

    screen.record = function(options){
      options.eventCallback ||= function(event){
        console.log(event);
      };

      
    };
  });
})(window.screenjs$);