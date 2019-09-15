import React from 'react';

const PageHeader: React.FC = () => {
  return (
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
          <a href="#"><span className="fa fa-shopping-cart fa-2x hidden-md hidden-lg" aria-hidden="true"></span>cart</a>
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
      <nav id="qg-site-nav" role="navigation" aria-label="Main navigation" className="collapse">
        <ul>
          <li><a href="https://www.qld.gov.au/queenslanders/">For Queenslanders</a></li>
          <li><a href="https://www.business.qld.gov.au/">Business and industry</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default PageHeader;