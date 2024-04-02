/* TfL Bus Atrival Predictions */

/* Magic Mirror
 * Module: MMM-UK-Realtime-Trains
 * By Ricardo Gonzalez
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var axios = require("axios");

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-UK-Realtime-Trains helper started...");
  },
  /* getTimetable()
   * Requests new data from RTT API.
   * Sends data back via socket on succesfull response.
   */
  getTimetable: async function (url, config) {
    var self = this;

    const { data, status, statusText } = await axios.get(url, {
      auth: {
        username: config.username,
        password: config.password,
      },
    });
    if (status === 200) {
      if (statusText === "error") {
        self.sendSocketNotification("RTT_DATA", { data: null, url });
      } else {
        self.sendSocketNotification("RTT_DATA", {
          data,
          url,
        });
      }
    } else {
      self.sendSocketNotification("RTT_DATA", { data: null, url });
    }
  },

  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function (notification, payload) {
    if (notification === "GET_RTT_DATA") {
      this.getTimetable(payload.url, payload.config);
    }
  },
});
