import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserSession } from './UserSession';
import AppContext from '../context/AppContext';
import {PageSnippet} from './PageViewPage';
import { IAppContext } from '../context/AppContext';

const LeftNavigation: React.FC<any> = (props: any) => {
  return (
    <nav id="qg-side-nav" aria-label="side navigation" role="navigation">
      {!props.errorPage && <PageSnippet slug="sidebar-top" />}
      <h2>
        <Link to={'/'}>ArchivesSearch</Link>
      </h2>
      {!props.showNavForUser && (
        <ul aria-label="section navigation" style={props.context.user ? { paddingBottom: 0 } : {}}>
          <li>
            <Link to={'/search?type[]=resource'}>Series</Link>
          </li>
          <li>
            <Link to={'/search?type[]=archival_object'}>Items</Link>
          </li>
          <li>
            <Link to={'/search?type[]=agent_corporate_entity'}>Agencies</Link>
          </li>
          <li>
            <Link to={'/search?type[]=function'}>Functions</Link>
          </li>
          <li>
            <Link to={'/search?type[]=mandate'}>Mandates</Link>
          </li>
        </ul>
      )}
      {props.context.user && (
        <>
          <h2
            style={{
              paddingTop: 10,
              paddingBottom: props.showNavForUser ? 0 : 35
            }}
          >
            <Link to={'/my-account'}>My Account</Link>
          </h2>
          {props.showNavForUser && (
            <ul aria-label="section navigation">
              <li>
                <Link to="/my-details">My contact details</Link>
              </li>
              <li>
                <Link to="/change-password">Change password</Link>
              </li>
              {props.context.user.is_admin ? (
                <>
                  <li>
                    <Link to="/admin/users">User management</Link>
                  </li>
                  <li>
                    <Link to="/admin/tags">Tag management</Link>
                  </li>
                  <li>
                    <Link to="/admin/pages">Page management</Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/my-requests">My requests</Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/my-searches">My searches</Link>
              </li>
            </ul>
          )}
        </>
      )}
      {!props.errorPage && <PageSnippet slug="sidebar-bottom" />}
    </nav>
  );
};

const Layout: React.FC<any> = (props: any) => {
  const [noIndexAdded, setNoIndexAdded] = useState(false);

  if (props.noindex && !noIndexAdded) {
    const metaElt = document.createElement('meta');
    metaElt.name = 'robots';
    metaElt.content = 'noindex';

    document.head.appendChild(metaElt);
    setNoIndexAdded(true);
  }

  return (
    <AppContext.Consumer>
      {(context: IAppContext) => (
        <div className="App">
          <section id="qg-access" role="navigation" aria-labelledby="landmark-label">
            <h2 id="landmark-label">Skip links and keyboard navigation</h2>
            <ul>
              <li>
                <a id="skip-to-content" href="#qg-primary-content">
                  Skip to content
                </a>
              </li>
              <li id="access-instructions">
                <a href="help/accessibility/keyboard.html#section-aria-keyboard-navigation">
                  Use tab and cursor keys to move around the page (more information)
                </a>
              </li>
            </ul>
          </section>
          <div className="container-fluid">
            <header id="qg-site-header">
              <div className="qg-coat-of-arms col-xs-6 col-md-4">
                <a href="//www.qld.gov.au">
                  <img
                    src="/assets/v3.1/latest/images/coat-of-arms/qg-coa.svg"
                    alt="Queensland Government"
                    className="hidden-xs hidden-sm"
                  />
                  <img
                    src="/assets/v3.1/latest/images/coat-of-arms/qg-coa-stacked.svg"
                    alt="Queensland Government"
                    className="hidden-md hidden-lg"
                  />
                </a>
              </div>
              <ul className="qg-utilities list-inline col-xs-6 col-md-5">
                <li>
                  <a href="https://www.qld.gov.au/contact-us/">
                    <span className="fa fa-phone fa-2x hidden-md hidden-lg" aria-hidden="true" />
                    <span className="hidden-xs hidden-sm">Contact us</span>
                  </a>
                </li>
                <li className="hidden-md hidden-lg">
                  <button id="qg-show-search" aria-label="Search" data-toggle="collapse" data-target="#qg-search-form">
                    <span className="fa fa-search fa-2x" aria-hidden="true" />
                  </button>
                </li>
                <li className="hidden-md hidden-lg">
                  <button
                    id="qg-show-menu"
                    aria-label="Menu"
                    data-toggle="collapse"
                    data-target="#qg-site-nav, #qg-breadcrumb"
                  >
                    <span className="fa fa-bars fa-2x" aria-hidden="true" />
                  </button>
                </li>
              </ul>

              <form
                action="https://www.qld.gov.au/search"
                id="qg-search-form"
                role="search"
                className="collapse col-xs-12 col-md-3"
              >
                <div className="input-group">
                  <label htmlFor="qg-search-query" className="qg-visually-hidden">
                    Search Queensland Government
                  </label>
                  <input
                    type="text"
                    name="query"
                    id="qg-search-query"
                    className="form-control"
                    placeholder="Search all qld.gov.au"
                    tabIndex={0}
                    aria-required="true"
                  />
                  <span className="input-group-btn">
                    <button type="submit" id="feature-search-submit" className="btn btn-primary" title="Search site">
                      <span className="fa fa-search" aria-hidden="true" />
                      <span className="qg-visually-hidden">search</span>
                    </button>
                  </span>
                </div>
                <input type="hidden" name="num_ranks" value="10" />
                <input type="hidden" name="tiers" value="off" />
                <input type="hidden" name="collection" value="qld-gov" />
                <input type="hidden" name="profile" value="qld" />
              </form>
            </header>

            <div className="row">
              <nav
                id="qg-breadcrumb"
                role="navigation"
                aria-label="breadcrumb navigation"
                aria-labelledby="breadcrumb-heading"
                className="collapse"
              >
                <h2 id="breadcrumb-heading" className="qg-visually-hidden">
                  You are here:
                </h2>
                <ol className="list-inline">
                  <li id="qldGov">
                    <a href="http://www.qld.gov.au/" target="_blank" rel="noopener noreferrer">
                      Queensland Government home
                    </a>
                  </li>
                  <li>
                    <a href="https://www.qld.gov.au/queenslanders/" target="_blank" rel="noopener noreferrer">
                      For Queenslanders
                    </a>
                  </li>
                  <li className="qldGovBreadcrumb">
                    <a href="https://www.qld.gov.au/recreation/" target="_blank" rel="noopener noreferrer">
                      Recreation, sport and arts
                    </a>
                  </li>
                  <li className="qldGovBreadcrumb">
                    <a href="https://www.qld.gov.au/recreation/arts/" target="_blank" rel="noopener noreferrer">
                      Arts, culture and heritage
                    </a>
                  </li>
                  <li className="qldGovBreadcrumb">
                    <a href="https://www.qld.gov.au/recreation/arts/heritage/" target="_blank" rel="noopener noreferrer">
                      Heritage
                    </a>
                  </li>
                  <li className="qldGovBreadcrumb">
                    <a href="https://www.qld.gov.au/recreation/arts/heritage/archives/" target="_blank" rel="noopener noreferrer">
                      Queensland's archives
                    </a>
                  </li>
                  <li className="qldGovBreadcrumb">ArchivesSearch</li>
                </ol>
              </nav>
            </div>

            <div id="qg-content">
              <div id={props.aside ? 'qg-three-col' : 'qg-two-col-nav'} className="row">
                <div id="qg-primary-content" role="main">
                  {!props.aside && !props.errorPage && <UserSession context={context} />}
                  {props.children}
                </div>

                {props.aside && !props.errorPage && (
                  <aside id="qg-secondary-content">
                    <UserSession context={context} />

                    <div className="qg-aside" style={{clear: "both"}}>{props.aside}</div>
                  </aside>
                )}

                <div id="qg-section-nav">
                  <LeftNavigation errorPage={props.errorPage} context={context} showNavForUser={props.showNavForUser} />
                </div>
              </div>
            </div>

            {props.skipFooter ? (
              <></>
            ) : (
              <>
                <div id="qg-options" className="row">
                  <div id="qg-share" className="qg-share"/>
                  <div id="qg-feedback-btn">
                    <button
                      className="btn btn-default qg-toggle-btn qg-icon collapsed"
                      id="page-feedback-useful"
                      data-toggle="collapse"
                      data-target="#qg-page-feedback"
                    >
                      Feedback
                    </button>
                  </div>
                </div>
                <div id="qg-page-feedback" className="collapse">
                  <form id="qg-page-feedback-form"
                  method="post"
                  action="https://www.smartservice.qld.gov.au/services/submissions/email/feedback/feedback"
                  className="form"
                  data-recaptcha="true"
                  >
                    <ol className="questions">
                      <li>
                        <fieldset id="page-feedback-about">
                          <legend><span className="label"> Is your feedback about:</span></legend>
                          <div className="radio">
                            <input name="page-feedback-about" id="page-feedback-about-this-website" type="radio" value="this website"
                            data-qg-pr="default"
                            data-target="#feedback-page"
                            data-toggle="collapse"
                            aria-expanded="false"
                            aria-controls="#feedback-page" />
                            <label htmlFor="page-feedback-about-this-website">this website</label>
                          </div>
                          <div className="radio">
                            <input name="page-feedback-about" id="page-feedback-about-a-government-service" type="radio" value="a government service"
                            data-qg-pr="default"
                            data-target="#feedback-serv-dep-staff"
                            data-toggle="collapse"
                            aria-expanded="false"
                            aria-controls="#feedback-serv-dep-staff"
                            />
                            <label htmlFor="page-feedback-about-a-government-service">a government service, department or staff member?</label>
                          </div>
                        </fieldset>
                      </li>
                    </ol>

                    <div className="panel">
                      <div id="feedback-serv-dep-staff" className="status info panel-collapse collapse" data-parent="#qg-page-feedback-form">
                        <h2>Feedback on government services, department and staff</h2>
                        <p>Please use our <a href="https://www.qld.gov.au/contact-us/complaints/">complaints and compliments form</a></p>
                      </div>
                      <div id="feedback-page" className="panel-collapse collapse" data-parent="#qg-page-feedback-form">
                        <h2>Page Feedback</h2>
                        <ol id="feedback-page-list" className="questions">
                          <li className="col-12">
                            <fieldset>
                              <legend>
                                <span className="label">How satisfied are you with your experience today?</span>
                                <abbr title="(required)" className="required"></abbr>
                              </legend>
                              <div className="radio">
                                <input type="radio" name="feedback-satisfaction" value="Very dissatisfied" required={true} id="fs-very-dissatisfied" />
                                <label htmlFor="fs-very-dissatisdied">Very dissatisfied (1) </label>
                              </div>
                              <div className="radio">
                                <input type="radio" name="feedback-satisfaction" value="Dissatisfied" required={true} id="fs-dissatisfied" />
                                <label htmlFor="fs-dissatisdied">Dissatisfied (2) </label>
                              </div>
                              <div className="radio">
                                <input type="radio" name="feedback-satisfaction" value="Neither satisfied or dissatisfied" required={true} id="fs-neither-satisfied-or-dissatisfied" />
                                <label htmlFor="fs-neither-satisfied-or-dissatisfied">Neither satisfied or dissatisfied (3) </label>
                              </div>
                              <div className="radio">
                                <input type="radio" name="feedback-satisfaction" value="Satisfied" required={true} id="fs-satisfied" />
                                <label htmlFor="fs-satisfied">Satisfied (4) </label>
                              </div>
                              <div className="radio">
                                <input type="radio" name="feedback-satisfaction" value="Very satisfied" required={true} id="fs-very-satisfied" />
                                <label htmlFor="fs-very-satisfied">Very satisfied (5) </label>
                              </div>
                            </fieldset>
                          </li>
                          <li className="col-12">
                            <div className="form-group">
                              <label htmlFor="form-group">
                              <span className="label">Comments</span>
                              <abbr title="(required)" className="requiured">*</abbr>
                              </label>
                              <textarea className="form-control" name="comments" id="comments"  required={true}></textarea>
                            </div>
                          </li>
                          <li id="feedback-captcha-containter" className="col-md-12">
                            <div className="form-group">
                              <label htmlFor="feedback-captcha">Please leave this blank (this helps us identify automatic spam)</label>
                              <input className="form-control" type="text" name="captcha" id="feedback-captcha" value="" onChange={(e) => {}}/>
                            </div>
                          </li>
                          <li className="footer col-md12">
                            <span id="feedback-hidden-inputs"></span>
                            <ul className="actions">
                              <li>
                                <button type="submit" value="Submit feedback" className="qg-btn btn-primary">Submit Feedback</button>
                              </li>
                            </ul>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </form>
                </div>
                <footer>
                  <div className="qg-site-map row">
                    <div>
                      <h3>
                        <a href="https://www.qld.gov.au/">Queensland Government</a>
                        <button
                          className="btn btn-link qg-toggle-icon-right collapsed visible-xs-inline-block"
                          data-toggle="collapse"
                          data-target="#footer-info-qg"
                          aria-expanded="false"
                          aria-controls="footer-info-qg"
                        >
                          <span className="sr-only">More Queensland Government pages</span>
                &nbsp;
                        </button>
                      </h3>
                      <ul className="collapse" id="footer-info-qg">
                        <li>
                          <a href="https://www.qld.gov.au/about/contact-government/contacts/">Government contacts</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/about/contact-government/have-your-say/">Have your say</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/about/staying-informed/">Staying informed</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/about/government-jobs/">Government jobs</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/about/how-government-works/">How government works</a>
                        </li>
                        <li>
                          <a href="https://data.qld.gov.au/">Queensland Government data</a>
                        </li>
                        <li>
                          <a href="https://publications.qld.gov.au/">Queensland Government publications</a>
                        </li>
                        <li>
                          <a href="https://www.forgov.qld.gov.au/PageFooter.tsx?utm_medium=website&utm_source=qgov-site&utm_campaign=dsiti-for-gov&utm_content=swe-footer">
                            For government employees
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3>
                        <a href="https://www.qld.gov.au/queenslanders/">For Queenslanders</a>
                        <button
                          className="btn btn-link qg-toggle-icon-right collapsed visible-xs-inline-block"
                          data-toggle="collapse"
                          data-target="#footer-info-for-qld"
                          aria-expanded="false"
                          aria-controls="footer-info-qg"
                        >
                          <span className="sr-only">More Queensland Government pages</span>
                &nbsp;
                        </button>
                      </h3>
                      <ul className="col-2 collapse" id="footer-info-for-qld">
                        <li>
                          <a href="https://www.qld.gov.au/transport/">Transport and motoring</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/jobs/">Employment and jobs</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/housing/">Homes and housing</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/education/">Education and training</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/community/">Community support</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/health/">Health and wellbeing</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/emergency/">Emergency services and safety</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/about/">About Queensland and its government</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/families/">Parents and families</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/disability/">People with disability</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/seniors/">Seniors</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/atsi/">Aboriginal and Torres Strait Islander peoples</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/youth/">Youth</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/environment/">Environment, land and water</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/law/">Your rights, crime and the law</a>
                        </li>
                        <li>
                          <a href="https://www.qld.gov.au/recreation/">Recreation, sport and arts</a>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3>
                        <a href="http://www.business.qld.gov.au/">Business and industry</a>
                        <button
                          className="btn btn-link qg-toggle-icon-right collapsed visible-xs-inline-block"
                          data-toggle="collapse"
                          data-target="#footer-info-bi"
                          aria-expanded="false"
                          aria-controls="footer-info-qg"
                        >
                          <span className="sr-only">More Queensland Government pages</span>
                &nbsp;
                        </button>
                      </h3>
                      <ul className="collapse" id="footer-info-bi">
                        <li>
                          <a href="https://www.business.qld.gov.au/starting-business">Starting a business</a>
                        </li>
                        <li>
                          <a href="https://www.business.qld.gov.au/running-business">Running a business</a>
                        </li>
                        <li>
                          <a href="https://www.business.qld.gov.au/running-business/employing">Employing people</a>
                        </li>
                        <li>
                          <a href="https://www.business.qld.gov.au/running-business/employing/payroll-tax">Payroll tax</a>
                        </li>
                        <li>
                          <a href="https://www.business.qld.gov.au/industries">Industries</a>
                        </li>
                        <li>
                          <a href="https://www.business.qld.gov.au/industries/invest">Investing in Queensland</a>
                        </li>
                        <li>
                          <a href="https://www.business.qld.gov.au/industries/invest/chinese-s" lang="zh">
                            昆士兰州的投资机会
                          </a>
                        </li>
                        <li>
                          <a href="https://www.business.qld.gov.au/industries/invest/chinese-t" lang="zh">
                            昆士蘭州的投資機會
                          </a>
                        </li>
                        <li>
                          <a href="https://www.business.qld.gov.au/industries/invest/japanese" lang="ja">
                            クイーンズランド州への投資機会
                          </a>
                        </li>
                        <li>
                          <a href="https://www.business.qld.gov.au/industries/invest/korean" lang="ko">
                            퀸즈랜드 투자 기회
                          </a>
                        </li>
                        <li>
                          <a href="https://www.business.qld.gov.au/industries/invest/invertir-turismo" lang="sp">
                            Oportunidades de inversión en Queensland
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="qg-legal row">
                    <ul className="list-inline">
                      <li>
                        <a href="https://www.qld.gov.au/contact-us/" className="no-print">
                          Contact us
                        </a>
                      </li>
                      <li>
                        <a href="https://www.qld.gov.au/help/" className="no-print">
                          Help
                        </a>
                      </li>
                      <li>
                        <a href="https://www.qld.gov.au/legal/copyright/">Copyright</a>
                      </li>
                      <li>
                        <a href="https://www.qld.gov.au/legal/disclaimer/">Disclaimer</a>
                      </li>
                      <li>
                        <a href="https://www.qld.gov.au/legal/privacy/">Privacy</a>
                      </li>
                      <li>
                        <a href="https://www.qld.gov.au/right-to-information/">Right to information</a>
                      </li>
                      <li>
                        <a href="https://www.qld.gov.au/help/accessibility/" className="no-print">
                          Accessibility
                        </a>
                      </li>
                      <li>
                        <a href="http://www.smartjobs.qld.gov.au/" className="no-print">
                          Jobs in Queensland Government
                        </a>
                      </li>
                      <li id="link-languages">
                        <a href="https://www.qld.gov.au/languages/" className="no-print">
                          Other languages
                        </a>
                      </li>
                    </ul>
                    <p className="qg-copyright">
                &copy; The State of Queensland <span id="qg-copyright-owner" />
                <span id="qg-copyright-daterange" />
                    </p>
                    <p>
                      <a href="https://www.qld.gov.au/">Queensland Government</a>
                    </p>
                  </div>
                </footer>
              </>
            )}
          </div>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default Layout;
