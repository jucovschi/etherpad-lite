/**
 * Handles the import requests
 */

/*
 * 2011 Peter 'Pita' Martischka (Primary Technology Ltd)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var ERR = require("async-stacktrace");
var padManager = require("../db/PadManager");
var padMessageHandler = require("./PadMessageHandler");
var async = require("async");
var fs = require("fs");
var settings = require('../utils/Settings');
var formidable = require('formidable');
var os = require("os");

//load abiword only if its enabled
if(settings.abiword != null)
  var abiword = require("../utils/Abiword");

var tempDirectory = "/tmp/";

//tempDirectory changes if the operating system is windows
if(os.type().indexOf("Windows") > -1)
{
  tempDirectory = process.env.TEMP;
}
  
/**
 * do a requested import
 */ 
exports.getBots = function(req, res, padId)
{
  //pipe to a file
  //convert file to text via abiword
  //set text in the pad
  
  var srcFile, destFile;
  var pad;
  var text;
  
  async.series([
      
      // get current pad
    function(callback)
    {
	padManager.getPad(padId, 
			  function(err, _pad)
			  {
			      if(ERR(err, callback)) return;
			      pad = _pad;
			      callback();
			  });

	// in case of errors
        // console.warn("Uploading Error: " + err.stack);
        // callback("uploadFailed");

        //everything ok, continue
        // srcFile = files.file.path;
        // callback();
    },

      function(callback)
      {
	  var apool = pad.apool();
	  var pid = apool.putAttrib(["cmd","true"]);
	  
	  callback();
      }

/*    
    //get the pad object
    function(callback)
    {
      padManager.getPad(padId, function(err, _pad)
      {
        if(ERR(err, callback)) return;
        pad = _pad;
        callback();
      });

    },
    
    //change text of the pad and broadcast the changeset
    function(callback)
    {
      pad.setText(text);
      padMessageHandler.updatePadClients(pad, callback);
    },
*/
    
  ], function(err)
  {
    //the upload failed, there is nothing we can do, send a 500
    if(err == "uploadFailed")
    {
      res.send(500);
      return;
    }

    ERR(err);
  
    //close the connection
    res.send("ok");
  });
}
