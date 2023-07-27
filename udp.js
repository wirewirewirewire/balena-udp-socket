const dgram = require("dgram");
const socket = dgram.createSocket("udp4");

var PORT = "6666";
var LISTEN_IP = "192.168.225.222";

function initSocket(str) {
  if (process.argv.indexOf("-p") > -1) {
    let index = process.argv.indexOf("-p");
    PORT = process.argv[index + 1];
    console.log("[START] -p set port to: " + PORT);
  }

  if (process.argv.indexOf("-l") > -1) {
    let index = process.argv.indexOf("-l");
    LISTEN_IP = process.argv[index + 1];
    console.log("[START] -l set IP to: " + LISTEN_IP);
  }

  socket.bind(PORT, LISTEN_IP);
}

initSocket();

socket.on("listening", function () {
  const address = socket.address();
  console.log("UDP socket listening on " + address.address + ":" + address.port);
  console.log("You can Set IP with -l and Port with -p flags");
});

socket.on("message", function (message, remote) {
  console.log("CLIENT RECEIVED: ", remote.address + ":" + remote.port + " - " + message);
});

//player.openFile("./sync.mp3");
