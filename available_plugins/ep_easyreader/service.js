var CommonCode = require("../../node/utils/common_code");
var Changeset = CommonCode.require("/Changeset");
var AttribFactory = CommonCode.require("/AttributePool.js");

exports.service = function() {

    var tid = 0;
    var tprefixes = [];
    var tsuffixes = [];

    function service() {
    }

    function event(type, pos, attr) {
	this.type = type;
	this.pos  = pos;
	this.attr  = attr;
	return this;
    }

    function sortEvent(a,b)
    {
	return a.pos - b.pos;
    }

    service.run = function(atext, apool) {
	var events = [];

	var re = new RegExp("(\\\\termref\\{[^}]*\\}\\{)([^}]*)(\\})");

	function service() {
	}

	var str = atext.text;
	var m, prefix = 0;

	while (m = str.match(re)) {
	    ID = tid++;
	    tprefixes[ID] = m[1];
	    tsuffixes[ID] = m[3];
	    attrid = apool.putAttrib(["easyreader","tref-"+ID]);

	    m.index += prefix;
	    events.push(new event("remove", m.index));
	    m.index += m[1].length;
	    events.push(new event("keep", m.index, attrid));
	    m.index += m[2].length;
	    events.push(new event("remove", m.index));
	    events.push(new event("keep", m.index+m[3].length));
	    str = str.slice(m.index+m[3].length);
	    prefix += m.index+m[3].length;
	}

	for (start = 0; (start = atext.text.indexOf("\n", start+1)) != -1;)
	    events.push(new event("new_line", start, 1));
	events.sort(sortEvent);
	console.log(events);
	
	var builder = Changeset.builder(atext.text.length);

	last = 0; lines = 0; changed = 0;
	attr = 0;

	var KEEP_MODE = 0;
	var REMOVE_MODE = 1;

	var state = KEEP_MODE;
	for (var i=0; i<events.length; ++i) {

	    if (state == KEEP_MODE && events[i].pos > last) {
		builder.keep(events[i].pos-last, 0, [["easyreader",""]], apool);
		last = events[i].pos;
	    }

	    if (events[i].type == "tbegin") {
		state = SPECIAL_MODE;
		builder
	    }

	    if (events[i].type == "tend") {
	    }

	    if (state == NORMAL_TEXT && events[i].type == "new_line") {
		builder.keep(1, 1, [["easyreader",""]], apool);
		last = events[i].pos+1;
	    }
	}
	
	return builder.toString(); 
    }
    
    return service;
}

function test() {
    var service = exports.service();
    apool = AttribFactory.createAttributePool();
    atext = Changeset.makeAText("this \\termref{cd=test}{some text} is \\termref{cd=test}{some text} a group\n that is\n not however an abbelian\n group");
    cs = service.run(atext, apool);
    console.log(cs);
    console.log(apool);
}

test();