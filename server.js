
var fs = require('fs');

var https = require('https');
    var privateKey  = fs.readFileSync('ws.key', 'utf8');
    var certificate = fs.readFileSync('ws.crt', 'utf8');

    var credentials = {key: privateKey, cert: certificate};
    var express = require('express');
    var app = express();

    //... bunch of other express stuff here ...

    //pass in your express app and credentials to create an https server
    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(9090, "172.17.181.112");
   
//const localWebServer = require('local-web-server');



//require ws library - which we had installed #npm install ws
// load ws module using require() and create a Server
var WebSocketServer = require('ws').Server;
//var wss = new WebSocketServer({port:9090});

var wss = new WebSocketServer({server:httpsServer});
//var to store all the connected collab. clients
var users = {};

//helper function:
function sendTo(conn, msg_json) {
	conn.send(JSON.stringify(msg_json));
}

//listen to the 'connection' event on the created WebSocket server
wss.on('connection', function(conn) {
	//msg_data = {type:"", name:""}
	var msg_data;
	console.log("user connected");
	
	//handle message event:
	conn.on('message', function(msg){
		console.log("Got message from user:", msg);
		//collab. client shall send a JSON msg with uname and pwd
		try {
			msg_data = JSON.parse(msg);
		}catch(e) {
			msg_data = {};
		}
		switch(msg_data.type)
		{
		case "login": /**< {type:"login", name:"selfName"} */
			console.log("User ", msg_data.name, " logged in");
			//check if he is already in
			if(users[msg_data.name])
			{
				sendTo(conn, {type:"login", success:false});
			} else {
				users[msg_data.name] = conn;
				conn.name = msg_data.name; 
				//add a new key name with uname into conn object
				sendTo(conn, {type:"login", success:true});
			}
			break; /**< "login" */
			
		/** when one client want to call another;
		 * CCA sends offer message to CCB */
		case "offer": /**< {type, offer, name:"peerName", offer:"" } */
			//say collab. client A calls client B
			var connCCB = users[msg_data.name];
			if(connCCB != null){
				conn.peerName = msg_data.name;
				sendTo(connCCB, {type:"offer", offer:msg_data.offer, 
					name:conn.name});
			} else {
				console.log("User ", msg_data.name, " does not exist");
			}
			break;
		/** when a client receive "offer", it can:
		 * "answer" the offer , so server shall pass this to respective 
		 * client who is waiting for its offer's resonse */
		case "answer": /**< {type:"answer", name:"peerName", answer:""} */
			console.log("sending answer to ", msg_data.name);
			/** say CCB answers & we need to relay it to CCB */
			var connCCA = users[msg_data.name];
			if(connCCA != null) {
				conn.peerName = msg_data.name;
				sendTo(connCCA, {type:"answer", answer:msg_data.answer});
			}else {
				console.log("could not relay answer");
			}
			break; /**< "answer" */
		case "candidate":
			console.log("sending candidate details to ", msg_data.name);
			var connCCP = users[msg_data.name];
			if(connCCP != null) {
				sendTo(connCCP, {type:"candidate", 
					candidate:msg_data.candidate});
			}
			break; /**< "candidate" */
		case "hangUp": /**< {type:"hangUp", name:"peerName"} */
			console.log("disconnecting the call with ", msg_data.name);
			var connCCP = users[msg_data.name];
			if(connCCP != null) {
				connCCP.peerName = null;
				sendTo(connCCP, {type:"hangUp"});
			}else {
				console.log("error no peer");
			}
			break; /**< "hangUp" */
		default:
			sendTo(conn, {type:"error", message: "command not found " + 
				data.type});
			break;
		}
	});
	
	//handle close event
	conn.on('close', function() {
		if(conn.name) {
			//delete entry in users var
			delete users[conn.name];
		}
		if(conn.peerName){
			console.log("call hangUp auto on peer ", conn.peerName);
			var connCCP = users[conn.peerName];
			if(connCCP != null) {
				sendTo(connCCP, {type:"hangUp"});
			}
		}
	});
	conn.send("Server accepted");
} );
