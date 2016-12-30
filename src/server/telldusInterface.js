var optional = require('optional');
var telldus = optional('telldus');
var lights = require('../../lights.json');

var currTimestamp = [];
var sensorData = [];

function init() {
    var list;
    if (telldus) {
        function AddSensorData(data) {
            console.log(data.timestamp - currTimestamp[data.deviceId]);
            return data.type == 1 && (!currTimestamp[data.deviceId] || data.timestamp - currTimestamp[data.deviceId] >= 5 * 60);
        }

        telldus.getDevices(function (err, devices) {
            if (err) {
                console.log('Error: ' + err);
            } else {
                // A list of all configured devices is returned
                list = devices;

                for (var i = 0; i < list.length; i++) {
                    list[i].schedules = [];
                    list[i].name = lights.filter(function (l) { return l.id == list[i].id }).map(function (o) { return o.name })[0];
                }
            }
        });

        telldus.addSensorEventListener(function (deviceId, protocol, model, type, value, timestamp) {
            console.log('New sensor event received: ', deviceId, protocol, model, type, value, timestamp);

            var data = {deviceId: deviceId, protocol: protocol, model: model, type: type, value: value, timestamp: timestamp};

            if (AddSensorData(data)) {

                currTimestamp[data.deviceId] = data.timestamp;

                if (sensorData.length > 1000)
                    sensorData.shift();

                sensorData.push(data);
                //io.emit('sensor', data);
            }

        });

        return list;
    }
}

module.exports = {
    init: init,
};
