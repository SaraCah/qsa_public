import React, {useState} from 'react';
import {Redirect} from 'react-router';
import {Link, RouteComponentProps} from "react-router-dom";

import {Http} from "../utils/http";

import {
  dateArticleElement,
  noteArticleElement,
  /* basiclistElement, externalResourceArticleElement */
} from "../resultView/resultViewTemplates";
import Layout from "./Layout";
import {
  iconForType, labelForMandateType,
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


const PhysicalRepresentation: React.FC<{representation: any, item: RecordDisplay}> = ({ representation, item }) => {
  representation = new RecordDisplay(representation);
  
  return (
    <dl>
      <dt>ID</dt>
      <dd>{ representation.get('qsa_id_prefixed') }</dd>
      <dt>Title</dt>
      <dd>{ representation.get('title') }</dd>
      <dt>Format</dt>
      <dd>{ representation.get('format') }</dd>
      {
        representation.getMaybe('agency_assigned_id', (value: string) => (
          <>
            <dt>Agency ID</dt>
            <dd>{ value }</dd>
          </>
        ))
      }
      <dt>Previous System Identifier</dt>
      <dd>FIXME MISSING FIELD</dd>
      {
        representation.get('rap_applied').uri !== item.get('rap_applied').uri &&
        <>
          <dt>Access notifications</dt>
          <dd>{ representation.get('rap_applied').display_string }</dd>
        </>
      }
    </dl>
  )
}


const DigitalRepresentation: React.FC<{representation: any, item: RecordDisplay}> = ({ representation, item }) => {
  representation = new RecordDisplay(representation);

  return (
      <dl>
        <dt>Download link</dt>
        <dd>FIXME <a href="https://teaspoon-consulting.com/dropbox/c7513962474ea1c6ec6ac2b01cd273486df4f107.jpg" target="_blank">Link to file</a></dd>
        <dt>ID</dt>
        <dd>{ representation.get('qsa_id_prefixed') }</dd>
        <dt>Title</dt>
        <dd>{ representation.get('title') }</dd>
        {
          representation.getMaybe('file_type', (value: string) => (
              <>
                <dt>Format</dt>
                <dd>{ value }</dd>
              </>
          ))
        }
        {
          representation.getMaybe('agency_assigned_id', (value: string) => (
              <>
                <dt>Agency ID</dt>
                <dd>{ value }</dd>
              </>
          ))
        }
        <dt>Previous System Identifier</dt>
        <dd>FIXME MISSING FIELD</dd>
        {
          representation.get('rap_applied').uri !== item.get('rap_applied').uri &&
            <>
              <dt>Access notifications</dt>
              <dd>{ representation.get('rap_applied').display_string }</dd>
            </>
        }
      </dl>
  )
}


const ItemPage: React.FC<any> = (route: any) => {
  const [item, setCurrentItem] = useState<any | null>(null);
  const [notFoundRedirect, setNotFoundRedirect] = useState(false);
  const qsa_id: string = route.match.params.qsa_id;

  /* FIXME: probably want a definition file of types to QSA prefixes here */
  if (!item) {
    Http.get().fetchByQSAID(qsa_id, 'archival_object')
        .then((json: any) => {
          if (json) {
            setCurrentItem(new RecordDisplay(json))
          } else {
            setNotFoundRedirect(true);
          }
        })
        .catch((exception) => {
          console.error(exception);
          setNotFoundRedirect(true);
        });
  }

  if (notFoundRedirect) {
    return <Redirect to="/404" push={ true } />
  } else if (!item) {
    return <Layout footer={false}></Layout>;
  } else {
    route.setPageTitle(`Item: ${item.get('title')}`);

    return (
        <Layout aside={ <RecordContext qsa_id={ qsa_id } recordType="archival_object" /> }>
          <div className="row">
            <div className="col-sm-12">
              <h1>
                { item.get('title') }
                <div>
                  <div className="badge">
                    <small>
                      <strong>
                        <i className={ iconForType('archival_object') } aria-hidden="true"></i>&nbsp;{ labelForType('archival_object') }
                      </strong>
                    </small>
                  </div>
                </div>
              </h1>

              <section className="core-information">
                <h2 className="sr-only">Basic information</h2>

                <p className="lead">{ item.get('description') }</p>

                <ul className="list-group list-group-horizontal-md">
                  <li className="list-group-item">
                    <span className="small">ID</span><br/>
                    { item.get('qsa_id_prefixed') }
                  </li>
                  <li className="list-group-item">
                    <span className="small">START DATE</span><br/>
                    {
                      item.getFirst('dates', (date: any) => {
                        return date.begin && (`${date.begin}` + (date.certainty ? `(${date.certainty})`:''));
                      })
                    }
                  </li>
                  <li className="list-group-item">
                    <span className="small">END DATE</span><br/>
                    {
                      item.getFirst('dates', (date: any) => {
                        return date.end && (`${date.end}` + (date.certainty_end ? `(${date.certainty_end})`:''));
                      })
                    }
                  </li>
                </ul>

                {
                  item.getFirst('dates', (date: any) => {
                    return date.date_notes &&
                        <p className="footer small">Date notes: {date.date_notes}</p>;
                  })
                }

                <h3 className="sr-only">Item descriptive metadata</h3>

                <ul className="list-group list-group-flush">
                  {
                    item.getMaybe('agency_assigned_id', (value: any) => {
                      return <li className="list-group-item list-group-item-action">
                        <div className="d-flex w-100 justify-content-between">
                          <h4 className="mb-1">Departmental numbers</h4>
                        </div>
                        <p className="mb-1">{ value }</p>
                      </li>
                    })
                  }
                  {
                    item.getMaybe('repository_processing_note', (value: any) => {
                      return <li className="list-group-item list-group-item-action">
                        <div className="d-flex w-100 justify-content-between">
                          <h4 className="mb-1">Previous system identifiers</h4>
                        </div>
                        <p className="mb-1">{ value }</p>
                      </li>
                    })
                  }
                  {
                    <li className="list-group-item list-group-item-action">
                      <div className="d-flex w-100 justify-content-between">
                        <h4 className="mb-1">Copyright Status</h4>
                      </div>
                      <p className="mb-1">FIXME MISSING FIELD</p>
                    </li>
                  }
                  {
                    item.getNotes('prefercite', null, (notes: Note[]) => (
                      <li className="list-group-item list-group-item-action">
                        <div className="d-flex w-100 justify-content-between">
                          <h4 className="mb-1">Preferred citations</h4>
                        </div>
                        <p className="mb-1">
                          { notes.map((note: Note) => <NoteDisplay note={ note }/>) }
                        </p>
                      </li>
                    ))
                  }
                  {
                    item.getNotes('odd', 'Remarks', (notes: Note[]) => (
                        <li className="list-group-item list-group-item-action">
                          <div className="d-flex w-100 justify-content-between">
                            <h4 className="mb-1">Preferred citations</h4>
                          </div>
                          <p className="mb-1">
                            { notes.map((note: Note) => <NoteDisplay note={ note }/>) }
                          </p>
                        </li>
                    ))
                  }
                  {
                    item.getExternalDocuments('Finding Aid', (docs: any) => (
                        <li className="list-group-item list-group-item-action">
                          <div className="d-flex w-100 justify-content-between">
                            <h4 className="mb-1">Finding Aid</h4>
                          </div>
                          <p className="mb-1">
                            {
                              docs.map((doc: any) => (
                                  <MaybeLink location={doc.location}
                                             label={doc.location}/>
                              ))
                            }
                          </p>
                        </li>
                    ))
                  }
                  {
                    item.getExternalDocuments('Publication', (docs: any) => (
                        <li className="list-group-item list-group-item-action">
                          <div className="d-flex w-100 justify-content-between">
                            <h4 className="mb-1">Publications</h4>
                          </div>
                          <p className="mb-1">
                            {
                              docs.map((doc: any) => (
                                  <MaybeLink location={doc.location}
                                             label={doc.location}/>
                              ))
                            }
                          </p>
                        </li>
                    ))
                  }
                  {
                    item.getMaybe('rap_applied', (rap: any) => {
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
                <h2 id="accordion">Item details</h2>

                {/*<input type="radio" name="control" id="collapse" className="controls collapse" value="collapse" role="radio"/>*/}
                {/*<label htmlFor="collapse" className="controls">Collapse details</label>*/}
                {/*<span className="controls">&#124;</span>*/}
                {/*<input type="radio" name="control" id="expand" className="controls expand" value="expand" role="radio"/>*/}
                {/*<label htmlFor="expand" className="controls">Show details</label>*/}

                {
                  item.getArray('physical_representations').length > 0 &&
                  <AccordionPanel id={item.generateId()}
                                  title='Physical representations'
                                  children={
                                    <ul className="list-group list-group-flush">
                                      {
                                        item.getArray('physical_representations').map((representation: any) => (
                                            <li key={ representation.qsa_id } className="list-group-item">
                                              <PhysicalRepresentation representation={representation} item={item}/>
                                            </li>
                                        ))
                                      }
                                    </ul>
                                  }/>
                }

                {
                  item.getArray('digital_representations').length > 0 &&
                  <AccordionPanel id={item.generateId()}
                                  title='Digital representations'
                                  children={
                                    <ul className="list-group list-group-flush">
                                      {
                                        item.getArray('digital_representations').map((representation: any) => (
                                            <li key={ representation.qsa_id } className="list-group-item">
                                              <DigitalRepresentation representation={representation} item={item}/>
                                            </li>
                                        ))
                                      }
                                    </ul>
                                  }/>
                }
              </section>

              {
                item.getArray('agent_relationships').length > 0 &&
                <section>
                  <h2>Relationships</h2>

                  { item.getArray('agent_relationships').length > 0 && <h3>Related agencies</h3> }
                  <ul className="list-group list-group-flush">
                    {
                      item.getArray('agent_relationships').map((rlshp: any, idx: number) => {
                        return <li key={ idx } className="list-group-item">
                          { <Relationship relationship={ rlshp } /> }
                        </li>
                      })
                    }
                  </ul>
                </section>
              }


            </div>
          </div>
        </Layout>
    );
  }
};

export default ItemPage;
