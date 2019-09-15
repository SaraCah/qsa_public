import React, {useState} from 'react';
import './scss/qg-main.scss';
import 'bootstrap/dist/js/bootstrap';
import 'popper.js';
import Breadcrumbs from "./breadcrumbs/Breadcrumbs";
import Cart from "./cart/Cart";
import PageFooter from "./pageFooter/PageFooter";
import PageHeader from "./pageHeader/PageHeader";
import FeedbackForm from "./feedbackForm/FeedbackForm";
import AspaceSearch from "./aspaceSearch/AspaceSearch";
import ContentView from "./contentView/ContentView";
import {AppState} from "./models/AppState";

const App: React.FC = () => {
  const appState: AppState = {
    selectedResult: useState()
  };
  return (
    <div className="App">
      <section id="qg-access" role="navigation" aria-labelledby="landmark-label">
        <h2 id="landmark-label">Skip links and keyboard navigation</h2>
        <ul>
          <li><a id="skip-to-content" href="#qg-primary-content">Skip to content</a></li>
          <li id="access-instructions"><a href="/help/accessibility/keyboard.html#section-aria-keyboard-navigation">Use tab and cursor keys to move around the page (more information)</a></li>
        </ul>
      </section>
      <div className="container-fluid">
        <PageHeader/>
        <div id="qg-content">
          <div id="qg-three-col" className="row">
            <Breadcrumbs/>
            <ContentView {...appState}/>
            <aside id="qg-secondary-content">
              <Cart/>
              <div className="qg-aside qg-search">
                <h2>
                  <span className="fa fa-search fa-2x" aria-hidden="true"></span>
                  Place your secondary search here, such tree nav
                </h2>
                <p>Go team!</p>
              </div>
            </aside>
            <AspaceSearch {...appState}/>
          </div>
          <div id="qg-options" className="row">
            <div id="qg-share" className="qg-share"></div>
            <div id="qg-feedback-btn">
              <button className="btn btn-default qg-toggle-btn collapsed qg-icon" id="page-feedback-useful"
                      data-toggle="collapse"
                      data-target="#qg-page-feedback">Feedback</button>
            </div>
          </div>

          <FeedbackForm/>
        </div>

        <PageFooter/>
      </div>
    </div>
  );
};

export default App;
