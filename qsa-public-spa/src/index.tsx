import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/js/bootstrap.bundle';
import './index.scss';
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import './scss/qg-main.scss';
import 'bootstrap/dist/js/bootstrap';
import 'popper.js';

import HomePage from "./recordViews/Home";
import AgencyPage from "./recordViews/Agency";
import NotFound from "./recordViews/NotFound";
import ResultsPage from "./recordViews/Results";


ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route path="/agencies/:qsa_id" component={AgencyPage} />
      <Route exact path="/search" component={ResultsPage} />
      <Route component={NotFound} />
    </Switch>
  </BrowserRouter>,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
