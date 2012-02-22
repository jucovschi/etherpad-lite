var io = require('socket.io/node_modules/socket.io-client');
var exports = require('./utils/Changeset');
var exports = require('changesettracker');

console.log(exports);
url = "http://localhost:9001/";
resource = "socket.io";

socket = io.connect(url, {
    resource : resource,
});

socket.once('connect', function() {
    var padId = "test";

    token = "lala";
    var sessionID = "asfasas";
    var password = "aasfasf";
    
    var msg = {
	"component" : "pad",
	"type" : "CLIENT_READY",
	"padId" : padId,
	"sessionID" : sessionID,
	"password" : password,
	"token" : token,
	"protocolVersion" : 2
    };
    socket.json.send(msg);
});

var firstMsg = true;
var initalized = false;
var rev = 1;

function sendMessage(msg)
{
  data = {
      type: "COLLABROOM",
      component: "pad",
      data: msg
  };
  socket.json.send(data);
}


function sendClientMessage(msg)
{ 
    sendMessage({type: "CLIENT_MESSAGE", payload: msg });
}

function changeClientName(clientInfo, newName, newColor) {
    sendMessage(
	{
	    type: 'USERINFO_UPDATE',
	    userInfo: {
		"userID": clientInfo.userId,
		"name": newName,
		"ip": clientInfo.clientIp,
		"colorId": newColor,
		"userAgent":"Anonymous",
	    }
	});	
}

var clientInfo = null;
var text = "";


socket.on('message', function(obj) {
    var msg = obj;
    if (firstMsg) {
	firstMsg = false;
	clientInfo = obj;
	rev = msg.collab_client_vars.rev;
	text = msg.collab_client_vars.initialAttributedText.text;
	changeClientName(clientInfo, "MathBot", "#FFAABB")
	return;
    }
    if (msg.type == "COLLABROOM") {
	msg = msg.data;
    }
   if (msg.type == "NEW_CHANGES")
    {
	var newRev = msg.newRev;
	var changeset = msg.changeset;
	console.log(changeset);
	var author = (msg.author || '');
	var apool = msg.apool;
	if (newRev != (rev + 1))
	{
            dmesg("bad message revision on NEW_CHANGES: " + newRev + " not " + (rev + 1));
            socket.disconnect();
            return;
	}
	rev = newRev;
        text = exports.applyToText(changeset, text);
	console.log(text);
    }
});

