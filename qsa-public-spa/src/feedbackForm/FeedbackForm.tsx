import React from "react";

const FeedbackForm: React.FC = () => {
  return (
    <div id="qg-page-feedback" className="row collapse">
    <form id="qg-page-feedback-form"
          method="post"
          action="https://localhost/services/submissions/email/feedback/feedback"
          className="form"
          data-recaptcha="true">
      <ol className="questions">
        <li>
          <fieldset id="page-feedback-about">
            <legend><span className="label">Is your feedback about:</span></legend>
            <div className="radio">
              <input name="page-feedback-about" id="page-feedback-about-this-website" type="radio" value="this website"
                     data-qg-pr="default" data-parent="#qg-page-feedback-form" data-target="#feedback-page"/>
              <label htmlFor="page-feedback-about-this-website">this website</label>
            </div>
            <div className="radio">
              <input name="page-feedback-about" id="page-feedback-about-a-government-service" type="radio"
                     value="a government service" data-qg-pr="default" data-parent="#qg-page-feedback-form"
                     data-target="#feedback-serv-dep-staff"/>
              <label htmlFor="page-feedback-about-a-government-service">a government service, department or staff member?</label>
            </div>
          </fieldset>
        </li>
      </ol>
      <div className="panel">
        <div id="feedback-serv-dep-staff" className="status info panel-collapse collapse">
          <h2>Feedback on government services, departments and staff</h2>
          <p>Please use our <a href="https://www.qld.gov.au/contact-us/complaints/">complaints and compliments form</a>.</p>
        </div>
        <div id="feedback-page" className="panel-collapse collapse">
          <h2>Page feedback</h2>
          <ol id="feedback-page-list" className="questions">
            <li className="col-12">
              <fieldset>
                <legend>
                  <span className="label">How satisfied are you with your experience today?</span>
                  <abbr title="(required)" className="required">*</abbr>
                </legend>
                <div className="radio">
                  <input type="radio" name="feedback-satisfaction" value="Very dissatisfied" required={false} id="fs-very-dissatisfied" />
                  <label htmlFor="fs-very-dissatisfied">Very dissatisfied (1)</label>
                </div>
                <div className="radio">
                  <input type="radio" name="feedback-satisfaction" value="Dissatisfied" required={false} id="fs-dissatisfied" />
                  <label htmlFor="fs-dissatisfied">Dissatisfied (2)</label>
                </div>
                <div className="radio">
                  <input type="radio" name="feedback-satisfaction" value="Neither satisfied or dissatisfied" required={false} id="fs-neither-satisfied-or-dissatisfied" />
                  <label htmlFor="fs-neither-satisfied-or-dissatisfied">Neither satisfied or dissatisfied (3)</label>
                </div>
                <div className="radio">
                  <input type="radio" name="feedback-satisfaction" value="Satisfied" required={false} id="fs-satisfied" />
                  <label htmlFor="fs-satisfied">Satisfied (4)</label>
                </div>
                <div className="radio">
                  <input type="radio" name="feedback-satisfaction" value="Very satisfied" required={false} id="fs-very-satisfied" />
                  <label htmlFor="fs-very-satisfied">Very satisfied (5)</label>
                </div>

              </fieldset>
            </li>
            <li className="col-12">
              <div className="form-group">
                <label htmlFor="comments">
                  <span className="label">Comments</span>
                  <abbr title="(required)" className="required">*</abbr>
                </label>
                <textarea className="form-control" name="comments" id="comments" rows={10} cols={40} required={true}></textarea>
              </div>
            </li>
            <li id="feedback-captcha-container" className="col-md-12">
              <div className="form-group">
                <label htmlFor="feedback-captcha">Please leave this blank (this helps us identify automatic spam)</label>
                <input className="form-control" type="text" name="captcha" id="feedback-captcha" defaultValue="" />
              </div>
            </li>
            <li className="footer col-md-12">
              <span id="feedback-hidden-inputs"></span>
              <ul className="actions">
                <li>
                  <button type="submit" value="Submit feedback" className="qg-btn btn-primary">Submit feedback</button>
                </li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </form>
  </div>
  )
};

export default FeedbackForm;