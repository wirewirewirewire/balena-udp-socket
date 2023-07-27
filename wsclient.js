const util = require("util");
var path = require("path");
var fs = require("fs");
const { WebSocket } = require("ws");

//const UNIPI_IP = "192.168.225.143";
var LISTEN_IP = "192.168.225.142";

if (process.argv.indexOf("-l") > -1) {
  let index = process.argv.indexOf("-l");
  LISTEN_IP = process.argv[index + 1];
  console.log("[START] -l set IP to: " + LISTEN_IP);
}

const ws = new WebSocket("ws://" + LISTEN_IP + ":8007");

let debug = false;
let wsOpen = false;

ws.on("message", function message(data) {
  console.log("Message: " + data);
  //ws.send(JSON.stringify({ command: "lcstart" }));
});

ws.on("open", function open() {
  //ws.send(JSON.stringify({ command: "lcoff" }));
  wsOpen = true;
  //process.exit(0);
});

function wsInitAwait() {
  return new Promise(async (resolve, reject) => {
    const wsInitTimer = setInterval(async () => {
      if (wsOpen) {
        console.log("[SYSTEM] socket is running");
        clearTimeout(wsInitTimer);
        resolve(true);
      }
    }, 50);
  });
}

var init = async () => {
  if (process.argv.indexOf("-d") > -1) {
    console.log("[START] -d startup with debug");
    debug = true;
  }

  if (debug) {
    process.argv.forEach(function (val, index, array) {
      console.log(index + ": " + val);
    });
  }

  console.log("[START] ...connecting to " + LISTEN_IP + ":8007");

  await wsInitAwait();

  if (process.argv.indexOf("-t") > -1) {
    let index = process.argv.indexOf("-t");
    let playerId = process.argv[index + 1];
    let playerFile = process.argv[index + 2];
    let playerTime = process.argv[index + 3];
    let timeStamp = Date.now();

    console.log("[START] -t send player sync: ID: " + playerId + " FILE: " + playerFile + " TIME: " + playerTime);
    ws.send(JSON.stringify({ command: "audiosync", id: playerId, file: playerFile, time: playerTime, ts: timeStamp }));
  }
};

init();

process.on("SIGINT", (_) => {
  console.log("SIGINT");
  process.exit(0);
});
