const WebSocket = require("ws");
const fs = require("fs");
let socket = new WebSocket("wss://ourworldofpixels.com");
let settings = JSON.parse(fs.readFileSync("settings.json", "utf-8"));
let captchapass = settings.captchapass;
let world = settings.world;
let pass = settings.pass;
socket.binaryType = "arraybuffer";
socket.onopen = () => { console.log("Connected"); };
socket.onclose = () => { console.log("Disconnected"); };
socket.onerror = e => { console.log("Error: " + e.data) };
socket.onmessage = e => {
    if(typeof e.data == "string") console.log(e.data);
    if(typeof e.data == "object") {
        let data = new DataView(e.data);
        const opcode = data.getUint8(0);
        switch(opcode) {
            case 1:
            console.log("Got id: " + data.getUint8(1));
            break;
            case 4:
            console.log("Got rank: " + data.getUint8(1));
            break;
            case 5:
                if(data.getUint8(1) == 0) {
                    console.log("CaptchA Waiting (0)");
                    if(captchapass.replace(" ", "") != "") socket.send("25565LETMEINPLZ" + captchapass);
                };
                if(data.getUint8(1) == 1) console.log("CaptchA Verifying (1)");
                if(data.getUint8(1) == 2) console.log("CaptchA Verified (2)");
                if(data.getUint8(1) == 3) {
                    console.log("CaptchA OK (3)");
                    if(world.replace(" ", "") == "") world = "main";
                    world = world.toLowerCase();
                    let ints = [];
                    for(let i = 0; i < world.length; i++) ints.push(world.charCodeAt(i));
                    let dv = new DataView(new ArrayBuffer(ints.length + 2));
                    for(let a = ints.length; a--;) dv.setUint8(a, ints[a]);
                    dv.setUint16(ints.length, 25565, true);
                    socket.send(dv.buffer);
                    if(pass.replace(" ", "") != "") socket.send(pass + "\n");
                };
                if(data.getUint8(1) == 4) console.log("CaptchA Invalid (4)");
            break;
        };
    };
};
