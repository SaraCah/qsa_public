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


const NoteDisplay: React.FC<{note: Note}> = ({ note }) => {
  switch (note.kind) {
    case "text": return (<div> { note.text.map((content:string) => <p>{ content }</p>) }</div>);
    case "orderedlist": return (<div>
      <p>{ note.title }</p>
      <ol>
        {
          note.items.map((item: string) => <li>{ item }</li>)
        }
      </ol>
    </div>);
    case "definedlist": return (<div>
      <p>{ note.title }</p>
      <dl>
        {
          note.items.map(({label, value}) => {
            return <>
                <dt>{ label }</dt>
                <dd>{ value }</dd>
            </>
          })
        }
      </dl>
    </div>);
    case "chronology": return (<div>
      <p>{ note.title }</p>
      <dl>
        {
          note.items.map(({event_date, value}) => {
            return <>
              <dt>{ event_date }</dt>
              {
                value.map((v: string) => {
                  return <dd>{ v }</dd>
                })
              }
            </>
          })
        }
      </dl>
    </div>);
  } 
}


const Relationship: React.FC<{relationship: any}> = ({ relationship }) => {
  return (<>
        <i className={ iconForType(relationship._resolved.jsonmodel_type) } aria-hidden="true"></i>&nbsp;
        <Link to={ uriFor(relationship._resolved.qsa_id_prefixed, relationship._resolved.jsonmodel_type) }>
          { relationship._resolved.display_string }
        </Link><br/>
        Relator: { labelForRelator(relationship.relator) }<br/>
        { relationship.start_date }&nbsp;-&nbsp;{ relationship.end_date }
      </>
  )
}


const SeriesPage: React.FC<any> = (route: any) => {
  const [series, setCurrentSeries] = useState<any | null>(null);
  const qsa_id: string = route.match.params.qsa_id;

  /* FIXME: probably want a definition file of types to QSA prefixes here */
  if (!series) {
    Http.fetchByQSAID(qsa_id, 'resource')
      .then((json: any) => {
        setCurrentSeries(new RecordDisplay(json))
      })
      .catch((exception) => {
        console.error(exception);
        // window.location.href = '/404';
      });
  }

  if (!series) {
    return <Layout footer={false}></Layout>;
  } else {
    route.setPageTitle(`Series: ${series.get('title')}`);

    return (
      <Layout>
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
                      return <li className="list-group-item list-group-item-action">
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
                        <h4 className="mb-1">Access notfications</h4>
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
                series.getNotes('prefercite', null, (notes: Note[]) => {
                  return <article>
                    <input id="panel-1" type="checkbox" name="tabs" aria-controls="id-panel-content-1" aria-expanded="false" role="checkbox"/>
                    <h3 className="acc-heading">
                      <label htmlFor="panel-1">Notes: Preferred Citation <span className="arrow"> <i></i></span></label>
                    </h3>
                    <div className="collapsing-section" aria-hidden="true" id="id-panel-content-1">
                      { notes.map((note: Note) => <NoteDisplay note={ note }/>) }
                    </div>
                  </article>
                })
              }

              {
                series.getNotes('odd', 'Remarks', (notes: Note[]) => {
                  return <article>
                    <input id="panel-1" type="checkbox" name="tabs" aria-controls="id-panel-content-1" aria-expanded="false" role="checkbox"/>
                    <h3 className="acc-heading">
                      <label htmlFor="panel-1">Notes: Remarks <span className="arrow"> <i></i></span></label>
                    </h3>
                    <div className="collapsing-section" aria-hidden="true" id="id-panel-content-1">
                      { notes.map((note: Note) => <NoteDisplay note={ note }/>) }
                    </div>
                  </article>
                })
              }

              {
                series.getNotes('custodhist', null, (notes: Note[]) => {
                  return <article>
                    <input id="panel-1" type="checkbox" name="tabs" aria-controls="id-panel-content-1" aria-expanded="false" role="checkbox"/>
                    <h3 className="acc-heading">
                      <label htmlFor="panel-1">Notes - Agency Control Number (aka Department Numbers)  <span className="arrow"> <i></i></span></label>
                    </h3>
                    <div className="collapsing-section" aria-hidden="true" id="id-panel-content-1">
                      { notes.map((note: Note) => <NoteDisplay note={ note }/>) }
                    </div>
                  </article>
                })
              }

              {
                series.getNotes('arrangement', null, (notes: Note[]) => {
                  return <article>
                    <input id="panel-1" type="checkbox" name="tabs" aria-controls="id-panel-content-1" aria-expanded="false" role="checkbox"/>
                    <h3 className="acc-heading">
                      <label htmlFor="panel-1">Notes - System of Arrangement <span className="arrow"> <i></i></span></label>
                    </h3>
                    <div className="collapsing-section" aria-hidden="true" id="id-panel-content-1">
                      { notes.map((note: Note) => <NoteDisplay note={ note }/>) }
                    </div>
                  </article>
                })
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
