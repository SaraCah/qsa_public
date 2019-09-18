import React from 'react';
import {RouteComponentProps} from "react-router-dom";

const Layout: React.FC<any> = (props: any) => {
    return (
        <>
            <div className="App">
                <section id="qg-access" role="navigation" aria-labelledby="landmark-label">
                    <h2 id="landmark-label">Skip links and keyboard navigation</h2>
                    <ul>
                        <li><a id="skip-to-content" href="#qg-primary-content">Skip to content</a></li>
                        <li id="access-instructions"><a href="/help/accessibility/keyboard.html#section-aria-keyboard-navigation">Use
                            tab and cursor keys to move around the page (more information)</a></li>
                    </ul>
                </section>
                <div className="container-fluid">
                    <header id="qg-site-header">
                        <div className="qg-coat-of-arms col-xs-6 col-md-4">
                            <a href="//www.qld.gov.au">
                                <img src="/assets/v3.1/latest/images/coat-of-arms/qg-coa.svg" alt="Queensland Government"
                                     className="hidden-xs hidden-sm"/>
                                <img src="/assets/v3.1/latest/images/coat-of-arms/qg-coa-stacked.svg" alt="Queensland Government"
                                     className="hidden-md hidden-lg"/>
                            </a>
                        </div>
                        <ul className="qg-utilities list-inline col-xs-6 col-md-5">
                            <li>
                                <a href="#"><span className="fa fa-shopping-cart fa-2x" aria-hidden="true"></span></a>
                            </li>
                            <li>
                                <a href="https://www.qld.gov.au/contact-us/">
                                    <span className="fa fa-phone fa-2x hidden-md hidden-lg" aria-hidden="true"></span>
                                    <span className="hidden-xs hidden-sm">Contact us</span>
                                </a>
                            </li>
                            <li className="hidden-md hidden-lg">
                                <button id="qg-show-search" aria-label="Search" data-toggle="collapse" data-target="#qg-search-form">
                                    <span className="fa fa-search fa-2x" aria-hidden="true"></span>
                                </button>
                            </li>
                            <li className="hidden-md hidden-lg">
                                <button id="qg-show-menu" aria-label="Menu" data-toggle="collapse" data-target="#qg-site-nav, #qg-breadcrumb">
                                    <span className="fa fa-bars fa-2x" aria-hidden="true"></span>
                                </button>
                            </li>
                        </ul>

                        <form action="https://www.qld.gov.au/search" id="qg-search-form" role="search"
                              className="collapse col-xs-12 col-md-3">
                            <div className="input-group">
                                <label htmlFor="qg-search-query" className="qg-visually-hidden">Search Queensland Government</label>
                                <input type="text" name="query" id="qg-search-query" className="form-control" placeholder="Search website"
                                       tabIndex={0} aria-required="true" aria-expanded="false"/>
                                <span className="input-group-btn">
                                    <button type="submit" id="feature-search-submit" className="btn btn-primary" title="Search site">
                                        <span className="fa fa-search" aria-hidden="true"></span>
                                        <span className="qg-visually-hidden">search</span>
                                    </button>
                                </span>
                            </div>
                            <input type="hidden" name="num_ranks" value="10"/>
                            <input type="hidden" name="tiers" value="off"/>
                            <input type="hidden" name="collection" value="qld-gov"/>
                            <input type="hidden" name="profile" value="qld"/>
                        </form>
                    </header>

                    <div id="qg-content">
                        <div id="qg-three-col" className="row">
                            <nav id="qg-breadcrumb" role="navigation" aria-label="breadcrumb navigation" aria-labelledby="breadcrumb-heading" className="collapse">
                                <h2 id="breadcrumb-heading" className="qg-visually-hidden">You are here:</h2>
                                <ol className="list-inline">
                                    <li id="qldGov">
                                        <a href="http://www.qld.gov.au/" target="_blank">Queensland Government home</a>
                                    </li>
                                </ol>
                            </nav>
                            <div id="qg-primary-content" role="main">
                                {props.children}
                            </div>
                            <aside id="qg-secondary-content">
                            </aside>
                            <nav id="qg-section-nav" aria-label="side navigation" role="navigation">
                                <h2><a href="/">ArchivesSearch</a></h2>
                                <ul aria-label="section navigation">
                                    <li><a href="/series">Series</a></li>
                                    <li><a href="/agencies">Agencies</a></li>
                                    <li><a href="/functions">Functions</a></li>
                                    <li><a href="/mandates">Mandates</a></li>
                                </ul>
                            </nav>
                        </div>
                        <div id="qg-options" className="row">
                            <div id="qg-share" className="qg-share"></div>
                            <div id="qg-feedback-btn">
                                <button className="btn btn-default qg-toggle-btn collapsed qg-icon" id="page-feedback-useful"
                                        data-toggle="collapse" data-target="#qg-page-feedback">Feedback</button>
                            </div>
                        </div>
                    </div>

                    <footer>
                        <div className="qg-site-map row">
                            <div>
                                <h3>
                                    <a href="https://www.qld.gov.au/">Queensland Government</a>
                                    <button className="btn btn-link qg-toggle-icon-right collapsed visible-xs-inline-block" data-toggle="collapse" data-target="#footer-info-qg" aria-expanded="false" aria-controls="footer-info-qg"><span className="sr-only">More Queensland Government pages</span>&nbsp;</button>
                                </h3>
                                <ul className="collapse" id="footer-info-qg">
                                    <li><a href="https://www.qld.gov.au/about/contact-government/contacts/">Government contacts</a></li>
                                    <li><a href="https://www.qld.gov.au/about/contact-government/have-your-say/">Have your say</a></li>
                                    <li><a href="https://www.qld.gov.au/about/staying-informed/">Staying informed</a></li>
                                    <li><a href="https://www.qld.gov.au/about/government-jobs/">Government jobs</a></li>
                                    <li><a href="https://www.qld.gov.au/about/how-government-works/">How government works</a></li>
                                    <li><a href="https://data.qld.gov.au/">Queensland Government data</a></li>
                                    <li><a href="https://publications.qld.gov.au/">Queensland Government publications</a></li>
                                    <li><a href="https://www.forgov.qld.gov.au/PageFooter.tsx?utm_medium=website&utm_source=qgov-site&utm_campaign=dsiti-for-gov&utm_content=swe-footer">For government employees</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3>
                                    <a href="https://www.qld.gov.au/queenslanders/">For Queenslanders</a>
                                    <button className="btn btn-link qg-toggle-icon-right collapsed visible-xs-inline-block" data-toggle="collapse" data-target="#footer-info-for-qld" aria-expanded="false" aria-controls="footer-info-qg"><span className="sr-only">More Queensland Government pages</span>&nbsp;</button>
                                </h3>
                                <ul className="col-2 collapse"  id="footer-info-for-qld">
                                    <li><a href="https://www.qld.gov.au/transport/">Transport and motoring</a></li>
                                    <li><a href="https://www.qld.gov.au/jobs/">Employment and jobs</a></li>
                                    <li><a href="https://www.qld.gov.au/housing/">Homes and housing</a></li>
                                    <li><a href="https://www.qld.gov.au/education/">Education and training</a></li>
                                    <li><a href="https://www.qld.gov.au/community/">Community support</a></li>
                                    <li><a href="https://www.qld.gov.au/health/">Health and wellbeing</a></li>
                                    <li><a href="https://www.qld.gov.au/emergency/">Emergency services and safety</a></li>
                                    <li><a href="https://www.qld.gov.au/about/">About Queensland and its government</a></li>
                                    <li><a href="https://www.qld.gov.au/families/">Parents and families</a></li>
                                    <li><a href="https://www.qld.gov.au/disability/">People with disability</a></li>
                                    <li><a href="https://www.qld.gov.au/seniors/">Seniors</a></li>
                                    <li><a href="https://www.qld.gov.au/atsi/">Aboriginal and Torres Strait Islander peoples</a></li>
                                    <li><a href="https://www.qld.gov.au/youth/">Youth</a></li>
                                    <li><a href="https://www.qld.gov.au/environment/">Environment, land and water</a></li>
                                    <li><a href="https://www.qld.gov.au/law/">Your rights, crime and the law</a></li>
                                    <li><a href="https://www.qld.gov.au/recreation/">Recreation, sport and arts</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3>
                                    <a href="http://www.business.qld.gov.au/">Business and industry</a>
                                    <button className="btn btn-link qg-toggle-icon-right collapsed visible-xs-inline-block" data-toggle="collapse" data-target="#footer-info-bi" aria-expanded="false" aria-controls="footer-info-qg"><span className="sr-only">More Queensland Government pages</span>&nbsp;</button>
                                </h3>
                                <ul className="collapse" id="footer-info-bi">
                                    <li><a href="https://www.business.qld.gov.au/starting-business">Starting a business</a></li>
                                    <li><a href="https://www.business.qld.gov.au/running-business">Running a business</a></li>
                                    <li><a href="https://www.business.qld.gov.au/running-business/employing">Employing people</a></li>
                                    <li><a href="https://www.business.qld.gov.au/running-business/employing/payroll-tax">Payroll tax</a></li>
                                    <li><a href="https://www.business.qld.gov.au/industries">Industries</a></li>
                                    <li><a href="https://www.business.qld.gov.au/industries/invest">Investing in Queensland</a></li>
                                    <li><a href="https://www.business.qld.gov.au/industries/invest/chinese-s" lang="zh">昆士兰州的投资机会</a></li>
                                    <li><a href="https://www.business.qld.gov.au/industries/invest/chinese-t" lang="zh">昆士蘭州的投資機會</a></li>
                                    <li><a href="https://www.business.qld.gov.au/industries/invest/japanese" lang="ja">クイーンズランド州への投資機会</a></li>
                                    <li><a href="https://www.business.qld.gov.au/industries/invest/korean" lang="ko">퀸즈랜드 투자 기회</a></li>
                                    <li><a href="https://www.business.qld.gov.au/industries/invest/invertir-turismo" lang="sp">Oportunidades de inversión en Queensland</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="qg-legal row">
                            <ul className="list-inline">
                                <li><a href="https://www.qld.gov.au/contact-us/" className="no-print">Contact us</a></li>
                                <li><a href="https://www.qld.gov.au/help/" className="no-print">Help</a></li>
                                <li><a href="https://www.qld.gov.au/legal/copyright/">Copyright</a></li>
                                <li><a href="https://www.qld.gov.au/legal/disclaimer/">Disclaimer</a></li>
                                <li><a href="https://www.qld.gov.au/legal/privacy/">Privacy</a></li>
                                <li><a href="https://www.qld.gov.au/right-to-information/">Right to information</a></li>
                                <li><a href="https://www.qld.gov.au/help/accessibility/" className="no-print">Accessibility</a></li>
                                <li><a href="http://www.smartjobs.qld.gov.au/" className="no-print">Jobs in Queensland Government</a></li>
                                <li id="link-languages"><a href="https://www.qld.gov.au/languages/" className="no-print">Other languages</a></li>
                            </ul>
                            <p className="qg-copyright">&copy; The State of Queensland <span id="qg-copyright-owner"></span><span id="qg-copyright-daterange"></span></p>
                            <p><a href="https://www.qld.gov.au/">Queensland Government</a></p>
                        </div>
                    </footer>
                </div>
            </div>
        </>);
}

export default Layout;
