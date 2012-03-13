var Changeset = require("ep_etherpad-lite/static/js/Changeset.js");
var AttribFactory = require("ep_etherpad-lite/static/js/AttributePoolFactory");

var linksrv = require("./linkersrv.js").linkersrv;

exports.autolinker = function() {
    var root = new trie.Trie();
    root.add(["abbelian","group"], 0);
    root.add(["group"], 1);
    root.add(["triangle"], 2);
    root.add(["right","triangle"], 3);

    function autolinker() {
    }

    function event(type, pos, att) {
	this.type = type;
	this.pos  = pos;
	this.att  = att;
	return this;
    }

    function sortEvent(a,b)
    {
	return a.pos - b.pos;
    }

    autolinker.link = function(atext, apool) {
	var events = [];
	found = linksrv(atext.text, root, 0);
	
	for (i=0; i<found.length; ++i) {
	    found[i].text.sort();
	    wid = found[i].text.join(".");
	    events.push(new event("begin", found[i].start, wid));
	    events.push(new event("end", found[i].finish+1, wid));
	}
	for (start = 0; (start = atext.text.indexOf("\n", start+1)) != -1;)
	    events.push(new event("new_line", start, 1));
	events.sort(sortEvent);
	
	var builder = Changeset.builder(atext.text.length);

	last = 0; lines = 0; changed = 0;
	attr = [];

	for (var i=0; i<events.length; ++i) {
	    if (events[i].pos > last) {
		att = attr.join(".");
		builder.keep(events[i].pos-last, 0, [["choice:termspotter", att]], apool);
		last = events[i].pos;
	    } 

	    if (events[i].type == "begin") 
		attr.push(events[i].att);
	    if (events[i].type == "end") {
		id = attr.indexOf(events[i].att);
		attr.splice(id, 1);
	    }
	    if (events[i].type == "new_line") {
		att = attr.join("");
		builder.keep(1, 1, [["choice:termspotter",att]], apool);
		last = events[i].pos+1;
	    }
	}
	
	return builder.toString();
    }
    
    autolinker.rehighlight = function (cs, _apool) {
	var text = atext.text;
	
    }
    
    return autolinker;
}

function test() {

    var linker = exports.autolinker();
    apool = AttribFactory.createAttributePool();
    atext = Changeset.makeAText("this is a group\n that is\n not however an abbelian\n group");
    cs = linker.link(atext, apool);
    console.log(cs);
    console.log(apool);
}

//test();