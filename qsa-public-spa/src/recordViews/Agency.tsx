import React, {useState} from 'react';
import {RouteComponentProps, Link} from "react-router-dom";

import {Http} from "../utils/http";
import {AgencyResult} from "../models/AgencyResult";

import {
  dateArticleElement,
  noteArticleElement,
  basiclistElement, externalResourceArticleElement
} from "../resultView/resultViewTemplates";

/* import {AppState} from "../models/AppState";
 * import {DisplayResult} from "../models/DisplayResult";
 * import {AspaceSearchParameters} from "../models/SearchParameters";
 * import {AspaceResultTypes, newAspaceResultFromJsonModelType} from "../utils/typeResolver";
 * import {Http} from "../utils/http";
 * import {AspaceResult} from "../models/AspaceResult";
 * import {AgencyResult} from "../models/AgencyResult";
 * import {SeriesResult} from "../models/SeriesResult"; */



const AgencyPage: React.FC<RouteComponentProps<any>> = (route: RouteComponentProps<any>) => {
  const [agency, setCurrentAgency] = React.useState<any | null>(null);
  const qsa_id: string = route.match.params.qsa_id;

  /* FIXME: probably want a definition file of types to QSA prefixes here */
  if (!agency) {
    Http.fetchByQSAID<AgencyResult>(qsa_id, AgencyResult)
      .then((agencyResult: AgencyResult) => {
        setCurrentAgency(agencyResult)
      })
      .catch(() => {
        window.location.href = '/not-found';
      });
  }

  if (!agency) {
    return <></>;
  } else {
    const hasAgentRelationships = agency.agentRelationships.length > 0,
          hasSeriesRelationships = agency.seriesRelationships.length > 0,
          hasNotes = agency.notes.length > 0,
          hasDates = agency.dates.length > 0;

    return (
      <>
        <div id="qg-primary-content" role="main">
          <div className="row">
            <div className="col-sm-12">

              <h1>{agency.displayString}</h1>
              <h2 className="sr-only">Basic information</h2>
              <section className="core-information">
                <p className="lead">{agency.abstract}</p>
                <ul className="list-group list-group-horizontal">
                  <li className="list-group-item">
                    <span className="small">ID</span><br/>
                    {agency.qsaIdPrefixed}
                  </li>
                  <li className="list-group-item">
                    <span className="small">Primary name</span><br/>
                    {agency.primaryName}
                  </li>
                  <li className="list-group-item">
                    <span className="small">Alternative name</span><br/>
                    {agency.alternativeName}
                  </li>
                  <li className="list-group-item">
                    <span className="small">Acronym</span><br/>
                    {agency.acronym}
                  </li>
                </ul>
              </section>

              <h2 id="accordion-details" className="sr-only">Detailed information</h2>
              {hasNotes && hasDates &&
               <section className="qg-accordion qg-dark-accordion" aria-label="Accordion Label">
                 <input type="radio" name="control" id="collapse" className="controls collapse" value="collapse" role="radio"/>
                 <label htmlFor="collapse" className="controls">Collapse details</label>
                 <span className="controls">&#124;</span>
                 <input name="control" id="expand-series-details" className="controls expand" value="expand" role="radio"/>
                 <label htmlFor="expand-series-details" className="controls">Show details</label>
                 {dateArticleElement('agency', agency.dates)}
                 {agency.notes.map((note: any) => noteArticleElement(note))}
               </section>
              }
              {(hasAgentRelationships || hasSeriesRelationships) &&
               <section className="qg-accordion qg-dark-accordion">
                 <h2>Agency relationships</h2>
                 {hasAgentRelationships &&
                  <>
                    <h3>Related agencies</h3>
                    <ul className="list-group list-group-flush">
                      {agency.agentRelationships
                             .filter((relationship: any) => !!relationship.resolved)
                             .map((relationship: any) => (
                               <li className="list-group-item">
                                 <span className="small">{relationship.relator}</span><br/>
                                 {relationship.resolved.qsaIdPrefixed} - {relationship.resolved.displayString}:&nbsp;
                                 {relationship.startDate}{!!relationship.endDate ? ` - ${relationship.endDate}` : ''}
                               </li>
                             ))}
                    </ul>
                  </>
                 }
                 {hasSeriesRelationships &&
                  <>
                    <h3>Related series</h3>
                    <ul className="list-group list-group-flush">
                      {agency.seriesRelationships
                             .filter((relationship: any) => !!relationship.resolved)
                             .map((relationship: any) => (
                               <li className="list-group-item">
                                 <h4>{relationship.resolved.qsaIdPrefixed} - {relationship.resolved.title}</h4>
                                 <span>{relationship.relator}</span>
                                 {relationship.startDate}{!!relationship.endDate ? ` - ${relationship.endDate}` : ''}
                               </li>
                             ))}
                    </ul>
                  </>
                 }
               </section>
              }
              <div className="row">
                <div className="col-sm-12">
                  <div className="qg-content-footer">
                    <dl>
                      <dt>Last updated:</dt>
                      <dd>27 August 2019</dd>
                      <dt>Last reviewed:</dt>
                      <dd>27 August 2019</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default AgencyPage;
