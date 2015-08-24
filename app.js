var express = require('express');
var bodyParser = require('body-parser');
var sunCalc = require('suncalc');
var CronJob = require('cron').CronJob;
var telldus = require('telldus');


var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + "/client"));
app.use(bodyParser());

var list;
var schedules = [];
var allSchedules = [];
var sensorData = [] ;

//hue.nupnpSearch().then(function(err,result){console.log(err); console.log(result);}).done();
//


io.on('connection', function(socket){
	console.log("a user connected");
});

function getCronTime(dateString)
{	
	var date = new Date(dateString);
	var hour = date.getHours();
	var minute = date.getMinutes();
	return "00 " + minute + " " + hour + " * * *";
}

function getTimePortion(date){
	var d = new Date(date);
	return d.getHours() + ":" + d.getMinutes();
}


telldus.getDevices(function(err,devices) {
		if ( err ) {
		console.log('Error: ' + err);
		} else {
		// A list of all configured devices is returned
		list = devices;

		for(var i = 0; i < list.length; i++)
		list[i].schedules = [];
		}
		});

var currTimestamp = [];

function AddSensorData(data){
	console.log(data.timestamp - currTimestamp[data.deviceId]);
	return data.type == 1 && (!currTimestamp[data.deviceId] || data.timestamp - currTimestamp[data.deviceId] >= 5 * 60) ;
}

telldus.addSensorEventListener(function(deviceId,protocol,model,type,value,timestamp) {
	console.log('New sensor event received: ',deviceId,protocol,model,type,value,timestamp);

	var data = {deviceId: deviceId, protocol: protocol, model: model, type: type, value: value, timestamp: timestamp};

	if(AddSensorData(data)) {

		currTimestamp[data.deviceId] = data.timestamp;

		if(sensorData.length > 1000)
			sensorData.shift();
	
		sensorData.push(data);
		io.emit('sensor',data);
	}	

});

app.get('/', function(req, res){
		res.sendFile(__dirname + '/client/index.html');
		});

app.post('/turnOn', function(req, res){
		telldus.turnOn(req.body.id,function(err){ console.log("error"); });
		res.send(list);
		});

app.post('/turnOff', function(req, res){
		telldus.turnOff(req.body.id, function(err){ console.log("error"); });
		});

function getCurrentDevice(id) {

	var result;	

	for(i = 0; i < list.length; i++)
		if(list[i].id === id)
			result = list[i];

	if(!result.schedules)
		result.schedules = [];

	return result;
}

function getScheduleFromRequest(id,data) {
return {"id": id, "turnon": new Date(data.turnOn), "turnoff": new Date(data.turnOff)};
}

app.post('/addSchedule', function(req,res) {

		var currentDevice = getCurrentDevice(req.body.id);

		var currentSchedule = getScheduleFromRequest(currentDevice.schedules.length,req.body);

		currentDevice.schedules.push(getScheduleFromRequest(currentDevice.schedules.length,req.body));

		schedules.push(currentSchedule);

		var scheduleOn = 
		new CronJob(getCronTime(req.body.turnOn),function(){console.log(this); telldus.turnOn(currentDevice.id, function(err){ console.log("error"); })});
		var scheduleOff = 
		new CronJob(getCronTime(req.body.turnOff), function(){telldus.turnOff(currentDevice.id, function(err) { console.log("error"); })});

		//allSchedules.push(scheduleOn);
		//allSchedules.push(scheduleOff);

		currentSchedule.scheduleOn = scheduleOn;
		currentSchedule.scheduleOff = scheduleOff;

		scheduleOn.start();
		scheduleOff.start();

		console.log(currentDevice.schedules);

		res.send(200);
});

app.post('/removeSchedule', function(req,res) {


		var currentDevice = null;

		for(i = 0; i < list.length; i++)
		if(list[i].id === req.body.deviceid)
		currentDevice = list[i];

		var indexRemove;

		for(var i = 0; i < currentDevice.schedules.length; i++)
		if(currentDevice.schedules[i].id == req.body.scheduleid)
		indexRemove = currentDevice.schedules.indexOf(currentDevice.schedules[i]);

		if(indexRemove > -1 ) {		

		var currentSchedule = null;

		for(i = 0; i < schedules.length; i++) {
		console.log("comparing: " + currentDevice.schedules[indexRemove].id + " - " + schedules[i].id);
		if(currentDevice.schedules[indexRemove].id  === schedules[i].id)
			currentSchedule = schedules[i];
		}

		console.log("currentSchedule is");
		console.log(currentSchedule);

		if(currentSchedule !== null) {	
			console.log(currentSchedule);
			var turnOn = currentSchedule.scheduleOn;
			turnOn.stop();
			var turnOff = currentSchedule.scheduleOff;
			turnOff.stop();
			//allSchedules.remove(turnOn);
			//allSchedules.remove(turnOff);
		}

		currentDevice.schedules.splice(indexRemove, 1);
		}

		res.send(200);
});
//
//app.post('/setSchedule', function(req, res){
//
//		console.log(req.body);
//
//		var currentDevice = null;
//
//		for(i = 0; i < list.length; i++)
//		if(list[i].id === req.body.id)
//		currentDevice = list[i];
//
//		if(currentDevice !== null)
//		{
//		currentDevice.turnOn = new Date(req.body.turnOn);
//		currentDevice.turnOff = new Date(req.body.turnOff);
//
//		var currentSchedule = null;
//
//		for(i = 0; i < schedules.length; i++)
//		if(currentDevice.id === schedules[i].id)
//		currentSchedule = schedules[i];
//
//		if(currentSchedule === null)
//		{
//			currentSchedule = {id: currentDevice.id };
//			schedules.push(currentSchedule);
//		}
//
//		if(currentSchedule.scheduleOn)
//		{
//			console.log("stopping old start schedule");
//			currentSchedule.scheduleOn.stop();
//		}
//
//		if(currentSchedule.scheduleOff)
//		{
//			console.log("stopping old stop schedule");
//			currentSchedule.scheduleOff.stop();
//		}
//
//		var scheduleOn = 
//			new CronJob(getCronTime(req.body.turnOn),function(){telldus.turnOn(currentDevice.id, function(err){ console.log("error"); })});
//		var scheduleOff = 
//			new CronJob(getCronTime(req.body.turnOff), function(){telldus.turnOff(currentDevice.id, function(err) { console.log("error"); })});
//
//		currentSchedule.scheduleOn = scheduleOn;
//		currentSchedule.scheduleOff = scheduleOff;
//
//		scheduleOn.start();
//		scheduleOff.start();
//
//		console.log(currentSchedule);
//		}
//
//});

app.get('/getDevices', function(req, res){
		res.send(list);
		});

app.get('/getSensorData', function(req, res){
	res.send(sensorData);
});

app.get('/getAllSchedules',function(req, res){
	
	//console.log(allSchedules.length);

	res.send(200);	
});

app.get('/getTime', function(req,res){
		var times = sunCalc.getTimes(new Date(),59.459611,17.808503);
		res.send({sun: times, time: new Date()});
		});

var server = http.listen(8080, function() {
		
		var host = server.address().address;
		var port = server.address().port;

		console.log('Example app listening at http://%s:%s', host, port);

		});
