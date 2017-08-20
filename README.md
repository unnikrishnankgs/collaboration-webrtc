# collaboration-webrtc
Wiki; WebRTC Collaboration Product initial demo
Contact:
Research activity done under the guidance of 
Professor Kaikai Liu,
Dept of Computer Engineering,
San Jose State University
RA: Unnikrishnan Sreekumar (011445889)

Overview:
Collaboration product idea:
We would like to build a web application product on an embedded box - could be a linux based raspberry pi or a more powerful board - say the APQ8094 (to do multiple HD video transcoding) hosting a web application server enabling video collaboration.
By video collaboration, we will have a number of usecases to offer. One usecase shall be collaborative video chat box on this raspberry pi or a more powerful board receiving camera content (video and audio) from a number of clients, stitch it together at the server box and show on a big screen in a classroom where students get to interact with the clients who are professors, industry experts or students from their laptops/hand-held devices and engage in a productive and collaborative conference. Also, students can subscribe and view individual client media streams on their local device.

We’re gonna see our collaboration product initial demo (https://www.youtube.com/channel/UCJObix0Eouj2ei334UzG2gw).

With web-RTC filling in a void space that was extant for long in real time data sharing over a web browser which has a multitude of software protocol stacks and utilities built in evolving over time in a tremendous pace, we aim in building a collaborative video room and may be contributing some of our work back to the chrome or the web-RTC projects.

With multimedia collaboration protocols and products being a complex technology solution for the future, this work shall enable us to learn more on this emerging field of technology which is a blend of video coding, multimedia, networking and on a broad view the internet. 

With this work, we shall be able to contribute back to the developer community at, may be Google Chrome, a SDK extension supporting a collaboration conference engine with just one click on a browser window.

Hand-held devices and PCs/laptops becoming more powerful day by day with the high end SoCs and GPUs, the emerging collaborative work culture and multimedia intensive communication environment are the sole driving factors of this research project. 
WebRTC
This protocol maintained by team chromium provide browsers and mobile applications (android and iOS now) Real-time communications (RTC) capabilities via simple APIs.
Let us start by studying and developing a browser to browser calling application over the high level webRTC APIs (all in javascript).
Later we will modify the webRTC code and may be fork chromium browser to develop a dedicated webRTC client which will turn out to become our protocol’s server allowing its clients to subscribe to ‘n’ webRTC clients’ content, connected to the local program. 

Overview

The webRTC architecture:

Here, the Web API defined by http://w3c.github.io/webrtc-pc/ will give web application developers the API to open real-time connections between their web apps running on different machines, but on the browsers that support webRTC - like chrome, mozilla, etc.
The browsers will have webRTC integrated into their code with the hook webRTC require browsers to implement themselves. This way web-apps get to use the multitude of protocol stacks built into the browser and webRTC and thereby saving a lot of time building these from scratch.

Collaboration Product Design:
The collaboration product design has 2 entities:
A Web Server which shall host:
a) A WebSocket based HTTPS signalling server at port 9090
- to allow our product users a credential login system
- to exchange the web-RTC specific data messages like the SessionDescription (OFFER/ANSWER) messages that shall carry all multimedia specific and transport specific protocol data, the ICE(Interactive Connectivity Establishment) CANDIDATE message helping in creating the best possible peer-to-peer connection.
b) A website, hosted at port 8080, providing the basic UI (HTML based) for client devices connecting to our server to login and make web-RTC calls to a peer(now, but later to this same server which shall enable collaboration by tweaking internal chrome implementation to stitch together all video data, and mixing all audio channels).
The client devices who shall individually be connecting to our collaboration server product over a web-RTC enabled browser - be it chrome on android or chrome, firefox, IE on PC’s, laptops, etc. On iOS, an opensource application named Bowser should have had the web-RTC client capability, but I could not make it work. Simple getUserMedia() API test as well failed on my iOS 10.2.1 (ofcourse this is a very small problem among the lot of big problems we are to solve).


Environment:
Installed eclipse JS IDE to write code.
webRTC require a server to serve the web application to the browser for security reasons. Installed node.js from https://nodejs.org/en/ for OS X and installed the web server package with:
{
npm install -g node-static
/usr/local/bin/static -> /usr/local/lib/node_modules/node-static/bin/cli.js
/usr/local/lib
└─┬ node-static@0.7.9 
  ├── colors@1.1.2 
  ├── mime@1.3.4 
  └─┬ optimist@0.6.1 
    ├── minimist@0.0.10 
    └── wordwrap@0.0.3 

}
Now we can just open in terminal the folder where our web-app code is written and run:
#static
This tool will start a web server with this folder as the whole website code!

Install WebSocket:
#npm install ws
Install wscat
#npm install -g wscat

webRTC initial demo (between browsers)
This demo will be a simple camera chat application between browsers using the WebRTC Web API. This demo will help us learn webRTC basics.

Future: Fork webRTC native code and build a browser with existing chromium project and thus build a video-box to do video-chat and collaboration (We could host this over the web as well with special hardware support).

#mkdir collaboration
#create package.json
#npm install bootsrap

Develop the signalling server and the website.
I’ve decided to run the signalling server on port 9090 and website on 8080 using node.js. 
The code is up on github (find link below).

Installing local-web-server
#npm install -g local-web-server
We will need openssl to generate a self-signed certificate for our HTTP server to allow clients to connect to it. (later we shall obtain the key and certificate from standard bodies so that browsers wouldn’t show up a warning saying it might not be secure to connect to our web server).
Generating the RSA key:
#openssl rsa -passin pass:x -in ws.pass.key -out ws.key
Create the certificate:
#openssl req -new -key ws.key -out ws.csr
Self sign the certificate with our RSA key:
#openssl x509 -req -days 365 -in ws.csr -signkey ws.key -out ws.crt
Remove temporary files:
#rm ws.pass.key ws.csr


Now we can run our local-web-server like this:
#ws --key ws.key --cert ws.crt
And you shall see it output something like this:
serving at https://Apples-MacBook-Pro.local:8080, https://127.0.0.1:8080, https://10.0.0.5:8080
So, now you can connect to the web server at a relevant choice from any of these web links from a device which is in the LAN.
Later we could host the web server or in fact allow our router’s setting to IP route to the hardware and ask clients to connect to router’s public IP at 8080.

Running the code:
#cd collaboration
#node server.js
On another shell:
#ws --key ws.key --cert ws.crt

Now, from any web-RTC enabled browser (tested on Linux, Mac, Windows, Android), connect to our server at say, https://10.0.0.5:8080 and share camera content.
Code:
https://github.com/unnikrishnankgs/collaboration-webrtc

References:
WebRTC Architecture:
https://webrtc.org/architecture/#
https://webrtc.org/start/
https://codelabs.developers.google.com/codelabs/webrtc-web/#0
http://io13webrtc.appspot.com/#1
https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment
https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols


https://www.tutorialspoint.com/webrtc/
https://www.npmjs.com/package/local-web-server
http://www.chovy.com/web-development/self-signed-certs-with-secure-websockets-in-node-js/



