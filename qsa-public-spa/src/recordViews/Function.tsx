import React, {useState} from 'react';
import {Link, RouteComponentProps} from "react-router-dom";

import {Http} from "../utils/http";
import {AgencyResult} from "../models/AgencyResult";

import {
  dateArticleElement,
  noteArticleElement,
  /* basiclistElement, externalResourceArticleElement */
} from "../resultView/resultViewTemplates";
import Layout from "./Layout";
import {Note, RecordDisplay} from "../models/RecordDisplay";
import {iconForType, labelForType} from "../utils/typeResolver";
import {AccordionPanel, MaybeLink, NoteDisplay, Relationship} from "./Helpers";
import {AdvancedSearchQuery} from "../models/AdvancedSearch";


const FunctionPage: React.FC<any> = (route: any) => {
  const [currentFunction, setCurrentFunction] = useState<any | null>(null);
  const qsa_id: string = route.match.params.qsa_id;

  if (!currentFunction) {
    Http.fetchByQSAID(qsa_id, 'function')
      .then((json: any) => {
        setCurrentFunction(new RecordDisplay(json))
      })
      .catch((exception) => {
        console.error(exception);
        window.location.href = '/404';
      });
  }

  if (!currentFunction) {
    return <Layout footer={false}></Layout>;
  } else {
    route.setPageTitle(`Function: ${currentFunction.get('title')}`);

    const relatedQuery = AdvancedSearchQuery.emptyQuery().addFilter('function_id', currentFunction.get('id'), currentFunction.get('title'));

    return (
      <Layout>
        <div className="row">
          <div className="col-sm-12">
            <h1>
              { currentFunction.get('title') }
              <div>
                <div className="badge">
                  <small>
                    <strong>
                      <i className={ iconForType('function') } aria-hidden="true"></i>&nbsp;{ labelForType('function') }
                    </strong>
                  </small>
                </div>
              </div>
            </h1>

            <section className="core-information">
              <h2 className="sr-only">Basic information</h2>
              <p className="lead">{ currentFunction.get('note') }</p>

              <ul className="list-group list-group-horizontal-md">
                <li className="list-group-item">
                  <span className="small">ID</span><br/>
                  { currentFunction.get('qsa_id_prefixed') }
                </li>
                <li className="list-group-item">
                  <span className="small">START DATE</span><br/>
                  {
                    currentFunction.getFirst('date', (date: any) => {
                      return date.begin && (`${date.begin}` + (date.certainty ? `(${date.certainty})`:''));
                    })
                  }
                </li>
                <li className="list-group-item">
                  <span className="small">END DATE</span><br/>
                  {
                    currentFunction.getFirst('date', (date: any) => {
                      return date.end && (`${date.end}` + (date.certainty_end ? `(${date.certainty_end})`:''));
                    })
                  }
                </li>
              </ul>

              {
                currentFunction.getFirst('date', (date: any) => {
                  return date.date_notes &&
                      <p className="footer small">Date notes: {date.date_notes}</p>;
                })
              }
            </section>

            <section>
              <h2>Relationships</h2>

              {
                <Link to={ `/search?` + relatedQuery.toQueryString() }
                      className="qg-btn btn-primary btn-xs">
                  Browse Related Series
                </Link>
              }

              { currentFunction.getArray('agent_relationships').length > 0 && <h3>Related agencies</h3> }
              <ul className="list-group list-group-flush">
                {
                  currentFunction.getArray('agent_relationships').map((rlshp: any, idx: number) => {
                    return <li key={ idx } className="list-group-item">
                      { <Relationship relationship={ rlshp } /> }
                    </li>
                  })
                }
              </ul>

              { currentFunction.getArray('mandate_relationships').length > 0 && <h3>Related mandates</h3> }
              <ul className="list-group list-group-flush">
                {
                  currentFunction.getArray('mandate_relationships').map((rlshp: any, idx: number) => {
                    return <li key={ idx } className="list-group-item">
                      { <Relationship relationship={ rlshp } /> }
                    </li>
                  })
                }
              </ul>

              { currentFunction.getArray('function_relationships').length > 0 && <h3>Related functions</h3> }
              <ul className="list-group list-group-flush">
                {
                  currentFunction.getArray('function_relationships').map((rlshp: any, idx: number) => {
                    return <li key={ idx } className="list-group-item">
                      { <Relationship relationship={ rlshp } /> }
                    </li>
                  })
                }
              </ul>
            </section>
          </div>
        </div>
      </Layout>
    );
  }
};

export default FunctionPage;
