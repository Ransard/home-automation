import React from 'react';

export default class Header extends React.Component {
	render() {
		return <div>
			<button class="btn btn-default" ng-click='addDefaultSchedule()'>Add Default Schedule</button>
			<div class="panel panel-default">
				<div class="panel-body">
					Set schedule for all devices:
				<input type="time" ng-model="globalTurnOn" />
					<input type="time" ng-model="globalTurnOff" />
					<button ng-click='getLightData()'>Get Light Data</button>
					<button ng-click='setGlobalSchedule()'>Set</button>
				</div></div>
		</div>;
	}
}