## Socket

### Socket Send Timestamp

send a message to the websocket server ip with the following content:
`{ command: "audiosync", id: <ID>, file: <FILE>, time: <TIME>, ts: <TIMESTAMP> }`
`<ID>` ID of the station/player
`<FILE>` Filename / slug that is playing
`<TIME>` - current time in playback in ms
`<TIMESTAMP>` - Date.now(); as current Unix timestamp from sender in ms

### Socket Test

Use input params on start with `node wsclient.js`
`-h` help
`-d` debug enabled (more logs)
`-t <ID> <FILE> <TIME> <TS>` send a time frame,
`<ID>` ID of the station/player
`<FILE>` Filename / slug that is playing
`<TIME>` - current time in playback in ms
`<TIMESTAMP>` - Date.now(); as current Unix timestamp from sender in ms

### Example

`node wsclient.js -t <ID> <FILE> <TIME> <TIMESTAMP>`
`node wsclient.js -t station-sync-001 sync-001-weiss 23000 1690478058000`

## UDP Broadcast

The UDP is a broadcast on PORT 6666 with the format `"ID%FILE"%TIME%TIMESTAMP"` . It gets triggered and filled with
information from the SOCKET Data.
`<ID>` ID of the station/player
`<FILE>` Filename that is playing
`<TIME>` current time in playback in ms
`<TIMESTAMP>` unix timestamp in ms from the sender

Data Example: `"station-sync-001%sync-001-weiss%42558%1690464636403"`

## Socket Test

Client to receive UDP broadcast from the Network.
start `node udp.js` . It listens on Port **6666** for Packages and prints them out in Terminal
Use Terminal to capture the UDP Broadcasts: `sudo tcpdump -n -X udp port 6666 and src 192.168.45.XXX`

## Data Schema

The Data that will be encoded in the UDP sring will be brough the following schema:
**Example:**

```json
{
  "station": "station-sync-001", // name of the media station
  "slug": "sync-001-weiss" //Specific Slug, can be defined individually per video
}
```

The UDP String will be encoded as follows:
`<station>%<slug>%<TIME>%<TIMESTAMP>"`

**Example:**
`"station-sync-001%sync-001-weiss%1000%1000"`
