import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/js/bootstrap.bundle';
import './index.scss';
import { BrowserRouter, Switch, Route, RouteComponentProps } from 'react-router-dom'


import './scss/qg-main.scss';
import 'bootstrap/dist/js/bootstrap';
import 'popper.js';

import HomePage from "./recordViews/Home";
import AgencyPage from "./recordViews/Agency";
import NotFound from "./recordViews/NotFound";
import ResultsPage from "./recordViews/Results";


let routeKey: number = 0;

function wrappedRoute(component: any, opts: { alwaysRender?: boolean, pageTitle?: string } = {}): any {
  if (typeof(opts.alwaysRender) === 'undefined') {
    opts.alwaysRender = true;
  }

  return (props: RouteComponentProps<any>) => {
    if (opts.alwaysRender) {
      window.scrollTo(0, 0);
    }

    // Clear noindex that might have been added by the layout during a 404
    document.head.querySelectorAll('meta[name="robots"][content="noindex"]').forEach((meta) => {
      meta && meta.parentNode && meta.parentNode.removeChild(meta);
    });

    const setPageTitle = (s: string) => {
      const title = document.head.querySelector('title');
      if (title) {
        title.innerText = s;
      }
    };

    if (opts.pageTitle) {
      setPageTitle(opts.pageTitle);
    }


    routeKey++;
    return React.createElement(component, Object.assign({}, props, {routeKey, setPageTitle}, opts.alwaysRender ? {key: routeKey} : {}));
  }
}


ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={wrappedRoute(HomePage, {pageTitle: "Archives Search: Home"})} />
      <Route path="/agencies/:qsa_id" component={wrappedRoute(AgencyPage, {pageTitle: "View agency"})} />
      <Route exact path="/search" component={wrappedRoute(ResultsPage, {pageTitle: "Search records"})} />
      <Route component={wrappedRoute(NotFound, {pageTitle: "Page not found"})} />
    </Switch>
  </BrowserRouter>,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
