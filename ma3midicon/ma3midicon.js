//MA3 MIDICON control code beta 0.3 by ArtGateOne
var easymidi = require('easymidi');
var osc = require("osc");
var W3CWebSocket = require('websocket')
    .w3cwebsocket;
var client = new W3CWebSocket('ws://localhost:8080/'); //U can change localhost(127.0.0.1) to Your console IP address

//config
midi_in = 'MIDIcon';     //set correct midi in device name
localip = "127.0.0.1";
localport = 8020;
remoteip = "127.0.0.1";
remoteport = 8000;


//var faderValue = [0, 0, 0, 0, 0.2, 0.6, 1, 1.4, 1.8, 2.2, 2.6, 3, 3.4, 3.8, 4.2, 4.6, 5, 5.3, 5.7, 6.1, 6.5, 6.9, 7.3, 7.7, 8.1, 8.5, 8.9, 9.3, 9.7, 10, 10.4, 10.8, 11.2, 11.6, 12, 12.4, 12.8, 13.2, 13.6, 14, 14.15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 100, 100];
var faderValue = [0, 0, 0.8, 1.6, 2.4, 3.2, 4, 4.8, 5.6, 6.4, 7.2, 8, 8.8, 9.6, 10.4, 11.2, 12, 12.8, 13.6, 14.4, 15.2, 16, 16.8, 17.6, 18.4, 19.2, 20, 20.8, 21.6, 22.4, 23.2, 24, 24.8, 25.6, 26.4, 27.2, 28, 28.8, 29.6, 30.4, 31.2, 32, 32.8, 33.6, 34.4, 35.2, 36, 36.8, 37.6, 38.4, 39.2, 40, 40.8, 41.6, 42.4, 43.2, 44, 44.8, 45.6, 46.4, 47.2, 48, 48.8, 49.6, 50.4, 51.2, 52, 52.8, 53.6, 54.4, 55.2, 56, 56.8, 57.6, 58.4, 59.2, 60, 60.8, 61.6, 62.4, 63.2, 64, 64.8, 65.6, 66.4, 67.2, 68, 68.8, 69.6, 70.4, 71.2, 72, 72.8, 73.6, 74.4, 75.2, 76, 76.8, 77.6, 78.4, 79.2, 80, 80.8, 81.6, 82.4, 83.2, 84, 84.8, 85.6, 86.4, 87.2, 88, 88.8, 89.6, 90.4, 91.2, 92, 92.8, 93.6, 94.4, 95.2, 96, 96.8, 97.6, 98.4, 99.2, 100, 100];
var str = "string";
var grandmaster = 100;
var BO = 0; //Black Out 0 -off
var keypressed = 0;

// Create an osc.js UDP Port listening on port 8000.
var udpPort = new osc.UDPPort({
    localAddress: localip,
    localPort: localport,
    metadata: true
});

// Open the socket.
udpPort.open();

console.log('MIDI inputs:');
console.log(easymidi.getInputs());

console.log('MIDI outputs:');
console.log(easymidi.getOutputs());

var input = new easymidi.Input(midi_in);



input.on('cc', function (msg) {

    if (msg.controller <= 8) {//faders 1-8
        //create address string      
        str = "/Page" + (msg.channel + 1) + "/Fader" + (msg.controller + 200);

        //send OSC
        udpPort.send({
            address: str,
            args: [
                {
                    type: "i",
                    value: (faderValue[msg.value])
                }
            ]
        }, remoteip, remoteport);
    }
    else if (msg.controller == 9) {//GrandMaster

        grandmaster = faderValue[msg.value];

        if (BO == 0) {

            udpPort.send({
                address: "/cmd",
                args: [
                    {
                        type: "s",
                        value: "Master 2.1 At " + grandmaster
                    }
                ]
            }, remoteip, remoteport);
        } 
    }
});


input.on('noteon', function (msg) {
    if (msg.velocity == 127) {
        keypressed = 1;
    } else {
        keypressed = 0;
    }

    if (msg.note <= 6) {//Touch 1-6 (Xkeys 291-296)
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key" + (msg.note + 290),
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note > 6 && msg.note <= 12) {//Touch 7-12 (Xkeys 191-196)
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key" + (msg.note + 184),
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }


    else if (msg.note == 13) {//Encoder 1
        client.send('{"requestType":"nextFrame"}');
        client.send('{"requestType":"mouseEvent","posX":204,"posY":995,"eventType":"wheel","deltaX":1,"deltaY":1,"deltaZ":0,"deltaMode":0,"ctrlKey":false}');
    }

    else if (msg.note == 14) {//Encoder 1
        client.send('{"requestType":"nextFrame"}');
        client.send('{"requestType":"mouseEvent","posX":204,"posY":995,"eventType":"wheel","deltaX":1,"deltaY":-1,"deltaZ":0,"deltaMode":0,"ctrlKey":false}');
    }

    else if (msg.note == 16) {//Encoder 2
        client.send('{"requestType":"nextFrame"}');
        client.send('{"requestType":"mouseEvent","posX":577,"posY":995,"eventType":"wheel","deltaX":1,"deltaY":1,"deltaZ":0,"deltaMode":0,"ctrlKey":false}');
    }

    else if (msg.note == 17) {//Encoder 2
        client.send('{"requestType":"nextFrame"}');
        client.send('{"requestType":"mouseEvent","posX":577,"posY":995,"eventType":"wheel","deltaX":1,"deltaY":-1,"deltaZ":0,"deltaMode":0,"ctrlKey":false}');
    }

    else if (msg.note == 19) {//Encoder 3
        client.send('{"requestType":"nextFrame"}');
        client.send('{"requestType":"mouseEvent","posX":946,"posY":995,"eventType":"wheel","deltaX":1,"deltaY":1,"deltaZ":0,"deltaMode":0,"ctrlKey":false}');
    }

    else if (msg.note == 20) {//Encoder 3
        client.send('{"requestType":"nextFrame"}');
        client.send('{"requestType":"mouseEvent","posX":946,"posY":995,"eventType":"wheel","deltaX":1,"deltaY":-1,"deltaZ":0,"deltaMode":0,"ctrlKey":false}');
    }
    /*
    else if (msg.note == ??){
        client.send('{"requestType":"nextFrame"}');
        client.send('{"requestType":"mouseEvent","posX":1315,"posY":995,"eventType":"wheel","deltaX":1,"deltaY":1,"deltaZ":0,"deltaMode":0,"ctrlKey":false}');
    }
    else if (msg.note == ??){
        client.send('{"requestType":"nextFrame"}');
        client.send('{"requestType":"mouseEvent","posX":1315,"posY":995,"eventType":"wheel","deltaX":1,"deltaY":-1,"deltaZ":0,"deltaMode":0,"ctrlKey":false}');
    }*/
    else if (msg.note >= 22 && msg.note <= 27 && msg.velocity == 127) {//Select EncoderPage S buttons
        udpPort.send({
            address: "/cmd",
            args: [
                {
                    type: "s",
                    value: "Select EncoderPage " + (msg.note - 21)
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 28) {//BO
        if (msg.velocity == 127) {
            BO = 1;
            udpPort.send({
                address: "/cmd",
                args: [
                    {
                        type: "s",
                        value: "Master 2.1 At 0"
                    }
                ]
            }, remoteip, remoteport);
        } else {
            BO = 0;
            udpPort.send({
                address: "/cmd",
                args: [
                    {
                        type: "s",
                        value: "Master 2.1 At " + grandmaster
                    }
                ]
            }, remoteip, remoteport);
        }
    }

    else if (msg.note == 29) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key301",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 30) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key201",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 31) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key101",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 32) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key302",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 33) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key202",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 34) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key102",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 35) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key303",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 36) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key203",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 37) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key103",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 38) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key304",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 39) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key204",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 40) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key104",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 41) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key305",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 42) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key205",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 43) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key105",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 44) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key306",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 45) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key206",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 46) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key106",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 47) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key307",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 48) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key207",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 49) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key107",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 50) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key308",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 51) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key208",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note == 52) {
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key108",
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note >= 53 && msg.note <= 60) {//1-8 buttons (wing2 416-423)
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key" + (msg.note + 363),
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }


    else if (msg.note >= 61 && msg.note <= 68) {//9-16 buttons (wing2 316-323)
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key" + (msg.note + 255),
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note >= 69 && msg.note <= 76) {//17-24 buttons (wing2 216-223)
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key" + (msg.note + 147),
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }

    else if (msg.note >= 77 && msg.note <= 84) {//25-32 buttons (wing2 116-123)
        udpPort.send({
            address: "/Page" + (msg.channel + 1) + "/Key" + (msg.note + 39),
            args: [
                {
                    type: "i",
                    value: keypressed
                }
            ]
        }, remoteip, remoteport);
    }
});


console.log("Connecting to MA3PC ...");
//WEBSOCKET-------------------
client.onerror = function () {
    console.log('Connection Error');
};

client.onopen = function () {
    console.log('WebSocket Client Connected');

    function sendNumber() {
        if (client.readyState === client.OPEN) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            client.send(number.toString());
            setTimeout(sendNumber, 1000);
        }
    }
    //sendNumber();
};

client.onclose = function () {
    console.log('Client Closed');
    input.close();
    //output.close();
    process.exit();
};

client.onmessage = function (e) {

    if (typeof e.data == 'string') {
        //console.log("Received: '" + e.data + "'");
        //console.log(e.data);


        obj = JSON.parse(e.data);
        //console.log(obj);

        if (obj.status == "server ready") {
            console.log("SERVER READY");
            client.send('{"requestType":"remoteState"}')
        }

        if (obj.type == "remoteState") {
            console.log("Remote State");
            client.send('{"requestType":"resizeVideo","width":2048,"height":1056}');
            client.send('{"requestType":"requestVideo"}');
        }

        if (obj.MA == "00") {
            console.log(obj);
            client.send('{"requestType":"nextFrame"}');
        }

    }
}