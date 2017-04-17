/** self details */
var selfName;
var peerName;
var connectedPeerName;
/** audio,video: */
var localAVStream;
var localConnection; //to the internet


/** connect to the server! */
var conn = new WebSocket('wss://172.17.181.112:9090');
conn.onopen = function () {
	console.log("connected to the server");
};

function send(msg)
{
	conn.send(JSON.stringify(msg));
}

conn.onmessage = function(msg) {
	console.log("got message from server ", msg.data);
	try {
		var msg_data = JSON.parse(msg.data);
		switch(msg_data.type) {
		case "login":
			handleLogin(msg_data.success);
			break; /**< "login" */
		case "offer":
			handleOffer(msg_data.offer, msg_data.name);
			break;
		case "answer":
			handleAnswer(msg_data.answer);
			break;
		case "candidate":
			handleCandidate(msg_data.candidate);
			break;
		case "hangUp":
			handleHangUp();
			break;
		default:
			console.log("unidentified msg from server");
		break;
		}
	}catch(e){console.log("caught exception", e);}
}

/** UI module selectors */

var loginPage = document.querySelector('#loginPage');
var usernameInput = document.querySelector('#usernameInput');
var loginBtn = document.querySelector('#loginBtn');

var callPage = document.querySelector('#callPage');
var peerNameInput = document.querySelector('#peerName');
var callBtn = document.querySelector('#callBtn');
var hangUpBtn = document.querySelector('#hangUpBtn');
var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

//hide callPage when we start
callPage.style.display = "none";

//login {type,name:"self"} when button is clicked
loginBtn.addEventListener("click", function(event) {
	selfName = usernameInput.value;
	if(selfName.length > 0){
		send({type:"login", name:selfName});
	}
});

//Call peer
callBtn.addEventListener("click", function(event) {
	peerName = peerNameInput.value;
	console.log("connecting to ", peerName);
	if(peerName.length > 0){
		connectedPeerName = peerName;
		localConnection.createOffer(function(offer){
			console.log("send offer");
			send({type:"offer", name:connectedPeerName, offer:offer});
			localConnection.setLocalDescription(offer);
		}, function(error){
			alert("error creating offer");
		});
	}
});

//hangUp connected peer
hangUpBtn.addEventListener("click", function(event){
	send({type:"hangUp", name:connectedPeerName});
	handleHangUp();
});

//receive offer from another collab client
function handleOffer(offer, name){
	console.log("handle offer");
	connectedPeerName = name;
	localConnection.setRemoteDescription(new RTCSessionDescription(offer));
	localConnection.createAnswer(function(answer){
		localConnection.setLocalDescription(answer);
		send({type:"answer", name:connectedPeerName, answer:answer});
		}, function(error){
			alert("error while creating answer");
		});
}

//receive an answer from a collab client to whom we had sent offer
function handleAnswer(answer) {
	console.log("handle answer");
	localConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

//receive the ICE candidate from collab. client
function handleCandidate(candidate) {
	console.log("handle candidate");
	localConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

//receive hangUp from connected collab. client
function handleHangUp(){
	console.log("handle hangUp");
	connectedPeerName = null;
	remoteVideo.src = null;
	localConnection.close();
	localConnection.onicecandidate = null;
	localConnection.onaddstream = null;
	handleLogin(true);
}

function handleLogin(success) {
	if(success == false) {
		alert("server did not identify the entered username");
	} else {
		//display call page (when login is successful)
		loginPage.style.display = "none";
		callPage.style.display = "block"; //display this as a block elem <div>
		//start webRTC peer connection
		
		//a) start a RTCPeerConnection
		
		//get local video stream from camera + audio (microPhone)
		navigator.webkitGetUserMedia({video:true, audio:true}, 
			function(myAVStream){
			localAVStream = myAVStream;
			
			//display local AV stream on the page
			localVideo.src = window.URL.createObjectURL(localAVStream);
			
			/** ICE (Interactive Connectivity Establishment) - technique used by
			 * 2 machines on network to talk to each other as directly as 
			 * possible in peer-to-peer networking
			 * STUN: Server is used by a client to understand its global 
			 * internet address when its behind a NAT and want to talk to
			 * another client */
			var config = {"iceServers":[{url:"stun:stun2.1.google.com:19302"}]};
			localConnection = new webkitRTCPeerConnection(config);
			
			//setup stream listening
			localConnection.addStream(localAVStream);
			/* when a remote user addStream to the peer (which is us) connection
			 * we display it 
			 */ 
			localConnection.onaddstream = function(s) {
				remoteVideo.src = window.URL.createObjectURL(s.stream);
			};
			//setup ICE handling
			localConnection.onicecandidate = function(event) {
				if(event.candidate) {
					send({type:"candidate", name:connectedPeerName, candidate:event.candidate});
				}
			};
		}, function(error) {
			console.log(error);
		});
	}
}