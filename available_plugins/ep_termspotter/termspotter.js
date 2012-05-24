var autolinker = require("./autolinker.js");
var autolinker = autolinker.autolinker();
var padMessageHandler = require("ep_etherpad-lite/node/handler/PadMessageHandler");
var Changeset = require("ep_etherpad-lite/static/js/Changeset.js");
var AttribFactory = require("ep_etherpad-lite/static/js/AttributePool");
var PadManager = require("ep_etherpad-lite/node/db/PadManager.js");

exports.onNewChanges = function(hook_name, args, cb) {
    pad = args["pad"];
    
    cs = autolinker.link(pad.atext, pad.apool());
    
    return cb([cs]);
}

exports.attribsToClasses = function(hook_name, args, cb) {
    console.log(cb);
}

exports.onUIEvent = function(hook_name, args, cb) {
    state = args.state;
    args  = args.args;
    if (args[0]=="choice") {
	choices = [];
	args[1].split(".").forEach(function(elem) {
	    term = autolinker.getDictioraryTerm(elem);
	    choices.push({
		"text": " cd="+term.cd+" name="+term.name,
		"val" : elem
	    });
	});
	
	result = {
	    "type" : "choice",
	    title: "A semantic term was identified. Please choose the term reference to add",
	    choices: choices,
	    buttons: [{"title": "Insert reference",
		       "value": "insert"},
		      {"title": "Never show again",
		       "value": "hideforever"}]
	};
	return cb(result);
    }
    if (args[0]=="insert") {
	offset  = state.offset;
	padid = state.padid;
	PadManager.getPad(padid, function(err, pad) {
	    if (pad == null)
		return;
	    atext = pad.atext;
	    pool  = pad.apool();
	    cs = insertReference(offset, args[1], atext, pool);
	    if (cs) {
		pad.appendRevision(cs);
		padMessageHandler.updatePadClients(pad, cb);
	    }
	});
	return cb({"type":"end"});
    }
    return cb([]);
}

function containsMap(a, obj) {
    var i = a.length;
    while (i--) {
       if (obj[a[i]]) {
           return true;
       }
    }
    return false;
}

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] == obj) {
           return true;
       }
    }
    return false;
}

function searchRanges(atext, attList) {
    iter = Changeset.opIterator(atext.attribs);
    var chars = 0;
    var lines = 0;
    var last = false;
    var begin, end;
    var result = [];
    while (iter.hasNext()) {
	var o = iter.next();
	var e = false;
	if (containsMap(o.attribs.split("*"), attList)) {
	    if (last) {
		end = {"offset":chars+o.chars, "lines":lines+o.lines};
	    } else {
		begin = {"offset":chars, "lines":lines};
		end = {"offset":chars+o.chars, "lines":lines+o.lines};
	    }
	    last = true;
	} else {
	    if (last) {
		result.push([begin, end]);
	    }
	    last = false;
	}
	chars += o.chars;
	lines += o.lines;
    }
    if (last) {
	result.push([begin, end]);
    }
    return result;
}

function insertReference(offset, wordid, atext, pool) {
    term = autolinker.getDictioraryTerm(wordid);
    if (typeof(term)=="undefined")
   	return null;
    search = {};
    var offset = offset;
    pool.eachAttrib(function(key, val) {
	if (key!="choice:termspotter")
	    return;
	if (contains(val.split("."),wordid)) {
	    id = pool.putAttrib([key,val], false);
	    search[Changeset.numToString(id)]=true;
	}
    });
    var cs = null;
    searchRanges(atext, search).forEach(function(val) {
	if (val[0].offset<=offset && offset<=val[1].offset) {
	    var builder = Changeset.builder(atext.text.length);
	    for (i=val[0].offset; i>0 && atext.text[i]!="\n"; i--);
	    if (i<val[0].offset) {
		builder.keep(i+1, val[0].lines);
		builder.keep(val[0].offset-i-1, 0);
	    } else
		builder.keep(val[0].offset, val[0].lines);
		
	    builder.insert("\\termref[cd="+term.cd+" name="+term.name+"]{");
	    builder.keep(val[1].offset-val[0].offset, val[1].lines-val[0].lines);
	    builder.insert("}");
	    cs = builder.toString();
	}
    });
    return cs;
}

function test() {
    var atext = Changeset.makeAText("text node     asd ad as text node  \n abbelian group a \nWelcome to Etherpad Lite! \n\na function f i text node s called injective iff $f$ surjectivity a\n\n\\text{}   \nand synchronized with other types of views. \n text node and other  \nThis pad text is synchronized as you type, so that everyone viewing this page sees the same text. This allows you to collaborate seamlessly on documents!\n\nEtherpad Lite on Github: http://j.mp/ep-lite\n\n", "*0*1*2+5*3*1*2+4*1+f*0*1*2+5*3*1*2+4*1|1+3*1+a*4*1*2+5*1|3+w*1+2*5*1*2+8*1+5*0*1*2+5*3*1*2+4*1+2*1*6+6*1+2*7*1*2+9*1+9*8*1*2+c*1|2+4*9+5*a+2+3*1|1+1*1+4*b*1*2+c*1+c*c*1*2+5*1+4*d*1*2+5*1+2*1*2|1+1*1+1*0*1*2+5*3*1*2+4*1|1+d*1+h*b*1*2+c*1+8*c*1*2+4*1+j*d*1*2+7*1+21*e*1*2+2*1|2+d*1+e*e*1*2+2*1+9*f*1*2+4*1|2+h");
    var pool = AttribFactory.createAttributePool().fromJsonable({"numToAttrib":{"0":["choice:termspotter","3"],"1":["highlight-css","stex-identifier"],"2":["ui-decoration","termref-suggestion"],"3":["choice:termspotter","3.309.476"],"4":["choice:termspotter","99"],"5":["choice:termspotter","1066.569"],"6":["italic","true"],"7":["choice:termspotter","316"],"8":["choice:termspotter","1185.317"],"9":["highlight-css","stex-command"],"10":["highlight-css","stex-bracket"],"11":["choice:termspotter","1177"],"12":["choice:termspotter","1055.529.575"],"13":["choice:termspotter","1181"],"14":["choice:termspotter","431"],"15":["choice:termspotter","1031"]},"nextNum":16});
    cs = insertReference(28, "3", atext, pool);
    if (cs) {
	atext = Changeset.applyToAText(cs, atext, pool);
	console.log(atext);
    }
}