var plugins = require('/plugins').plugins;
var padeditor = require('/pad_editor').padeditor;

function customStart()
{
    jQuery.getScript("/static/js/jquery-ui.js", function() {
    });
    
    plugins.addClientHook("aceAttribsToClasses",
			  { "aceAttribsToClasses": function(obj) {
			      if (obj.key == "choice") {
				  return "choice";
			      }
			      if (obj.key == "suggestion") {
				  return "suggestion";
			      }
			      if (obj.key == "formula") {
				  return "formula";
			      }
			      if (obj.key == "cmd") {
				  return "cmd";
			      }
			      if (obj.key == "par") {
				  return "par";
			      }
			  }});

    plugins.addClientHook("clickedOnChoice", 
			  { "clickedOnChoice": function(elem) 
			    {
				console.log(padeditor);
				frame = padeditor.ace.getFrame();
				pos2 = $(frame).offset();
				pos = $(elem).offset();
				pos.left += $(elem).width()+25;
				pos.top += $(elem).height()+5;
				jQuery("<div/>", {
				    "text":"Hello there"
				}).dialog({
				    position:[pos.left+pos2.left,pos.top+pos2.top],
				    title:"Please choose",
				});
			    }
			  });

    
}