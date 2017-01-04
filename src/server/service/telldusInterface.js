var optional = require('optional');
var telldus = optional('telldus');
var lights = require('../../../lights.json');

var currTimestamp = [];
var sensorData = [];

// Fake data in case telldus lib has not been properly installed
if (!telldus) {
	telldus = {
		getDevices: (callback) => { callback(null, [{ id: 1 }]) },
		turnOn: (id, callback) => { if (false) callback(null) },
		turnOff: (id, callback) => { if (false) callback(null) },
		//addSensorEventListener: (callback) => { callback(null)}
	};
}

// function AddSensorData(data) {
//     console.log(data.timestamp - currTimestamp[data.deviceId]);
//     return data.type == 1 && (!currTimestamp[data.deviceId] || data.timestamp - currTimestamp[data.deviceId] >= 5 * 60);
// }

function getDevices(callback) {
	telldus.getDevices(function (err, devices) {
		if (err) {
			console.log('Error: ' + err);
		} else {
			// A list of all configured devices is returned
			var result = devices;

			for (var i = 0; i < result.length; i++) {
				result[i].schedules = [];
				result[i].name = lights.filter(function (l) { return l.id == result[i].id }).map(function (o) { return o.name })[0];
			}

			callback(result);
		}
	});
}

// telldus.addSensorEventListener(function (deviceId, protocol, model, type, value, timestamp) {
//     console.log('New sensor event received: ', deviceId, protocol, model, type, value, timestamp);

//     var data = {deviceId: deviceId, protocol: protocol, model: model, type: type, value: value, timestamp: timestamp};

//     if (AddSensorData(data)) {

//         currTimestamp[data.deviceId] = data.timestamp;

//         if (sensorData.length > 1000)
//             sensorData.shift();

//         sensorData.push(data);
//         //io.emit('sensor', data);
//     }

// });

module.exports = {
	getDevices: getDevices,
	turnOn: telldus.turnOn,
	turnOff: telldus.turnOff
}