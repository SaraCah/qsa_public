import React, {useState} from 'react';
import {Link, RouteComponentProps} from "react-router-dom";

import {Http} from "../utils/http";
import {SeriesResult} from "../models/SeriesResult";

import {
  dateArticleElement,
  noteArticleElement,
  /* basiclistElement, externalResourceArticleElement */
} from "../resultView/resultViewTemplates";
import Layout from "./Layout";
import {
  iconForType,
  labelForRelator,
  labelForType,
  uriFor
} from "../utils/typeResolver";
import {Note, RecordDisplay} from "../models/RecordDisplay";
import {
  AccordionPanel,
  MaybeLink,
  NoteDisplay,
  RecordContext,
  Relationship
} from "./Helpers";


const SeriesPage: React.FC<any> = (route: any) => {
  const [series, setCurrentSeries] = useState<any | null>(null);
  const qsa_id: string = route.match.params.qsa_id;

  /* FIXME: probably want a definition file of types to QSA prefixes here */
  if (!series) {
    Http.get().fetchByQSAID(qsa_id, 'resource')
      .then((json: any) => {
        setCurrentSeries(new RecordDisplay(json))
      })
      .catch((exception) => {
        console.error(exception);
        window.location.href = '/404';
      });
  }

  if (!series) {
    return <Layout footer={false} />;
  } else {
    route.setPageTitle(`Series: ${series.get('title')}`);

    return (
      <Layout aside={ <RecordContext qsa_id={ qsa_id } recordType="resource" /> }>
        <div className="row">
          <div className="col-sm-12">
            <h1>
              { series.get('title') }
              <div>
                <div className="badge">
                  <small>
                    <strong>
                      <i className={ iconForType('resource') } aria-hidden="true"></i>&nbsp;{ labelForType('resource') }
                    </strong>
                  </small>
                </div>
              </div>
            </h1>

            <section className="core-information">
              <h2 className="sr-only">Basic information</h2>

              <p className="lead">{ series.get('abstract') }</p>

              <ul className="list-group list-group-horizontal-md">
                <li className="list-group-item">
                  <span className="small">ID</span><br/>
                  { series.get('qsa_id_prefixed') }
                </li>
                <li className="list-group-item">
                  <span className="small">START DATE</span><br/>
                  {
                    series.getFirst('dates', (date: any) => {
                      return date.begin && (`${date.begin}` + (date.certainty ? `(${date.certainty})`:''));
                    })
                  }
                </li>
                <li className="list-group-item">
                  <span className="small">END DATE</span><br/>
                  {
                    series.getFirst('dates', (date: any) => {
                      return date.end && (`${date.end}` + (date.certainty_end ? `(${date.certainty_end})`:''));
                    })
                  }
                </li>
              </ul>

              {
                series.getFirst('dates', (date: any) => {
                  return date.date_notes && 
                    <p className="footer small">Date notes: {date.date_notes}</p>;
                })
              }

              <h3 className="sr-only">Series descriptive metadata</h3>

              <ul className="list-group list-group-flush">
                {
                  [
                    ['disposal_class', 'Disposal class'],
                    ['sensitivity_label', 'Sensitivity label'],
                    ['copyright_status', 'Copyright status'],
                    ['information_sources', 'Information sources'],
                    ['repository_processing_note', 'Previous identifiers'],
                  ].map(([fieldName, fieldLabel]) => {
                    return series.getMaybe(fieldName, (value: any) => {
                      return <li key={ fieldLabel } className="list-group-item list-group-item-action">
                        <div className="d-flex w-100 justify-content-between">
                          <h4 className="mb-1">{ fieldLabel }</h4>
                        </div>
                        <p className="mb-1">{ value }</p>
                      </li>
                    })
                  })
                }
                {
                  series.getMaybe('rap_attached', (rap: any) => {
                    return <li className="list-group-item list-group-item-action">
                      <div className="d-flex w-100 justify-content-between">
                        <h4 className="mb-1">Access notifications</h4>
                      </div>
                      <p className="mb-1">{ rap.display_string }</p>
                    </li>
                  })
                }
              </ul>

            </section>

            <section className="qg-accordion qg-dark-accordion" aria-label="Accordion Label">
              <h2 id="accordion">Detailed information</h2>

              {/*<input type="radio" name="control" id="collapse" className="controls collapse" value="collapse" role="radio"/>*/}
              {/*<label htmlFor="collapse" className="controls">Collapse details</label>*/}
              {/*<span className="controls">&#124;</span>*/}
              {/*<input type="radio" name="control" id="expand" className="controls expand" value="expand" role="radio"/>*/}
              {/*<label htmlFor="expand" className="controls">Show details</label>*/}

              {
                series.getNotes('prefercite', null, (notes: Note[]) => (
                    <AccordionPanel id={ series.generateId() }
                                    title='Notes - Preferred Citation'
                                    children={ notes.map((note: Note) => <NoteDisplay note={ note }/>) } />
                ))
              }

              {
                series.getNotes('odd', 'Remarks', (notes: Note[]) => (
                    <AccordionPanel id={ series.generateId() }
                                    title='Notes - Remarks'
                                    children={ notes.map((note: Note) => <NoteDisplay note={ note }/>) } />
                ))
              }

              {
                series.getNotes('custodhist', null, (notes: Note[]) => (
                    <AccordionPanel id={ series.generateId() }
                                    title='Notes - Agency Control Number (aka Department Numbers)'
                                    children={ notes.map((note: Note) => <NoteDisplay note={ note }/>) } />
                ))
              }

              {
                series.getNotes('arrangement', null, (notes: Note[]) => (
                    <AccordionPanel id={ series.generateId() }
                                    title='Notes - System of Arrangement'
                                    children={ notes.map((note: Note) => <NoteDisplay note={ note }/>) } />
                ))
              }

              {
                series.getExternalDocuments('Finding Aid', (docs: any) => (
                    <AccordionPanel id={series.generateId()}
                                    title='External Resources - Finding Aid'
                                    children={
                                      docs.map((doc: any) => (
                                        <MaybeLink location={ doc.location } label={ doc.location }/>
                                      ))
                                    }/>
                ))
              }

              {
                series.getExternalDocuments('Publication', (docs: any) => (
                    <AccordionPanel id={series.generateId()}
                                    title='External Resources - Publications'
                                    children={
                                      docs.map((doc: any, idx: number) => (
                                        <MaybeLink key={ idx } location={ doc.location } label={ doc.location }/>
                                      ))
                                    }/>
                ))
              }
            </section>

            <section>
              <h2>Relationships</h2>

              { series.getArray('agent_relationships').length > 0 && <h3>Related agencies</h3> }
              <ul className="list-group list-group-flush">
                {
                  series.getArray('agent_relationships').map((rlshp: any, idx: number) => {
                    return <li key={ idx } className="list-group-item">
                      { <Relationship relationship={ rlshp } /> }
                    </li> 
                  })
                }
              </ul>

              { series.getArray('series_relationships').length > 0 && <h3>Related series</h3> }
              <ul className="list-group list-group-flush">
                {
                  series.getArray('series_relationships').map((rlshp: any, idx: number) => {
                    return <li key={ idx } className="list-group-item">
                      { <Relationship relationship={ rlshp } /> }
                    </li>
                  })
                }
              </ul>

              { series.getArray('mandate_relationships').length > 0 && <h3>Related mandates</h3> }
              <ul className="list-group list-group-flush">
                {
                  series.getArray('mandate_relationships').map((rlshp: any, idx: number) => {
                    return <li key={ idx } className="list-group-item">
                      { <Relationship relationship={ rlshp } /> }
                    </li>
                  })
                }
              </ul>

              { series.getArray('function_relationships').length > 0 && <h3>Related functions</h3> }
              <ul className="list-group list-group-flush">
                {
                  series.getArray('function_relationships').map((rlshp: any, idx: number) => {
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

export default SeriesPage;
