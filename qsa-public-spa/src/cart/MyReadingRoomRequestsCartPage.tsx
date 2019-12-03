import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import {labelForType, uriFor} from '../utils/typeResolver';
import Layout from '../recordViews/Layout';
import { Http } from '../utils/http';
import { IAppContext } from '../context/AppContext';
import { PageRoute } from '../models/PageRoute';


export const MyReadingRoomRequestsCartPage: React.FC<PageRoute> = (route: PageRoute) => {
  const context = route.context;

  const [requiredDate, setRequiredDate] = useState(new Date().toISOString().split('T')[0]);
  const [requiredTime, setRequiredTime] = useState('Morning');
  const [showReadingRoomSuccess, setShowReadingRoomSuccess] = useState(false);
  const [agencyFields, setAgencyFields]: [any, any] = useState({});
  const [requiredDateInPast, setRequiredDateInPast]: [boolean, any] = useState(false);

  const removeItem = (id: number, context: IAppContext): void => {
    Http.get()
      .removeFromCart(id)
      .then(() => {
        context.refreshCart();
      })
      .catch((exception: Error) => {
        console.error(exception);
      });
  };

  const handleSubmit = (event: any, context: IAppContext): void => {
    event.preventDefault();
    setShowReadingRoomSuccess(false);
    Http.get()
      .submitReadingRoomRequests(requiredDate, requiredTime, agencyFields)
      .then(() => {
        window.scrollTo(0,0);
        context.refreshCart();
        setShowReadingRoomSuccess(true);
      })
      .catch((exception: Error) => {
        console.error(exception);
      });
  };

  useEffect(() => {
    if (requiredDate && new Date(requiredDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)) {
      setRequiredDateInPast(true);
    } else {
      setRequiredDateInPast(false);
    }
  }, [requiredDate]);

  return (
    <>
      {!context.sessionLoaded && <Layout noindex={true} skipFooter={true} />}
      {context.sessionLoaded && (
        <Layout noindex={true}>
          <form onSubmit={e => handleSubmit(e, context)}>
            <div className="row">
              <div className="col-sm-12">
                <h1>
                  <i className="fa fa-institution" aria-hidden="true"/>&nbsp;
        Submit Your Reading Room Requests
                </h1>
                {showReadingRoomSuccess && (
                  <div className="alert alert-success">
                    Reading room requests created! View them at <Link to="/my-requests">My requests</Link>.
                  </div>
                )}
                {!context.user && <div className="alert alert-warning">Please log in to access your cart</div>}
                {context.user && context.cart && context.cart.reading_room_requests.total_count === 0 && (
                  <div className="alert alert-info">Cart empty</div>
                )}
                {context.user && context.cart && context.cart.reading_room_requests.total_count > 0 && (
                  <>
                    <section>
                      {context.cart.reading_room_requests.open_records.length > 0 && (
                        <article>
                          <h2>Open Records</h2>
                          <div className="alert alert-success" role="alert">
                            <h2>
                              <i className="fa fa-check" />
                              Getting ready for the reading room
                            </h2>
                            <p>
                              Reading Room delivery / If you&#39;re ordering for a visit in the future, please
                              nominate the day of your visit:
                            </p>
                            <div className="form-group">
                              <label className="sr-only" htmlFor="date-required">
                                Date required
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                id="date-required"
                                style={{ position: 'relative', opacity: 1, zIndex: 'initial' }}
                                onChange={e => setRequiredDate(e.target.value)}
                                value={requiredDate}
                                required
                              />
                              {requiredDateInPast && (
                                  <div><small className="alert alert-warning">Date provided is in the past</small></div>
                              )}
                              <div><small>QSA is open from 9.00am to 4.30pm Monday to Friday and the second Saturday of every month</small></div>
                            </div>
                            <div className="form-group">
                              <label className="sr-only" htmlFor="time-required">
                                Time of day required
                              </label>
                              <select
                                  className="form-control"
                                  id="time-required"
                                  onChange={e => setRequiredTime(e.target.value)}
                                  required
                              >
                                <option>Morning</option>
                                <option>Afternoon</option>
                              </select>
                            </div>
                          </div>
                          {context.cart.reading_room_requests.open_records.map((cartItem: any) => (
                            <div key={cartItem.id}>
                              <div className="mb-2 qg-grab" role="listitem">
                                <div className="pull-right">
                                  <span className="badge pull-right">Open record</span>
                                </div>
                                <div className="d-flex w-100 justify-content-between">
                                  <h3>
                                    <Link to={uriFor(cartItem.record.controlling_record.qsa_id_prefixed, 'archival_object')}>
                                      {cartItem.record.title}
                                    </Link>
                                  </h3>
                                </div>
                                <dl className="row">
                                  <dt className="col-xs-6">Item ID</dt>
                                  <dd className="col-xs-6">
                                    <Link to={uriFor(cartItem.record.controlling_record.qsa_id_prefixed, 'archival_object')}>
                                      {cartItem.record.qsa_id_prefixed}
                                    </Link>
                                  </dd>
                                  <dt className="col-xs-6">Item type</dt>
                                  <dd className="col-xs-6">{labelForType(cartItem.record.jsonmodel_type)}</dd>
                                  <dt className="col-xs-6">Item format</dt>
                                  <dd className="col-xs-6">{cartItem.record.format}</dd>
                                  <dt className="col-xs-6">Parent ID</dt>
                                  <dd className="col-xs-6">
                                    <Link to={uriFor(cartItem.record.controlling_record.qsa_id_prefixed, 'archival_object')}>
                                      {cartItem.record.controlling_record.qsa_id_prefixed}
                                    </Link>
                                  </dd>
                                  <dt className="col-xs-6">Parent title</dt>
                                  <dd className="col-xs-6">
                                    <Link to={uriFor(cartItem.record.controlling_record.qsa_id_prefixed, 'archival_object')}>
                                      {cartItem.record.controlling_record._resolved.display_string}
                                    </Link>
                                  </dd>
                                  <dt className="col-xs-6">Delivery location</dt>
                                  <dd className="col-xs-6">Reading room</dd>
                                </dl>
                                <h4 className="sr-only">Actions</h4>
                                <div className="btn-group">
                                  <button
                                    className="qg-btn btn-default btn-xs"
                                    onClick={e => {
                                      e.preventDefault();
                                      removeItem(cartItem.id, context);
                                    }}
                                  >
                                    <i className="fa fa-trash" aria-hidden="true" />
                              &nbsp; Remove item
                                  </button>
                                </div>
                              </div>
                              <div className="clearfix" />
                            </div>
                          ))}
                        </article>
                      )}
                      {Object.keys(context.cart.reading_room_requests.closed_records).length > 0 && (
                        <article>
                          <h2>Closed Records</h2>
                          <div className="alert alert-warning" role="alert">
                            <h2>
                              <i className="fa fa-comments" />
                              Requesting restricted access records
                            </h2>
                            <p>
                              You have requested some restricted access records. Please provide some details
                              regarding your request and access will be requested from the responsible agency.
                              Queensland State Archives cannot guarantee access will be granted to the records.
                            </p>
                          </div>
                          {Object.keys(context.cart.reading_room_requests.closed_records).map((agency_uri: string) => (
                            <div className="mb-2 qg-grab" role="listitem" key={agency_uri}>
                              <div className="d-flex w-100 justify-content-between">
                                <h2>Agency Access Request</h2>
                              </div>
                              <dl className="row">
                                <dt className="col-xs-6">Agency</dt>
                                <dd className="col-xs-6">
                                  <Link
                                    to={uriFor(
                                      context.cart.reading_room_requests.agencies[agency_uri].qsa_id_prefixed,
                                      'agent_corporate_entity'
                                    )}
                                  >
                                    {context.cart.reading_room_requests.agencies[agency_uri].qsa_id_prefixed}{' '}
                                    {context.cart.reading_room_requests.agencies[agency_uri].display_string}
                                  </Link>
                                </dd>
                                <dt className="col-xs-6">Delivery location</dt>
                                <dd className="col-xs-6">Reading room</dd>
                                <dt className="col-xs-6">Cost</dt>
                                <dd className="col-xs-6">Free</dd>
                              </dl>
                              <hr />
                              <h3>Requested items:</h3>
                              {context.cart.reading_room_requests.closed_records[agency_uri].map((cartItem: any) => (
                                <div key={cartItem.id} role="listitem" style={{ marginBottom: 40 }}>
                                  <div className="pull-right">
                                    <span className="badge pull-right">Closed record</span>
                                  </div>
                                  <h3>
                                    <Link to={uriFor(cartItem.record.controlling_record.qsa_id_prefixed, 'archival_object')}>
                                      {cartItem.record.qsa_id_prefixed} {cartItem.record.display_string}
                                    </Link>
                                  </h3>
                                  <dl className="row" style={{ marginBottom: 0 }}>
                                    <dt className="col-xs-6">Item type</dt>
                                    <dd className="col-xs-6">{labelForType(cartItem.record.jsonmodel_type)}</dd>
                                    <dt className="col-xs-6">Parent item</dt>
                                    <dd className="col-xs-6">
                                      <Link to={uriFor(cartItem.record.controlling_record.qsa_id_prefixed, 'archival_object')}>
                                        {cartItem.record.controlling_record.qsa_id_prefixed}
                                      </Link>
                                    </dd>
                                  </dl>
                                  <p>
                                    <button
                                      className="qg-btn btn-default btn-xs"
                                      onClick={e => {
                                        e.preventDefault();
                                        removeItem(cartItem.id, context);
                                      }}
                                    >
                                      <i className="fa fa-trash" aria-hidden="true" />
                                  &nbsp; Remove item
                                    </button>
                                  </p>
                                </div>
                              ))}
                              <hr />
                              <div className="form-row">
                                <div className="form-group col-xs-12 col-md-12">
                                  <label htmlFor={`request-purpose-${agency_uri}`}>
                                    Purpose of request and why you need this information
                                  </label>
                                  <textarea
                                    className="form-control col-xs-12"
                                    id={`request-purpose-${agency_uri}`}
                                    rows={5}
                                    required
                                    onChange={e => {
                                      const newValues: any = {};
                                      newValues[agency_uri] = { ...agencyFields[agency_uri] };
                                      newValues[agency_uri]['purpose'] = e.target.value;
                                      setAgencyFields(Object.assign({}, agencyFields, newValues));
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="form-row">
                                <div className="form-group col-xs-12 col-md-12">
                                  <label htmlFor={`intention-to-publish-${agency_uri}`}>
                                    Any intention to publish, and details of this publication
                                  </label>
                                  <textarea
                                    className="form-control col-xs-12"
                                    id={`intention-to-publish-${agency_uri}`}
                                    rows={3}
                                    required
                                    onChange={e => {
                                      const newValues: any = {};
                                      newValues[agency_uri] = { ...agencyFields[agency_uri] };
                                      newValues[agency_uri]['publication_details'] = e.target.value;
                                      setAgencyFields(Object.assign({}, agencyFields, newValues));
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </article>
                      )}
                      <div className="mt-5">
                        <p>
                          <button type="submit" className="qg-btn btn-primary">
                            Submit Requests
                          </button>
                    &nbsp;&nbsp;
                  <button
                    className="qg-btn btn-default"
                    onClick={e => {
                      e.preventDefault();
                      Http.get()
                          .clearCart('READING_ROOM')
                          .then(() => context.refreshCart());
                    }}
                  >
                    Clear Requests
                  </button>
                        </p>
                      </div>
                    </section>
                  </>
                )}
              </div>
            </div>
          </form>
        </Layout>
      )}
    </>
  );
};
