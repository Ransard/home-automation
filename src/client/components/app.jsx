import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';
import Header from './Header'
import ScheduleList from './ScheduleList'

ReactDOM.render(
    <div>
        <Header />
        <ScheduleList />
    </div>
    , document.getElementById('app'));