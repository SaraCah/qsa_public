import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/js/bootstrap.bundle';
import './index.scss';
import { BrowserRouter, Switch, Route, RouteComponentProps } from 'react-router-dom'

import axios from 'axios';

import './scss/qg-main.scss';
import 'bootstrap/dist/js/bootstrap';
import 'popper.js';

import HomePage from "./recordViews/Home";
import AgencyPage from "./recordViews/Agency";
import NotFound from "./recordViews/NotFound";
import ResultsPage from "./recordViews/Results";
import SeriesPage from "./recordViews/Series";
import FunctionPage from "./recordViews/Function";
import MandatePage from "./recordViews/Mandate";
import ItemPage from "./recordViews/Item";
import {LoginPage} from "./recordViews/UserSession";

import AppContext from './context/AppContext';
import AppContextProvider from './context/AppContextProvider';

/* Establish error handling */
class ErrorBuffer {
  static FLUSH_DELAY_MS: number = 2000;

  private errors: ErrorEvent[];
  private consoleMessages: { method: string, arguments: any[] }[];
  private flushing: boolean;

  constructor() {
    this.errors = [];
    this.consoleMessages = [];
    this.flushing = false;

    this.startTimer();
  }

  private startTimer() {
    setInterval(() => { this.flush() }, ErrorBuffer.FLUSH_DELAY_MS);
  }

  private flush() {
    if (this.flushing || (this.errors.length === 0 && this.consoleMessages.length === 0)) {
      return;
    }

    const errors = this.errors;
    const consoleMessages = this.consoleMessages;

    this.errors = [];
    this.consoleMessages = [];

    this.flushing = true;
    axios.post(`${process.env.REACT_APP_QSA_PUBLIC_URL}/api/error_report`,
               {
                 errors: this.formatErrors(errors),
                 consoleMessages: this.formatMessages(consoleMessages)
               }).finally(() => {
                 this.flushing = false;
               });
  }

  private formatErrors(errors: ErrorEvent[]): any[] {
    return errors.map((error: ErrorEvent) => {
      return {
        message: error.message,
        filename: error.filename,
        lineno: error.lineno,
        colno: error.colno,
        stack: error.error.stack,
      };
    });
  }

  private formatMessages(messages: any[]): any[] {
    return messages;
  }

  addError(error: ErrorEvent) {
    this.errors.push(error);
  }

  addConsoleMessage(msg: any) {
    this.consoleMessages.push(msg);
  }
}

const appErrorBuffer = new ErrorBuffer();



/* Hook console to capture messages */
const browserConsole: any = console;
const appConsole: any = {}

Object.keys(browserConsole).forEach(function (key){
  appConsole[key] = function (...rest: any[]) {
    appErrorBuffer.addConsoleMessage({
      method: key,
      arguments: rest,
    });
    browserConsole[key].apply(this, arguments)
  };
});

console = appConsole;

/* Grab errors that hit the top-level */
window.addEventListener('error', function (event) {
  appErrorBuffer.addError(event);

  return false;
});



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
    return React.createElement(component,
                               Object.assign({},
                                             props,
                                             {routeKey, setPageTitle},
                                             opts.alwaysRender ? {key: routeKey} : {}));
  }
}


ReactDOM.render(
  <AppContextProvider>
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={wrappedRoute(HomePage, {pageTitle: "Archives Search: Home"})} />
        <Route path="/agencies/:qsa_id" component={wrappedRoute(AgencyPage, {pageTitle: "View agency"})} />
        <Route path="/series/:qsa_id" component={wrappedRoute(SeriesPage, {pageTitle: "View series"})} />
        <Route path="/functions/:qsa_id" component={wrappedRoute(FunctionPage, {pageTitle: "View function"})} />
        <Route path="/mandates/:qsa_id" component={wrappedRoute(MandatePage, {pageTitle: "View mandate"})} />
        <Route path="/items/:qsa_id" component={wrappedRoute(ItemPage, {pageTitle: "View item"})} />
        <Route exact path="/login" component={wrappedRoute(LoginPage, {pageTitle: "Login"})} />
        <Route exact path="/search" component={wrappedRoute(ResultsPage, {pageTitle: "Search records"})} />
        <Route component={wrappedRoute(NotFound, {pageTitle: "Page not found"})} />
      </Switch>
    </BrowserRouter>
  </AppContextProvider>,

  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
