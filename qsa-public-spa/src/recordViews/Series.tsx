import React, {useState} from 'react';
import {RouteComponentProps} from "react-router-dom";

import {Http} from "../utils/http";
import {SeriesResult} from "../models/SeriesResult";

import {
  dateArticleElement,
  noteArticleElement,
  /* basiclistElement, externalResourceArticleElement */
} from "../resultView/resultViewTemplates";
import Layout from "./Layout";


const SeriesPage: React.FC<any> = (route: any) => {
  const [series, setCurrentSeries] = useState<any | null>(null);
  const qsa_id: string = route.match.params.qsa_id;

  /* FIXME: probably want a definition file of types to QSA prefixes here */
  if (!series) {
    Http.fetchByQSAID<SeriesResult>(qsa_id, SeriesResult)
      .then((seriesResult: SeriesResult) => {
        setCurrentSeries(seriesResult)
      })
      .catch(() => {
        window.location.href = '/404';
      });
  }

  if (!series) {
    return <></>;
  } else {
    route.setPageTitle(`Series: ${series.displayString}`);

    const hasAgentRelationships = series.agentRelationships.length > 0,
          hasSeriesRelationships = series.seriesRelationships.length > 0,
          hasNotes = series.notes.length > 0,
          hasDates = series.dates.length > 0;

    return (
      <Layout>
        <div className="row">
          <div className="col-sm-12">
            <h1>{ series.title }</h1>

            <section className="core-information">
              <h2 className="sr-only">Basic information</h2>

              <p className="lead">{ series.abstract }</p>

              <ul className="list-group list-group-horizontal-md">
                <li className="list-group-item">
                  <span className="small">ID</span><br/>
                  { series.qsaIdPrefixed }
                </li>
                <li className="list-group-item">
                  <span className="small">START DATE</span><br/>
                  [series.start_date] ([start date qual])
                </li>
                <li className="list-group-item">
                  <span className="small">END DATE</span><br/>
                  [series.end_date] ([end date qual])
                </li>
              </ul>

              <p className="footer small">Date notes: [Series.date_notes]</p>
              <h3 className="sr-only">Series descriptive metadata</h3>

                  <ul className="list-group list-group-flush">
                <li className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h4 className="mb-1">Disposal class</h4>
                  </div>
                  <p className="mb-1">(Disposal class)</p>
                </li>
                <li className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h4 className="mb-1">Sensitivity label</h4>
                  </div>
                  <p className="mb-1">(sensitivity label)</p>
                </li>
                <li className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h4 className="mb-1">Copyright status</h4>
                  </div>
                  <p className="mb-1">(copyright status)</p>
                </li>
                <li className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h4 className="mb-1">Information sources</h4>
                  </div>
                  <p className="mb-1">(information sources)</p>
                </li>
                <li className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h4 className="mb-1">Previous identifiers</h4>
                  </div>
                  <p className="mb-1">(Previous system identifiers)</p>
                </li>
                <li className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h4 className="mb-1">Access notifications</h4>
                  </div>
                  <p className="mb-1">(access notifications)</p>
                </li>
              </ul>

            </section>

            <section className="qg-accordion qg-dark-accordion"
                     aria-label="Accordion Label">
              <h2 id="accordion">Detailed information</h2>
              <input type="radio" name="control" id="collapse"
                     className="controls collapse" value="collapse"
                     role="radio"/>
                <label htmlFor="collapse" className="controls">Collapse details</label>
                <span className="controls">&#124;</span>
                <input type="radio" name="control" id="expand"
                       className="controls expand" value="expand" role="radio"/>
                  <label htmlFor="expand" className="controls">Show
                    details</label>

                  <article>
                    <input id="panel-1" type="checkbox" name="tabs"
                           aria-controls="id-panel-content-1"
                           aria-expanded="false" role="checkbox"/>
                      <h3 className="acc-heading"><label htmlFor="panel-1">Note
                        type: Description<span className="arrow"> <i></i></span></label>
                      </h3>
                      <div className="collapsing-section" aria-hidden="true"
                           id="id-panel-content-1">
                        <p> Insert all content from this note into this
                          space</p>
                      </div>
                  </article>
                  <article>
                    <input id="panel-2" type="checkbox" name="tabs"
                           aria-controls="id-panel-content-2"
                           aria-expanded="false" role="checkbox"/>
                      <h3 className="acc-heading"><label htmlFor="panel-2">Note
                        type: Information Sources<span
                            className="arrow"> <i></i></span></label></h3>
                      <div className="collapsing-section" aria-hidden="true"
                           id="id-panel-content-2">
                        <p> Insert all content from this note into this
                          space</p>
                      </div>
                  </article>
                  <article>
                    <input id="panel-3" type="checkbox" name="tabs"
                           aria-controls="id-panel-content-3"
                           aria-expanded="false" role="checkbox"/>
                      <h3 className="acc-heading"><label htmlFor="panel-3">Note
                        type: Preferred Citiation<span
                            className="arrow"> <i></i></span></label></h3>
                      <div className="collapsing-section" aria-hidden="true"
                           id="id-panel-content-3">
                        <p> Insert all content from this note into this
                          space</p>
                      </div>
                  </article>
                  <article>
                    <input id="panel-4" type="checkbox" name="tabs"
                           aria-controls="id-panel-content-4"
                           aria-expanded="false" role="checkbox"/>
                      <h3 className="acc-heading"><label htmlFor="panel-4">Note
                        type: Remarks<span
                            className="arrow"> <i></i></span></label></h3>
                      <div className="collapsing-section" aria-hidden="true"
                           id="id-panel-content-4">
                        <p> Insert all content from this note into this
                          space</p>
                      </div>
                  </article>
                  <article>
                    <input id="panel-5" type="checkbox" name="tabs"
                           aria-controls="id-panel-content-5"
                           aria-expanded="false" role="checkbox"/>
                      <h3 className="acc-heading"><label htmlFor="panel-5">Note
                        type: Agency Control Numbers<span
                            className="arrow"> <i></i></span></label></h3>
                      <div className="collapsing-section" aria-hidden="true"
                           id="id-panel-content-5">
                        <p> Insert all content from this note into this
                          space</p>
                      </div>
                  </article>
                  <article>
                    <input id="panel-6" type="checkbox" name="tabs"
                           aria-controls="id-panel-content-6"
                           aria-expanded="false" role="checkbox"/>
                      <h3 className="acc-heading"><label htmlFor="panel-6">External
                        resources: Finding aids<span className="arrow"> <i></i></span></label>
                      </h3>
                      <div className="collapsing-section" aria-hidden="true"
                           id="id-panel-content-6">
                        <p> Insert all content from this note into this
                          space</p>
                      </div>
                  </article>
                  <article>
                    <input id="panel-7" type="checkbox" name="tabs"
                           aria-controls="id-panel-content-7"
                           aria-expanded="false" role="checkbox"/>
                      <h3 className="acc-heading"><label htmlFor="panel-7">External
                        resources: Publications<span className="arrow"> <i></i></span></label>
                      </h3>
                      <div className="collapsing-section" aria-hidden="true"
                           id="id-panel-content-7">
                        <p> Insert all content from this note into this
                          space</p>
                      </div>
                  </article>
            </section>

            <section>

              <h2>Agency relationships</h2>

              <h3>Related agencies</h3>

              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  (Related agency 1)<br/>
                  (Relationship type 1)<br/>
                  (Relationship dates 1)
                </li>
                <li className="list-group-item">
                  (Related agency 2)<br/>
                  (Relationship type 2)<br/>
                  (Relationship dates 2)
                </li>
              </ul>

              <h3>Related mandates</h3>

              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  (Related mandate 1)<br/>
                  (Relationship type 1)<br/>
                  (Relationship dates 1)
                </li>
              </ul>

              <h3>Related functions</h3>

              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  (Related function 1)<br/>
                  (Relationship type 1)<br/>
                  (Relationship dates 1)
                </li>
                <li className="list-group-item">
                  (Related function 2)<br/>
                  (Relationship type 2)<br/>
                  (Relationship dates 2)
                </li>
              </ul>
            </section>


          </div>
        </div>
      </Layout>
    );
  }
};

export default SeriesPage;
