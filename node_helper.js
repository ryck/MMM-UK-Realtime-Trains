/* TfL Bus Atrival Predictions */

/* Magic Mirror
 * Module: MMM-UK-Realtime-Trains
 * By Ricardo Gonzalez
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var request = require("request");

module.exports = NodeHelper.create({
	start: function () {
		console.log("MMM-UK-Realtime-Trains helper started...");
	},
	/* getTimetable()
	 * Requests new data from RTT API.
	 * Sends data back via socket on succesfull response.
	 */
	getTimetable: function (url, config) {
		var self = this;
		var retry = true;

		request(
			{
				url: url,
				method: "GET",
				auth: {
					user: config.username,
					pass: config.password,
					sendImmediately: false
				}
			},
			function (error, response, body) {
				// Lets convert the body into JSON
				var result = JSON.parse(body);
				if (!error && response.statusCode === 200) {
					self.sendSocketNotification("RTT_DATA", { data: result, url: url });
				} else {
					self.sendSocketNotification("RTT_DATA", { data: null, url: url });
				}
			}
		);
	},
	//Subclass socketNotificationReceived received.
	socketNotificationReceived: function (notification, payload) {
		if (notification === "GET_RTT_DATA") {
			this.getTimetable(payload.url, payload.config);
		}
	}
});
