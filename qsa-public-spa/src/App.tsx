import React, {CSSProperties, useState} from 'react';
import './scss/qg-main.scss';
import 'bootstrap/dist/js/bootstrap';
import 'popper.js';
import Breadcrumbs from "./breadcrumbs/Breadcrumbs";
import Cart from "./cart/Cart";
import PageFooter from "./pageFooter/PageFooter";
import FeedbackForm from "./feedbackForm/FeedbackForm";
import AspaceSearch from "./aspaceSearch/AspaceSearch";
import {AppState} from "./models/AppState";
import {Route, Switch} from "react-router-dom";

import AspaceAdvancedSearch from "./advancedSearch/AdvancedSearch";
import HomePage from "./recordViews/Home";
import AgencyPage from "./recordViews/Agency";
import NotFound from "./recordViews/NotFound";
import ResultsPage from "./recordViews/ResultsPage";


const App: React.FC = () => {
  const appState: AppState = {
    selectedResult: useState(),
    selectedPage: useState()
  };
  return (
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route path="/agencies/:qsa_id" component={AgencyPage} />
      <Route exact path="/search" component={ResultsPage} />
      <Route component={NotFound} />
    </Switch>
  );
};

export default App;
