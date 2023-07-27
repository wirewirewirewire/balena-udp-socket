const dgram = require("dgram");
const socket = dgram.createSocket("udp4");

socket.bind("6666", "192.168.225.142");

socket.on("listening", function () {
  const address = socket.address();
  console.log("UDP socket listening on " + address.address + ":" + address.port);
});

socket.on("message", function (message, remote) {
  console.log("CLIENT RECEIVED: ", remote.address + ":" + remote.port + " - " + message);
  if (message != "false") {
    console.log("Update Player: ");
  }
});

//player.openFile("./sync.mp3");
