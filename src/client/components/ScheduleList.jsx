import React from 'react';
import ScheduleItem from './ScheduleItem'

export default class ScheduleList extends React.Component {
    render() {

        for(let i = 0; i < activeSchedules; i++)
            <ScheduleItem item=activeSchedules[i] />
        let schedules = {};

        return
            <div class="panel-group" id="accordion" role="tablist">
                <div class="device" ng-repeat="device in devices | orderBy:['noSchedules','name']">
                    <div class="panel panel-default">
                        <div class="panel-heading"><h3><span class="device-desc">{{ device.name }}</span></h3></div><div class="panel-body">
                            <div class="col-md-6">
                                <button class="btn btn-default" ng-click='turnOn(device.id)'>Turn on</button>
                                <button class="btn btn-default" ng-click='turnOff(device.id)'>Turn off</button>
                            </div>
                            <div class="col-md-3">Turn on: <input type="time" ng-model=device.turnOn ng-required="!device.turnOn" /></div>
                            <div class="col-md-3">Turn off: <input type="time" ng-model=device.turnOff ng-required="!device.turnOff" /></div>
                            <div class="col-md-4"><button type="submit" class="btn btn-default" ng-click='addSchedule(device)'>Add</button></div>
                            <div class="col-md-12">Current schedules</div>
                            <div class="col-md-12">
                                <ul>
                                    <li ng-repeat="schedule in device.schedules">{{ schedule.text }}
						</ul>
                                    <select ng-model="device.activeSchedule" ng-options="schedule.text for schedule in device.schedules track by schedule.id"></select>
                                    <button class="btn btn-default" type="submit" ng-click='removeSchedule(device)'>Remove</button></div></div></div>
                    </div>
                </div>
                Ha ljusen på i en timme, släck sedan
            <ScheduleItem />
            <ScheduleItem />
            <ScheduleItem />
            <ScheduleItem />
        </div>
    }
}