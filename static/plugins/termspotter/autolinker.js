var Changeset = require("../../js/Changeset.js");
var AttribFactory = require("../../js/AttributePoolFactory.js");
var annsrv = require("linkersrv.js")

exports.autolinker = function() {
    var lines;
    var linesMutator;

    function stateLine(_line, _state) {
	this.line = _line;
	this.state = _state;
	return this;
    }

    function autolinker() {
    }

    autolinker.link = function(atext, apool) {
	lines = [];
	jLines = Changeset.splitTextLines(atext.text);
	var state = mode.startState();
	var builder = Changeset.builder(atext.text.length);

	for (var i=0; i<jLines.length; ++i) {
	    var sty = CodeMirror.highlight(jLines[i], mode, state);
	    console.log(sty);
	    for (var j=0; j+1<sty.length;j+=2) {
		if (j+2>=sty.length)
		    lineEnd = 1;
		else 
		    lineEnd = 0;
		if (sty[j+1]) {
		    builder.keep(sty[j], lineEnd, [["highlight-css", sty[j+1]]], apool);
		} else
		    builder.keep(sty[j], lineEnd);
	    }
	    lines.push(new stateLine(jLines[i], mode.copyState(state)));
	}
	linesMutator = Changeset.textLinesMutator(lines);
	return builder.toString();
    }
    
    highlighter.rehighlight = function (cs, _apool) {
	var text = atext.text;
	
    }
    
    return highlighter;
}

function test() {

    var highlighter = exports.highlighter("stex");
    apool = AttribFactory.createAttributePool();
    atext = Changeset.makeAText("test \\begin{\ntest} lala");
    cs = highlighter.highlight(atext, apool);
    console.log(cs);
    console.log(apool);
}

//test();