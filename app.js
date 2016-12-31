var express = require('express');
var bodyParser = require('body-parser');
var sunCalc = require("suncalc");
var CronJob = require('cron').CronJob;

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + "/client"));
app.use(bodyParser());

var schedules = [];
var allSchedules = [];
var list;

var telldus = require('./src/server/telldusInterface');

telldus.getDevices(function(data){
	console.log("device data is", data);
	list = data;
});


io.on('connection', function(socket){
	console.log("a user connected again");
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

app.get('/', function(req, res){
	res.sendFile(__dirname + '/client/index.html');
});

app.get('/lights', function(req, res){
	res.send(lights);
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
	return {"id": id, "turnon": new Date(data.turnon), "turnoff": new Date(data.turnoff)};
}

app.post('/addSchedules', function(req,res){
	var weekday = require('./schedules/weekday_schedule.json');

	console.log("number of items is ",weekday.length);

	weekday.forEach(function(item){
		console.log(item);
		addSchedule(item);
	});

	res.send(200);
})

app.post('/addSchedule', function(req,res) {
	addSchedule(req.body);
	res.send(200);
});

function addSchedule(newSchedule) {
	var currentDevice = getCurrentDevice(newSchedule.id);

	if(newSchedule.schedules.length == 0)
		return;

	console.log("SCHEDULES TO BE ADDED: ", newSchedule);
	
	newSchedule.schedules.forEach(function(t){
		var currentSchedule = getScheduleFromRequest(currentDevice.schedules.length,t);

		currentDevice.schedules.push(currentSchedule);

		var scheduleOn = 
		new CronJob(getCronTime(currentSchedule.turnon),function(){console.log(this); telldus.turnOn(currentDevice.id, function(err){ console.log("error"); })});
	var scheduleOff = 
		new CronJob(getCronTime(currentSchedule.turnoff), function(){telldus.turnOff(currentDevice.id, function(err) { console.log("error"); })});

	currentSchedule.cron = {};
	currentSchedule.cron.scheduleOn = scheduleOn;
	currentSchedule.cron.scheduleOff = scheduleOff;

	console.log("CURRENT SCHEDULE ADDED", currentSchedule);

	scheduleOn.start();
	scheduleOff.start();

	});
	console.log("added schedule")
}


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
			var turnOn = currentSchedule.cron.scheduleOn;
			turnOn.stop();
			var turnOff = currentSchedule.cron.scheduleOff;
			turnOff.stop();
			//allSchedules.remove(turnOn);
			//allSchedules.remove(turnOff);
		}

		currentDevice.schedules.splice(indexRemove, 1);
	}

	res.send(200);
});

app.get('/getDevices', function(req, res){
	var result = [];

	list.forEach(function(item){
		var itemForClient = Object.assign({},item);

		itemForClient.schedules.forEach(function(schedule){
			schedule.cron = undefined;
		});

		result.push(item);
	});
	res.send(list);
});

app.get('/getSensorData', function(req, res){
	res.send(200);
	//res.send(sensorData);
});

app.get('/getAllSchedules',function(req, res){

	//console.log(allSchedules.length);

	res.send(200);	
});

app.get('/getTime', function(req,res){
	var times = sunCalc.getTimes(new Date(),59.459611,17.808503);
	res.send({sun: times, time: new Date()});
});

var server = http.listen(80, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);

});

function omit(obj, omitKey) {
  return Object.keys(obj).reduce((result, key) => {
      if(key !== omitKey) {
             result[key] = obj[key];
          }
      return result;
    }, {});
}