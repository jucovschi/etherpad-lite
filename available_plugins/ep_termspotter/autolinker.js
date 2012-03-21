var Changeset = require("ep_etherpad-lite/static/js/Changeset.js");
var AttribFactory = require("ep_etherpad-lite/static/js/AttributePoolFactory");
var linksrv = require("./linkersrv.js").linkersrv;
var fs = require("fs");
var path = require("path");
var XmlStream = require("xml-stream");


exports.autolinker = function() {
    var root = new trie.Trie();
    var dict = []; 

    function parseDictionaryFile(fileName) {
	var stream = fs.createReadStream(path.join(__dirname, fileName));
	var xml = new XmlStream(stream);
	xml.on("endElement: tnt:result", function(item) {
	    if (typeof(item.term) == "undefined")
		return;
	    if (typeof(item.term.$text) == "undefined")
		return;
	    dict.push(
		{text: item.term.$text,
		 cd: item.term.$.cd,
		 name: item.term.$.name}
	    );
	});
	xml.on("endElement: tnt:results", function(item) {
	    for (var i=0; i<dict.length; i++) {
		var gr = dict[i].text.toLowerCase().split(" ");
		root.add(gr, i); 
	    }
	});
    }
    
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
	
	for (var i=0; i<found.length; ++i) {
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
		attrib = [["choice:termspotter", att]];
		if (attr.length>0) {
		    attrib.push(["ui-decoration", "termref-suggestion"]);
		}
		builder.keep(events[i].pos-last, 0, attrib, apool);
		last = events[i].pos;
	    } 

	    if (events[i].type == "begin") 
		attr.push(events[i].att);
	    if (events[i].type == "end") {
		id = attr.indexOf(events[i].att);
		attr.splice(id, 1);
	    }
	    if (events[i].type == "new_line") {
		att = attr.join(".");
		attrib = [["choice:termspotter", att]];
		if (attr.length>0) {
		    attrib.push(["ui-decoration", "termref-suggestion"]);
		}
		builder.keep(1, 1, attrib, apool);
		last = events[i].pos+1;
	    }
	}
	
	return builder.toString();
    }
    
    autolinker.rehighlight = function (cs, _apool) {
	var text = atext.text;
	
    }

    autolinker.getDictioraryTerm = function(id) {
	return dict[id];
    }

    parseDictionaryFile("tntdefs.xml");
    
    return autolinker;
}

function test() {
    var linker = exports.autolinker();
    var apool = AttribFactory.createAttributePool();
    var atext = Changeset.makeAText("text node\n abelian group\n that is\n not however an abbelian\n group");
    setTimeout(function() {
	console.log("run");
	cs = linker.link(atext, apool);
	console.log(cs);
	console.log(apool);	
    }, 1000);
}


//test();