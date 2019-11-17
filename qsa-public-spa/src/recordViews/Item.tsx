import React, { useState } from 'react';
import { Redirect } from 'react-router';
import {baseURL, Http} from '../utils/http';
import Layout from './Layout';
import {
  iconForType,
  labelForAvailability,
  labelForType
} from '../utils/typeResolver';
import { Note, RecordDisplay } from '../models/RecordDisplay';
import { AccordionPanel, MaybeLink, NoteDisplay, RecordContext, Relationship } from './Helpers';
import AppContext from '../context/AppContext';
import {Tagger} from "./Tagger";
import { IAppContext } from '../context/AppContext';
import { PageRoute } from '../models/PageRoute';


const PhysicalRepresentation: React.FC<{
  representation: any;
  item: RecordDisplay;
  context: IAppContext;
}> = ({ representation, item, context }) => {
  representation = new RecordDisplay(representation);

  const classForAvailability = (availability: string) => {
    if (availability === 'available') {
      return 'badge-success';
    } else if (REQUESTABLE_AVAILABILITIES.indexOf(availability) >= 0) {
      return 'badge-warning';
    } else {
      return 'badge-danger';
    }
  };

  return (
    <>
      {
        isRepresentationAvailableForRequest(representation) &&
        <div className="pull-right text-right">
          <div style={{marginBottom: 10}}><AddToReadingRoomRequestCartButton itemId={representation.get('id')} /></div>
          <AddToDigitalCopyRequestCartButton itemId={representation.get('id')} />
        </div>
      }
      <dl>
        <dt>ID</dt>
        <dd>{representation.get('qsa_id_prefixed')}</dd>
        <dt>Title</dt>
        <dd>{representation.get('title')}</dd>
        <dt>Format</dt>
        <dd>{representation.get('format')}</dd>
        <dt>Availability</dt>
        <dd>
          <span className={`badge badge-pill ${classForAvailability(representation.get('availability'))}`}>{labelForAvailability(representation.get('availability'))}</span>
        </dd>
        {representation.getMaybe('agency_assigned_id', (value: string) => (
          <>
            <dt>Agency ID</dt>
            <dd>{value}</dd>
          </>
        ))}
        <dt>Previous System Identifier</dt>
        <dd>FIXME MISSING FIELD</dd>
        {representation.get('rap_applied').uri !== item.get('rap_applied').uri && (
          <>
            <dt>Access notifications</dt>
            <dd>{representation.get('rap_applied').display_string}</dd>
          </>
        )}
      </dl>

      <Tagger recordId={representation.get('id')} context={context}/>
    </>
  );
};

const DigitalRepresentation: React.FC<{
  representation: any;
  item: RecordDisplay;
  context: IAppContext;
}> = ({ representation, item, context }) => {
  representation = new RecordDisplay(representation);

  return (
    <>
      <dl>
        {
          representation.get('representation_file') &&
          <>
            <dt>Download link</dt>
            <dd>
            <a href={baseURL + '/api/download_file/' + representation.get('qsa_id_prefixed')} target="_blank" rel="noopener noreferrer">
            Link to file
            </a>
            </dd>
          </>
        }
        <dt>ID</dt>
        <dd>{representation.get('qsa_id_prefixed')}</dd>
        <dt>Title</dt>
        <dd>{representation.get('title')}</dd>
        {representation.getMaybe('file_type', (value: string) => (
          <>
            <dt>Format</dt>
            <dd>{value}</dd>
          </>
        ))}
        {representation.getMaybe('agency_assigned_id', (value: string) => (
          <>
            <dt>Agency ID</dt>
            <dd>{value}</dd>
          </>
        ))}
        <dt>Previous System Identifier</dt>
        <dd>FIXME MISSING FIELD</dd>
        {representation.get('rap_applied').uri !== item.get('rap_applied').uri && (
          <>
            <dt>Access notifications</dt>
            <dd>{representation.get('rap_applied').display_string}</dd>
          </>
        )}
      </dl>
      <Tagger recordId={representation.get('id')} context={context}/>
    </>
  );
};

const AddToDigitalCopyRequestCartButton: React.FC<any> = ({ itemId }) => {
  const requestItem = (item_id: string, request_type: string, context: IAppContext) => {
    Http.get()
        .addToCart(item_id, request_type)
        .then((json: any) => {
          context.refreshCart();
        })
        .catch((exception: Error) => {
          console.error(exception);
        });
  };

  const inCart = (cart: any, itemId: string) => {
    let result = false;

    cart.digital_copy_requests.set_price_records.concat(cart.digital_copy_requests.quotable_records).forEach((cartItem: any) => {
      if (cartItem.item_id === itemId) {
        result = true
      }
    });

    return result;
  };

  return (
      <AppContext.Consumer>
        {(context: IAppContext): React.ReactElement => {
          if (!context.user) {
            return (
              <div className={"request-button-no-login"}>
                <button className="qg-btn btn-default disabled">
                  <i className="fa fa-copy" aria-hidden="true"/>&nbsp;
                  Request digital copy
                </button>
                <div>
                  <small className="text-muted">Log in to access your cart</small>
                </div>
              </div>
            );
          } else if (context.user && context.cart && inCart(context.cart, itemId)) {
            return (
              <>
                <button className="qg-btn btn-default disabled">
                  <i className="fa fa-copy" aria-hidden="true"/>&nbsp;
                  Added to cart
                </button>
              </>
            );
          } else {
            return (
              <button className="qg-btn btn-secondary" onClick={() => requestItem(itemId, 'DIGITAL_COPY', context)}>
                <i className="fa fa-copy" aria-hidden="true"/>&nbsp;
              Request digital copy
              </button>
            );
          }
        }
        }
      </AppContext.Consumer>
  );
};

const AddToReadingRoomRequestCartButton: React.FC<any> = ({ itemId }) => {
  const requestItem = (item_id: string, request_type: string, context: IAppContext) => {
    Http.get()
      .addToCart(item_id, request_type)
      .then((json: any) => {
        context.refreshCart();
      })
      .catch((exception: Error) => {
        console.error(exception);
      });
  };

  const inCart = (cart: any, itemId: string) => {
    let result = false;

    if (cart.reading_room_requests.open_records) {
      cart.reading_room_requests.open_records.forEach((cartItem: any) => {
        if (cartItem.item_id === itemId) {
          result = true;
        }
      });
    }

    if (result) {
      return true;
    }

    if (cart.reading_room_requests.closed_records) {
      Object.keys(cart.reading_room_requests.closed_records).forEach((agency_uri: string) => {
        cart.reading_room_requests.closed_records[agency_uri].forEach((cartItem: any) => {
          if (cartItem.item_id === itemId) {
            result = true;
          }
        });
      });
    }

    return result;
  };

  return (
    <AppContext.Consumer>
      {(context: IAppContext): React.ReactElement => (
        <>
        {
          !context.user &&
          <>
            <button className="qg-btn btn-default disabled">
              <i className="fa fa-institution" aria-hidden="true"/>&nbsp;
              Request to view in Reading Room
            </button>
            <div>
              <small className="text-muted">Log in to access your cart</small>
            </div>
          </>
        }
        {
          context.user && context.cart && (inCart(context.cart, itemId) ? (
            <>
              <button className="qg-btn btn-default disabled">
                <i className="fa fa-institution" aria-hidden="true"/>&nbsp;
                Added to cart
              </button>
            </>
          ) : (
            <button className="qg-btn btn-primary"
                    onClick={() => requestItem(itemId, 'READING_ROOM', context)}>
              <i className="fa fa-institution" aria-hidden="true"/>&nbsp;
              Request to view in Reading Room
            </button>
          ))
        }
      </>)}
    </AppContext.Consumer>
  );
};

const RequestActions: React.FC<any> = ({ item }) => {
  return (
    <div className="row">
      <div className="col-sm-12 record-top-request-buttons">
        <div className={"top-request-button"}><ReadingRoomRequestAction item={item}/></div>
        <div className={"top-request-button"}><DigitalCopyRequestAction item={item}/></div>
      </div>
    </div>
  )
}

const REQUESTABLE_AVAILABILITIES = ['available',
                                    'unavailable_due_to_conservation',
                                    'unavailable_due_to_date_range',
                                    'unavailable_contact_qsa'];

const isRepresentationAvailableForRequest = (representation: RecordDisplay) => {
  return REQUESTABLE_AVAILABILITIES.indexOf(representation.get('availability')) >= 0;
};

const DigitalCopyRequestAction: React.FC<any> = ({ item }) => {
  const requestableRepresentations: any[] = item.getArray('physical_representations').filter((representation: any) => {
    return isRepresentationAvailableForRequest(new RecordDisplay(representation));
  });

  if (requestableRepresentations.length === 0) {
    return <></>;
  }

  if (requestableRepresentations.length > 1) {
    const scrollToRepresentations = () => {
      const target = document.getElementById('physical_representations');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        const checkbox = target.querySelector('input[type=checkbox]') as HTMLInputElement;
        if (checkbox && !checkbox.checked) {
          checkbox.click();
        }
      }
    };

    return (
      <AppContext.Consumer>
        {(context: IAppContext): React.ReactElement => {
          if (context.user) {
            return (
              <button className="qg-btn btn-secondary"
                      onClick={() => scrollToRepresentations()}>
                <i className="fa fa-copy" aria-hidden="true"/>&nbsp;
                Request digital copy&nbsp;
                <span className="fa fa-chevron-circle-down" aria-hidden="true"/>
              </button>
            );
          } else {
            return (
              <>
                <button className="qg-btn btn-default disabled"
                        onClick={() => scrollToRepresentations()}>
                  <i className="fa fa-copy" aria-hidden="true"/>&nbsp;
                  Request digital copy&nbsp;
                  <span className="fa fa-chevron-circle-down" aria-hidden="true"/>
                </button>
                <div>
                  <small className="text-muted">Log in to access your cart</small>
                </div>
              </>
            );
          }
        }}
      </AppContext.Consumer>
    );
  }

  const itemIdToRequest = requestableRepresentations[0].id;

  return <AddToDigitalCopyRequestCartButton itemId={itemIdToRequest} />;
};

const ReadingRoomRequestAction: React.FC<any> = ({ item }) => {
  const requestableRepresentations: any[] = item.getArray('physical_representations').filter((representation: any) => {
    return isRepresentationAvailableForRequest(new RecordDisplay(representation));
  });

  if (requestableRepresentations.length === 0) {
    return <></>;
  }

  if (requestableRepresentations.length > 1) {
    const scrollToRepresentations = () => {
      const target = document.getElementById('physical_representations');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        const checkbox = target.querySelector('input[type=checkbox]') as HTMLInputElement;
        if (checkbox && !checkbox.checked) {
          checkbox.click();
        }
      }
    };

    return (
      <AppContext.Consumer>
        {(context: IAppContext): React.ReactElement => (
          context.user ?
            <button className="qg-btn btn-primary"
                    onClick={() => scrollToRepresentations()}>
              <i className="fa fa-institution" aria-hidden="true"/>&nbsp;
              Request to view in Reading Room&nbsp;
              <span className="fa fa-chevron-circle-down" aria-hidden="true"/>
            </button> :
            <>
              <button className="qg-btn btn-default disabled"
                      onClick={() => scrollToRepresentations()}>
                <i className="fa fa-institution" aria-hidden="true"/>&nbsp;
                Request to view in Reading Room&nbsp;
                <span className="fa fa-chevron-circle-down" aria-hidden="true"/>
              </button>
              <div>
                <small className="text-muted">Log in to access your
                  cart</small>
              </div>
            </>
        )}
      </AppContext.Consumer>
    );
  }

  const itemIdToRequest = requestableRepresentations[0].id;

  return <AddToReadingRoomRequestCartButton itemId={itemIdToRequest} />;
};

const ItemPage: React.FC<PageRoute> = (route: PageRoute) => {
  const [item, setCurrentItem] = useState<any | null>(null);
  const [notFoundRedirect, setNotFoundRedirect] = useState(false);
  const qsaId: string = route.match.params.qsaId;

  /* FIXME: probably want a definition file of types to QSA prefixes here */
  if (!item) {
    Http.get()
      .fetchByQSAID(qsaId, 'archival_object')
      .then((json: any) => {
        if (json) {
          setCurrentItem(new RecordDisplay(json));
        } else {
          setNotFoundRedirect(true);
        }
      })
      .catch((exception: Error) => {
        console.error(exception);
        setNotFoundRedirect(true);
      });
  }

  if (notFoundRedirect) {
    return <Redirect to="/404" push={true} />;
  } else if (!item) {
    return <Layout skipFooter={true} />;
  } else {
    route.setPageTitle(`Item: ${item.get('title')}`);

    return (
      <Layout aside={<RecordContext qsaId={qsaId} recordType="archival_object" />}>
        <div className="row">
          <div className="col-sm-12">
            <h1>
              {item.get('title')}
              <div>
                <div className="badge">
                  <small>
                    <strong>
                      <i className={iconForType('archival_object')} aria-hidden="true" />
                      &nbsp;{labelForType('archival_object')}
                    </strong>
                  </small>
                </div>
              </div>
            </h1>

            <RequestActions item={item} />

            <section className="core-information">
              <h2 className="sr-only">Basic information</h2>

              <p className="lead">{item.get('description')}</p>

              <ul className="list-group list-group-horizontal-md">
                <li className="list-group-item">
                  <span className="small">ID</span>
                  <br />
                  {item.get('qsa_id_prefixed')}
                </li>
                <li className="list-group-item">
                  <span className="small">START DATE</span>
                  <br />
                  {item.getFirst('dates', (date: any) => {
                    return date.begin && `${date.begin}` + (date.certainty ? `(${date.certainty})` : '');
                  })}
                </li>
                <li className="list-group-item">
                  <span className="small">END DATE</span>
                  <br />
                  {item.getFirst('dates', (date: any) => {
                    return date.end && `${date.end}` + (date.certainty_end ? `(${date.certainty_end})` : '');
                  })}
                </li>
              </ul>

              {item.getFirst('dates', (date: any) => {
                return date.date_notes && <p className="footer small">Date notes: {date.date_notes}</p>;
              })}

              <h3 className="sr-only">Item descriptive metadata</h3>

              <ul className="list-group list-group-flush">
                {item.getMaybe('agency_assigned_id', (value: any) => {
                  return (
                    <li className="list-group-item list-group-item-action">
                      <div className="d-flex w-100 justify-content-between">
                        <h4 className="mb-1">Departmental numbers</h4>
                      </div>
                      <p className="mb-1">{value}</p>
                    </li>
                  );
                })}
                {item.getMaybe('repository_processing_note', (value: any) => {
                  return (
                    <li className="list-group-item list-group-item-action">
                      <div className="d-flex w-100 justify-content-between">
                        <h4 className="mb-1">Previous system identifiers</h4>
                      </div>
                      <p className="mb-1">{value}</p>
                    </li>
                  );
                })}
                {
                  <li className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between">
                      <h4 className="mb-1">Copyright Status</h4>
                    </div>
                    <p className="mb-1">FIXME MISSING FIELD</p>
                  </li>
                }
                {item.getNotes('prefercite', null, (notes: Note[]) => (
                  <li className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between">
                      <h4 className="mb-1">Preferred citations</h4>
                    </div>
                    <div className="mb-1">
                      {notes.map((note: Note, idx: number) => (
                        <NoteDisplay key={idx} note={note} />
                      ))}
                    </div>
                  </li>
                ))}
                {item.getNotes('odd', 'Remarks', (notes: Note[]) => (
                  <li className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between">
                      <h4 className="mb-1">Preferred citations</h4>
                    </div>
                    <div className="mb-1">
                      {notes.map((note: Note, idx: number) => (
                        <NoteDisplay key={idx} note={note} />
                      ))}
                    </div>
                  </li>
                ))}
                {item.getExternalDocuments(['Helpful Resources'], (docs: any) => (
                  <li className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between">
                      <h4 className="mb-1">Helpful Resources</h4>
                    </div>
                    <div className="mb-1">
                      {docs.map((doc: any, idx: number) => (
                        <p><MaybeLink key={idx} location={doc.location} label={doc.location} /></p>
                      ))}
                    </div>
                  </li>
                ))}
                {item.getMaybe('rap_applied', (rap: any) => {
                  return (
                    <li className="list-group-item list-group-item-action">
                      <div className="d-flex w-100 justify-content-between">
                        <h4 className="mb-1">Access notifications</h4>
                      </div>
                      <div className="mb-1">
                        <p>{rap.display_string}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="qg-accordion qg-dark-accordion" aria-label="Item Details">
              <h2 id="accordion">Item details</h2>

              {/*<input type="radio" name="control" id="collapse" className="controls collapse" value="collapse" role="radio"/>*/}
              {/*<label htmlFor="collapse" className="controls">Collapse details</label>*/}
              {/*<span className="controls">&#124;</span>*/}
              {/*<input type="radio" name="control" id="expand" className="controls expand" value="expand" role="radio"/>*/}
              {/*<label htmlFor="expand" className="controls">Show details</label>*/}

              {item.getArray('physical_representations').length > 0 && (
                <AccordionPanel
                  id={item.generateId()}
                  anchor="physical_representations"
                  title="Physical representations"
                  children={
                    <ul className="list-group list-group-flush">
                      {item.getArray('physical_representations').map((representation: any) => (
                        <li key={representation.qsa_id} className="list-group-item">
                          <PhysicalRepresentation representation={representation} item={item} context={route.context} />
                        </li>
                      ))}
                    </ul>
                  }
                />
              )}

              {item.getArray('digital_representations').length > 0 && (
                <AccordionPanel
                  id={item.generateId()}
                  anchor="digital_representations"
                  title="Digital representations"
                  children={
                    <ul className="list-group list-group-flush">
                      {item.getArray('digital_representations').map((representation: any) => (
                        <li key={representation.qsa_id} className="list-group-item">
                          <DigitalRepresentation representation={representation} item={item} context={route.context} />
                        </li>
                      ))}
                    </ul>
                  }
                />
              )}
            </section>

            {item.getArray('agent_relationships').length > 0 && (
              <section>
                <h2>Relationships</h2>

                {item.getArray('agent_relationships').length > 0 && <h3>Related agencies</h3>}
                <ul className="list-group list-group-flush">
                  {item.getArray('agent_relationships').map((rlshp: any, idx: number) => {
                    return (
                      <li key={idx} className="list-group-item">
                        {<Relationship relationship={rlshp} />}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <Tagger recordId={item.get('id')} context={route.context}/>
          </div>
        </div>
      </Layout>
    );
  }
};

export default ItemPage;
