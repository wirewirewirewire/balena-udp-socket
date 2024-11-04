const util = require("util");
var path = require("path");
var fs = require("fs");

const { v4 } = require("uuid");
const http = require("http");
const { WebSocketServer } = require("ws");
const server = http.createServer();
const { exec, spawn } = require("child_process");

const dgram = require("dgram");
const socket = dgram.createSocket("udp4");
const wsServer = new WebSocketServer({ server });

const WS_PORT = 8007; //Socket
const UDP_BROADCAST_PORT = 6666; //UDP

var wsConnection = undefined;
const clients = {};

var DEBUG = process.env.DEBUG != "true" ? false : true;

function IsJsonString(str) {
  return new Promise(async (resolve, reject) => {
    var result;
    try {
      result = JSON.parse(str);
    } catch (e) {
      resolve(false);
      return false;
    }
    resolve(result);
    return result;
  });
}

async function sendPostion(ID, FILE, POSTITION, timeDateNow) {
  var positionState = POSTITION;
  //Example : "2%sync.mp4%42558%1690464636403" position in ms, timedata in ts(ms) = Date.now();
  var sendstring = ID + "%" + FILE + "%" + positionState + "%" + timeDateNow;
  if (DEBUG) console.log('[UDP] Send: "' + sendstring + '"');
  socket.setBroadcast(true);
  socket.send(sendstring, 0, sendstring.length, UDP_BROADCAST_PORT, "255.255.255.255");
}

function getBalenaRelease() {
  return new Promise((resolve, reject) => {
    exec(
      'curl -X GET --header "Content-Type:application/json" "$BALENA_SUPERVISOR_ADDRESS/v1/device?apikey=$BALENA_SUPERVISOR_API_KEY"',
      (error, stdout, stderr) => {
        if (error) {
          //console.log(`error: ${error.message}`);
          resolve(false);
          return;
        }
        if (stderr) {
          //console.log(`stderr: ${stderr}`);
          //resolve(stderr);
          //return;
        }
        resolve(IsJsonString(stdout));
      }
    );
  });
}

function bindSocket() {
  return new Promise((resolve, reject) => {
    socket.bind(UDP_BROADCAST_PORT, function () {
      resolve(true);
    });
  });
}

socket.on("listening", function () {
  const address = socket.address();
  console.log("[UDP] socket broadcast on " + UDP_BROADCAST_PORT);
});

server.listen(WS_PORT, () => {
  console.log(`[WS] WebSocket server is running on port ${WS_PORT}`);
});

wsServer.on("connection", async function (connection) {
  wsConnection = connection;
  connection.on("message", function message(data) {
    if (DEBUG) console.log("[WS] received: %s", data);
    wsMessageHandler(data);
  });

  connection.on("disconnect", function () {
    console.log("[WS] user disconnected");
  });

  // Response on User Connected
  const userId = v4();
  console.log(`[WS] Recieved a new connection.`);
  var balenaData = await getBalenaRelease();
  socketSendMessage({ message: "connected", data: { userId, balenaData } });
  // Store the new connection and handle messages
  clients[userId] = connection;
  console.log(`[WS] ${userId} connected.`);
});

var wsMessageHandler = async (messageData) => {
  var jsonData = await IsJsonString(messageData);

  if (jsonData.hasOwnProperty("command")) {
    if (DEBUG) console.log("[SYSTEM] run command: " + jsonData.command);
    switch (jsonData.command) {
      case "audiosync":
        playerTime = undefined;
        playerTimestamp = undefined;
        playerId = undefined;
        playerFile = undefined;
        if (jsonData.hasOwnProperty("time")) {
          playerTime = jsonData.time;
        }
        if (jsonData.hasOwnProperty("ts")) {
          playerTimestamp = jsonData.ts;
        }
        if (jsonData.hasOwnProperty("id")) {
          playerId = jsonData.id;
        }
        if (jsonData.hasOwnProperty("file")) {
          playerFile = jsonData.file;
        }
        if (playerTime != undefined && playerTimestamp != undefined && playerId != undefined && playerFile != undefined) {
          sendPostion(playerId, playerFile, playerTime, playerTimestamp);
        } else {
          console.log("[WS] ERROR: missing parameter for player sync");
        }
        break;
      default:
    }
  }
};

var socketSendMessage = async (messageData) => {
  return new Promise(async (resolve, reject) => {
    if (wsConnection === undefined) {
      console.log("[WS] ERROR send message failed, no connection");
      resolve(false);
      return;
    }
    wsConnection.send(JSON.stringify(messageData));
    resolve(true);
  });
};

var init = async () => {
  console.log("[SYSTEM] init started");
  await bindSocket();
  console.log("[SYSTEM] init done");
};
init();

process.on("SIGINT", async () => {
  console.log("Bye bye!");
  process.exit();
});
