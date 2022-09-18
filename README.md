# MMM-UK-Realtime-Trains

This a module for the [MagicMirror](https://github.com/MichMich/MagicMirror).

This module displays LIVE train departures from the specified station(s) using [Realtime Trains API](https://api.rtt.io/)

## Installation

1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/ryck/MMM-UK-Realtime-Trains`. A new folder `MMM-UK-Realtime-Trainss` will appear, navigate into it.
2. Execute `npm install` to install the node dependencies.

## Config

The entry in `config.js` can include the following options:

| Option                   | Description                                                                                                                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `user`                   | **Required (SEE NOTES)** This is the username assigned to you on the [Realtime Trains API Portal](https://api.rtt.io/)<br>**Type:** `string`<br>                                                                                                 |
| `password`               | **Required (SEE NOTES)** This is the password assigned to you on the assigned to you on the [Realtime Trains API Portal](https://api.rtt.io/)<br><br>**Type:** `string`<br>                                                                      |
| `originStationCode`      | **Required (SEE NOTES)** CRS or TIPLOC for the origin / departure station.<br>**Type:** `string`                                                                                                                                                 |
| `destinationStationCode` | **Required (SEE NOTES)** CRS or TIPLOC for the destination / arrival station.<br>**Type:** `string`                                                                                                                                              |
| `limit`                  | Maximum number of trains displayed.<br>**Type:** `integer`<br>**Default value:** `10`                                                                                                                                                            |
| `updateInterval `        | How often the data is updated. (Milliseconds)<br>**Type:** `integer`<br>**Default value:** `5 * 60 * 1 * 1000` (Every 5 minutes)                                                                                                                 |
| `initialLoadDelay`       | The initial delay before loading. If you have multiple modules that use the same API key, you might want to delay one of the requests. (Milliseconds)<br>**Type:** `integer`<br>**Possible values:** `1000` - `5000` <br> **Default value:** `0` |
| `animationSpeed`         | Speed of the update animation. (Milliseconds)<br>**Type:** `integer`<br>**Possible values:**`0` - `5000` <br> **Default value:** `1000` (1 second)                                                                                               |
| `debug`                  | Show debug information.<br>**Type:** `boolean`<br>**Possible values:** `true` or `false` <br> **Default value:** `false`                                                                                                                         |

Here is an example of an entry in `config.js`

```
{
			module: "MMM-UK-Realtime-Trains",
			position: "top_right",
			config: {
				username: "YOUR_RTT_USERNAME",
				password: "YOUR_RTT_PASSWORD",
				originStationCode: "VIC",
				destinationStationCode: "SRC",			}
		}
```

## Dependencies

- [request](https://www.npmjs.com/package/request) (installed via `npm install`)

## Notes

**IMPORTANT** In this first version, while shown as required, the `app_id` and the `api_key` are unused until I get a response from TfL on how to apply the data limits correctly. As a result this uses an anonymous request and it is possible this may break after a period of requests. Again I am awaiting to hear what the request and data limits are so that this can be used correctly.
I hope you like this module, this was built at the request of `djbenny07`on the MagicMirror2 forum. Feel free to submit pull requests or post issues and I'll do my best to respond.

## Thanks To...

- [Michael Teeuw](https://github.com/MichMich) for the [MagicMirror2](https://github.com/MichMich/MagicMirror/tree/develop) framework that made this module possible.
- [Realtime Trains](https://api.rtt.io/) for the guides and information they publish on their API.
