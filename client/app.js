var smartHouseApp = angular.module('smartHouseApp',[]);
var d3Item = [];

function IsDataItemValid(data)  {
	return data.type == 1 && data.deviceId == 172 ;
}

smartHouseApp.controller('mainController',function($scope,$http) {
	$http.get('/getDevices').
		success(function(data) {
			$scope.devices = data;

			for(var i = 0; i < $scope.devices.length; i++) {
				var device = $scope.devices[i];
				device.noSchedules = device.schedules.length;
				console.log(device);
				for(var j = 0; j < device.schedules.length; j++)
					device.schedules[j].text =  ConvertToLocalTime(device.schedules[j].turnon) + " - " + ConvertToLocalTime(device.schedules[j].turnoff);
			}
		});

	function FilterData(data){
		var result = [];

		for(var i=0; i < data.length; i++){
			if(IsDataItemValid(data[i]))
				result.push(data[i]);
		}	

		return result;
	}

	$scope.getLightData = function(){
		$http.get('/lights').
			success(function(data){
				console.log(data);
			})
	}


	$http.get('getSensorData').
		success(function(data) {
			d3Item = FilterData(data);
			DrawGraph(d3Item);
		});

	$scope.activeSchedules = {};

	$http.get('/getTime').
		success(function(data){
			$scope.currServerTime = ConvertToLocalTime(data.time);
			$scope.dusk = data.dusk;
		});

	$scope.addDefaultSchedule = function() {
		$http.post('/addSchedules')
		.success(function(data) {
			console.log("added default schedules");
		})
	}

	$scope.turnOn = function(id){
		console.log(id);
		$http.post('/turnOn/',{"id": id}).
			success(function(data) {
				console.log("turning on");
				console.log(data);
			}).
		error(function(data){
			console.log(data);
		});
	};

	$scope.turnOff = function(id){
		console.log(id);
		$http.post('/turnOff',{"id": id})
			console.log("turning off");
	};

	$scope.setGlobalSchedule = function() {
		console.log($scope.devices)
			for(var i = 0; i < $scope.devices.length; i++) {
				var dateOn = new Date($scope.globalTurnOn);
				var minutes = dateOn.getMinutes();
				$scope.devices[i].turnOn = dateOn;
				$scope.devices[i].turnOn.setMinutes(minutes + i);

				var dateOff = new Date($scope.globalTurnOff);
				minutes = dateOff.getMinutes();
				$scope.devices[i].turnOff = dateOff;
				$scope.devices[i].turnOff.setMinutes(minutes + i);
				//	$scope.setSchedule($scope.devices[i]);
			}

	};

	$scope.addSchedule = function(device){
		console.log("adding schedule");
		console.log(ConvertToUTCTime(device.turnOn));

		$http.post('/addSchedule',{"id": device.id, "schedules": [{ "turnon": ConvertToUTCTime(device.turnOn), "turnoff": ConvertToUTCTime(device.turnOff)}]})
			.success(function(data){
				console.log(data);})
			.error(function(data){
				console.log("error!");});
	}

	$scope.getAllSchedules = function() {
		$http.get('/getAllSchedules').success(function(res){});
	};

	$scope.removeSchedule = function(device){

		$http.post('/removeSchedule',{"deviceid": device.id, "scheduleid": device.activeSchedule.id})
			.success(function(data){
				console.log(data);
			});
	}

	$scope.setSchedule = function(device){
		if(device.turnOn !== undefined && device.turnOff !== undefined)
		{
			$http.post('/setSchedule',{"id": device.id, "turnOn": device.turnOn, "turnOff": device.turnOff}).
				success(function(data){
					console.log(data);});
		}
		else
			console.log("failure");
	};

});



