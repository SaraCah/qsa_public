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

/* import {AppState} from "../models/AppState";
 * import {DisplayResult} from "../models/DisplayResult";
 * import {AspaceSearchParameters} from "../models/SearchParameters";
 * import {AspaceResultTypes, newAspaceResultFromJsonModelType} from "../utils/typeResolver";
 * import {Http} from "../utils/http";
 * import {AspaceResult} from "../models/AspaceResult";
 * import {AgencyResult} from "../models/AgencyResult";
 * import {SeriesResult} from "../models/SeriesResult"; */



const AgencyPage: React.FC<any> = (route: any) => {
  const [agency, setCurrentAgency] = useState<any | null>(null);
  const qsa_id: string = route.match.params.qsa_id;

  if (!agency) {
    Http.get().fetchByQSAID(qsa_id, 'agent_corporate_entity')
      .then((json: any) => {
        setCurrentAgency(new RecordDisplay(json))
      })
      .catch((exception) => {
        console.error(exception);
        window.location.href = '/404';
      });
  }

  if (!agency) {
    return <Layout footer={false}></Layout>;
  } else {
    route.setPageTitle(`Agency: ${agency.get('display_string')}`);

    const controlledRecordsQuery = AdvancedSearchQuery.emptyQuery().addStickyFilter('responsible_agency_id', agency.get('id'), agency.get('display_string'));
    const createdRecordsQuery = AdvancedSearchQuery.emptyQuery().addStickyFilter('creating_agency_id', agency.get('id'), agency.get('display_string'));

    return (
      <Layout>
        <div className="row">
          <div className="col-sm-12">
            <h1>
              { agency.get('display_string') }
              <div>
                <div className="badge">
                  <small>
                    <strong>
                      <i className={ iconForType('agent_corporate_entity') } aria-hidden="true"></i>&nbsp;{ labelForType('agent_corporate_entity') }
                    </strong>
                  </small>
                </div>
              </div>
            </h1>

            <section className="core-information">
              <h2 className="sr-only">Basic information</h2>
              <p className="lead">{ agency.get('agency_note') }</p>

              <ul className="list-group list-group-horizontal-md">
                <li className="list-group-item">
                  <span className="small">ID</span><br/>
                  { agency.get('qsa_id_prefixed') }
                </li>
                <li className="list-group-item">
                  <span className="small">START DATE</span><br/>
                  {
                    agency.getFirst('dates', (date: any) => {
                      return date.begin && (`${date.begin}` + (date.certainty ? `(${date.certainty})`:''));
                    })
                  }
                </li>
                <li className="list-group-item">
                  <span className="small">END DATE</span><br/>
                  {
                    agency.getFirst('dates', (date: any) => {
                      return date.end && (`${date.end}` + (date.certainty_end ? `(${date.certainty_end})`:''));
                    })
                  }
                </li>
              </ul>

              {
                agency.getFirst('dates', (date: any) => {
                  return date.date_notes &&
                      <p className="footer small">Date notes: {date.date_notes}</p>;
                })
              }

              {
                (agency.get('display_name').alternative_name || agency.get('display_name').acronym) && 
                  <p>
                    Alternative names: { agency.get('display_name').acronym } { agency.get('display_name').alternative_name }
                  </p>
              }
            </section>

            <section className="qg-accordion qg-dark-accordion" aria-label="Accordion Label">
              <h2 id="accordion">Detailed information</h2>

              {/*<input type="radio" name="control" id="collapse" className="controls collapse" value="collapse" role="radio"/>*/}
              {/*<label htmlFor="collapse" className="controls">Collapse details</label>*/}
              {/*<span className="controls">&#124;</span>*/}
              {/*<input type="radio" name="control" id="expand" className="controls expand" value="expand" role="radio"/>*/}
              {/*<label htmlFor="expand" className="controls">Show details</label>*/}

              {
                agency.getNotes('bioghist', 'Description', (notes: Note[]) => (
                  <AccordionPanel id={ agency.generateId() }
                                  title='Notes - Description'
                                  children={ notes.map((note: Note) => <NoteDisplay note={ note }/>) } />
                ))
              }

              {
                agency.getNotes('bioghist', 'Information Sources', (notes: Note[]) => (
                    <AccordionPanel id={ agency.generateId() }
                                    title='Notes - Information Sources'
                                    children={ notes.map((note: Note) => <NoteDisplay note={ note }/>) } />
                ))
              }

              {
                agency.getNotes('bioghist', 'Preferred Citation', (notes: Note[]) => (
                    <AccordionPanel id={ agency.generateId() }
                                    title='Notes - Preferred Citation'
                                    children={ notes.map((note: Note) => <NoteDisplay note={ note }/>) } />
                ))
              }

              {
                agency.getNotes('bioghist', 'Remarks', (notes: Note[]) => (
                    <AccordionPanel id={ agency.generateId() }
                                    title='Notes - Remarks'
                                    children={ notes.map((note: Note) => <NoteDisplay note={ note }/>) } />
                ))
              }

              {
                agency.getNotes('bioghist', 'Legislation Establishing', (notes: Note[]) => (
                    <AccordionPanel id={ agency.generateId() }
                                    title='Notes - Legislation Establishing'
                                    children={ notes.map((note: Note) => <NoteDisplay note={ note }/>) } />
                ))
              }

              {
                agency.getNotes('bioghist', 'Legislation Abolishing', (notes: Note[]) => (
                    <AccordionPanel id={ agency.generateId() }
                                    title='Notes - Legislation Abolishing'
                                    children={ notes.map((note: Note) => <NoteDisplay note={ note }/>) } />
                ))
              }

              {
                agency.getNotes('bioghist', 'Legislation Administering', (notes: Note[]) => (
                    <AccordionPanel id={ agency.generateId() }
                                    title='Notes - Legislation Administering'
                                    children={ notes.map((note: Note) => <NoteDisplay note={ note }/>) } />
                ))
              }

              {
                agency.getExternalDocuments('Finding Aid', (docs: any) => (
                    <AccordionPanel id={agency.generateId()}
                                    title='External Resources - Finding Aid'
                                    children={
                                      docs.map((doc: any) => (
                                        <MaybeLink location={ doc.location } label={ doc.location }/>
                                      ))
                                    }/>
                ))
              }

              {
                agency.getExternalDocuments('Publication', (docs: any) => (
                    <AccordionPanel id={agency.generateId()}
                                    title='External Resources - Publications'
                                    children={
                                      docs.map((doc: any) => (
                                        <MaybeLink location={ doc.location } label={ doc.location }/>
                                      ))
                                    }/>
                ))
              }
            </section>

            <section>
              <h2>Relationships</h2>

              {
                <Link to={ `/search?` + controlledRecordsQuery.toQueryString() }
                      className="qg-btn btn-primary btn-sm">
                  Browse Controlled Records
                </Link>
              }
              &nbsp;
              {
                <Link to={ `/search?` + createdRecordsQuery.toQueryString() }
                      className="qg-btn btn-primary btn-sm">
                  Browse Created Records
                </Link>
              }

              { agency.getArray('agent_relationships').length > 0 && <h3>Related agencies</h3> }
              <ul className="list-group list-group-flush">
                {
                  agency.getArray('agent_relationships').map((rlshp: any, idx: number) => {
                    return <li key={ idx } className="list-group-item">
                      { <Relationship relationship={ rlshp } /> }
                    </li>
                  })
                }
              </ul>

              { agency.getArray('mandate_relationships').length > 0 && <h3>Related mandates</h3> }
              <ul className="list-group list-group-flush">
                {
                  agency.getArray('mandate_relationships').map((rlshp: any, idx: number) => {
                    return <li key={ idx } className="list-group-item">
                      { <Relationship relationship={ rlshp } /> }
                    </li>
                  })
                }
              </ul>

              { agency.getArray('function_relationships').length > 0 && <h3>Related functions</h3> }
              <ul className="list-group list-group-flush">
                {
                  agency.getArray('function_relationships').map((rlshp: any, idx: number) => {
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

export default AgencyPage;
