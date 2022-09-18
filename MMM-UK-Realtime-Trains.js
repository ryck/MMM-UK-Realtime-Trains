/* Magic Mirror Module: MMM-UK-Realtime-Trains
 * Version: 1.0.0
 *
 * By Ricardo Gonzalez https://github.com/ryck/MMM-UK-Realtime-Trains
 * MIT Licensed.
 */
Module.register("MMM-UK-Realtime-Trains", {
	defaults: {
		username: "",
		password: "",
		originStationCode: "", // StopPoint id
		destinationStationCode: "", // StopPoint id
		updateInterval: 5 * 60 * 1 * 1000, // Every 5 minutes
		animationSpeed: 1000,
		fade: true,
		fadePoint: 0.25, // Start on 1/4th of the list.
		limit: 10,
		initialLoadDelay: 0, // start delay seconds.
		debug: false
	},
	start: function () {
		Log.log("Starting module: " + this.name);
		if (this.data.classes === "MMM-UK-Realtime-Trains") {
			this.data.classes = "bright medium";
		}
		// Override moment relative time strings.
		moment.updateLocale("en", {
			relativeTime: {
				s: "Due",
				m: "1 min",
				mm: "%d mins",
				h: "1 hour",
				hh: "%d hours"
			}
		});

		// Set up the local values, here we construct the request url to use
		this.apiBase = `https://api.rtt.io/api/v1/json/search/${this.config.originStationCode}/to/${this.config.destinationStationCode}`;
		this.loaded = false;
		this.trains = {};
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);
		this.updateTimer = null;
		this.url = encodeURI(this.apiBase);
		if (this.config.debug) {
			Log.info(this.url);
			Log.info(this.config);
		}
		this.updateTrainsInfo(this);
	},
	// updateTrainsInfo
	updateTrainsInfo: function (self) {
		self.sendSocketNotification("GET_RTT_DATA", { url: self.url, config: { username: this.config.username, password: this.config.password } });
	},

	getStyles: function () {
		return ["MMM-UK-Realtime-Trains.css"];
	},
	// Define required scripts.
	getScripts: function () {
		return ["moment.js"];
	},
	//Define header for module.
	getHeader: function () {
		return this.config.header;
	},

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");

		if (this.config.username === "") {
			wrapper.innerHTML = "Please set the RTT API username!";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.config.password === "") {
			wrapper.innerHTML = "Please set the RTT API password!";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.config.originStationCode === "") {
			wrapper.innerHTML = "Please set the origin station code!";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.config.destinationStationCode === "") {
			wrapper.innerHTML = "Please set the destination station code!";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = "Loading train arrival predictions...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.trains.data !== null) {
			this.config.header = `${this.trains.data[0].originStation} ➜ ${this.trains.data[0].destinationStation}`;
		}

		//Dump train data
		if (this.config.debug) {
			Log.info(this.trains);
		}

		// *** Start Building Table
		var trainTable = document.createElement("table");
		trainTable.className = "small";

		//If we have departure info
		if (this.trains.data !== null) {
			var headerRow = document.createElement("tr");

			let platformHeaderCell = document.createElement("th");
			platformHeaderCell.className = "header platform";
			platformHeaderCell.innerHTML = "Plat #";
			headerRow.appendChild(platformHeaderCell);

			let departureHeaderCell = document.createElement("th");
			departureHeaderCell.className = "header departure";
			departureHeaderCell.innerHTML = "Departure";
			headerRow.appendChild(departureHeaderCell);

			let arrivalHeaderCell = document.createElement("th");
			arrivalHeaderCell.className = "header arrival";
			arrivalHeaderCell.innerHTML = "Arrival";
			headerRow.appendChild(arrivalHeaderCell);

			let timeHeaderCell = document.createElement("th");
			timeHeaderCell.className = "header due";
			timeHeaderCell.innerHTML = "TTA";
			headerRow.appendChild(timeHeaderCell);

			trainTable.appendChild(headerRow);

			for (var t in this.trains.data) {
				var train = this.trains.data[t];

				var row = document.createElement("tr");
				trainTable.appendChild(row);

				// Platform
				var platformCell = document.createElement("td");
				platformCell.className = "platform";
				platformCell.innerHTML = `${train.platform}`;
				row.appendChild(platformCell);

				// Expected departure
				var expectedDepartureCell = document.createElement("td");
				expectedDepartureCell.className = "expected-departure";
				expectedDepartureCell.innerHTML = `${moment(train.expectedDeparture, "hmm").format("HH:mm")}`;
				row.appendChild(expectedDepartureCell);

				// Expected Arrival
				var expectedArrivalCell = document.createElement("td");
				expectedArrivalCell.className = "expected-arrival";
				expectedArrivalCell.innerHTML = `${moment(train.expectedArrival, "hmm").format("HH:mm")}`;
				row.appendChild(expectedArrivalCell);

				// Time Tabled Departure
				// var time = moment(train.expectedDeparture, "hmm").fromNow(true);
				var duration = moment.duration(moment(train.expectedDeparture, "hmm").diff(moment())).asMinutes();
				Log.info(duration);
				var timeTabledCell = document.createElement("td");
				if (duration <= 1) {
					timeTabledCell.innerHTML = `Due`;
					timeTabledCell.className = "due";
				} else {
					timeTabledCell.innerHTML = `${Math.round(duration)} mins`;
				}
				timeTabledCell.className += " time";
				row.appendChild(timeTabledCell);

				if (train.delta !== null && train.delta < 0) {
					timeTabledCell.className += " early";
				} else if (train.delta !== null && train.delta > 0) {
					timeTabledCell.className += " late";
				}

				if (this.config.fade && this.config.fadePoint < 1) {
					if (this.config.fadePoint < 0) {
						this.config.fadePoint = 0;
					}
					var startingPoint = this.trains.data.length * this.config.fadePoint;
					var steps = this.trains.data.length - startingPoint;
					if (t >= startingPoint) {
						var currentStep = t - startingPoint;
						row.style.opacity = 1 - (1 / steps) * currentStep;
					}
				}
			}
		} else {
			var row1 = document.createElement("tr");
			trainTable.appendChild(row1);

			var messageCell = document.createElement("td");
			messageCell.innerHTML = " " + this.trains.message + " ";
			messageCell.className = "bright";
			row1.appendChild(messageCell);

			var row2 = document.createElement("tr");
			trainTable.appendChild(row2);

			var timeCell = document.createElement("td");
			timeCell.innerHTML = " " + this.trains.timestamp + " ";
			timeCell.className = "bright";
			row2.appendChild(timeCell);
		}

		wrapper.appendChild(trainTable);
		// *** End building results table

		return wrapper;
	},
	/* processTrains(data)
	 * Uses the received data to set the various values into a new array.
	 */
	processTrains: function (data) {
		if (this.config.debug) {
			Log.info(data);
		}
		//Check we have data back from API
		if (typeof data !== "undefined" && data !== null && data.length !== 0 && data.services !== null) {
			//Define object to hold train data
			this.trains = {};
			//Define array of departure info
			this.trains.data = [];
			//Define timestamp of current data
			this.trains.timestamp = moment().format("LLL");
			//Define message holder
			this.trains.message = null;

			//Figure out how long the results are
			var counter = data.services.length;

			//See if there are more results than requested and limit if necessary
			if (counter > this.config.limit) {
				counter = this.config.limit;
			}

			for (var i = 0; i < counter; i++) {
				var service = data.services[i];

				this.trains.data.push({
					originStation: service.locationDetail.description,
					originStationCode: service.locationDetail.crs,
					expectedDeparture: service.locationDetail.realtimeDeparture,
					destinationStation: service.locationDetail.destination[0].description,
					destinationStationCode: data.filter.destination.crs,
					expectedArrival: service.locationDetail.destination[0].publicTime,
					platform: service.locationDetail.platform,
					delta: service.locationDetail.realtimeGbttArrivalLateness || null
				});
			}

			this.trains.data.sort(function (a, b) {
				return a.expectedDeparture - b.expectedDeparture;
			});
		} else {
			//No data returned - set error message
			this.trains.message = "No trains available";
			this.trains.data = null;
			this.trains.timestamp = moment().format("LLL");
			if (this.config.debug) {
				Log.error("No data returned");
				Log.error(this.trains);
			}
		}

		this.loaded = true;

		this.updateDom(this.config.animationSpeed);
	},
	/* scheduleUpdate()
	 * Schedule next update.
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function (delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(function () {
			self.updateTrainsInfo(self);
		}, nextLoad);
	},
	// Process data returned
	socketNotificationReceived: function (notification, payload) {
		if (notification === "RTT_DATA" && payload.url === this.url) {
			this.processTrains(payload.data);
			this.scheduleUpdate(this.config.updateInterval);
		}
	}
});
