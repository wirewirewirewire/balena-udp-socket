wsclient test tool usage

Use input params on start
 -d = debug enabled (more logs)
 -t = send a time frame, it needs the data (ID - ID of the player, FILE - file that is running, TIME - current time in playback in ms, TIMESTAMP - Date.now(); as current Unix timestamp on sender)
	-> Example "node wsclient.js -t ID FILE TIME TIMESTAMP"
	->"node wsclient.js -t 2 video1.mp4 23000 1690478058000"

The UDP is a broadcast on port 6666 with the format "ID%FILE"%TIME%TIMESTAMP"
	-> Example: "2%sync.mp4%42558%1690464636403" TIME: playerPosition in ms, TIMESTAMP, Unix timestamp in ms



