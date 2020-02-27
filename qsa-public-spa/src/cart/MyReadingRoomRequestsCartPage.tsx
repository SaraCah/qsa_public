import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import {labelForType, uriFor} from '../utils/typeResolver';
import Layout from '../recordViews/Layout';
import { Http } from '../utils/http';
import { IAppContext } from '../context/AppContext';
import { PageRoute } from '../models/PageRoute';
import {toISODateString} from "../utils/rendering";


export const MyReadingRoomRequestsCartPage: React.FC<PageRoute> = (route: PageRoute) => {
  const context = route.context;

  const [requiredDate, setRequiredDate] = useState(toISODateString(new Date()));
  const [requiredTime, setRequiredTime] = useState('Morning');
  const [showReadingRoomSuccess, setShowReadingRoomSuccess] = useState(false);
  const [agencyFields, setAgencyFields]: [any, any] = useState({});
  const [requiredDateInPast, setRequiredDateInPast]: [boolean, any] = useState(false);
  const [accessTermsAccepted, setAccessTermsAccepted] = useState(false);
  const [privacyTermsAccepted, setPrivacyTermsAccepted] = useState(false);

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

  const reorderItem = (item: any, currentIndex: number, targetIndex: number): void => {
    Http.get()
        .reorderOpenRequests(item.id, currentIndex, targetIndex)
        .then(() => {
          context.refreshCart();
        });
  };

  const enableSubmit = function() {
    if (Object.keys(context.cart.reading_room_requests.closed_records).length > 0) {
      return accessTermsAccepted && privacyTermsAccepted;
    } else {
      return true;
    }
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
                    <p>Your Reading Room requests have been submitted.</p>
                    <p><Link to="/my-requests">See your request history here</Link>.</p>
                  </div>
                )}
                {!context.user && <div className="alert alert-warning">Please log in to access your cart</div>}
                {context.user && context.cart && context.cart.reading_room_requests.total_count === 0 && !showReadingRoomSuccess && (
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
                              Getting ready for the Reading Room
                            </h2>
                            <p>
                              Reading Room delivery.
                            </p>
                            <p>
                              If you&#39;re ordering for a visit in the future, please nominate the day of your visit:
                            </p>
                            <div className="form-group">
                              <label className="sr-only" htmlFor="date-required">
                                Date required
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                id="date-required"
                                placeholder="yyyy-mm-dd"
                                style={{ position: 'relative', opacity: 1, zIndex: 'initial' }}
                                onChange={e => setRequiredDate(e.target.value)}
                                value={requiredDate}
                                required
                              />
                              {requiredDateInPast && (
                                  <div><small className="alert alert-warning">Date provided is in the past</small></div>
                              )}
                              <div><small>QSA is open from 9am to 4.30pm Monday to Friday and the second Saturday of each month, closed Public Holidays</small></div>
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
                          {context.cart.reading_room_requests.open_records.map((cartItem: any, idx: number) => (
                            <div key={cartItem.id}>
                              <div className="mb-2 qg-grab" role="listitem">
                                <div className="pull-right">
                                  {
                                    idx > 0 &&
                                    <div>
                                      <button title="Move this item up the list"
                                              className="qg-btn btn-secondary btn-xs"
                                              onClick={e => { e.preventDefault(); reorderItem(cartItem, idx, idx - 1) }}>
                                        <i className="fa fa-arrow-up" aria-hidden={true}/> Priority
                                      </button>
                                    </div>
                                  }
                                  {
                                    idx < context.cart.reading_room_requests.open_records.length - 1 &&
                                    <div>
                                      <button title="Move this item down the list"
                                              className="qg-btn btn-secondary btn-xs"
                                              onClick={e => { e.preventDefault(); reorderItem(cartItem, idx, idx + 1) }}>
                                        <i className="fa fa-arrow-down" aria-hidden={true}/> Priority
                                      </button>
                                    </div>
                                  }
                                  <div>
                                    <span className="badge">Open record</span>
                                  </div>
                                </div>
                                <div>
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
                                  <dd className="col-xs-6">Reading Room</dd>
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
                      {
                        Object.keys(context.cart.reading_room_requests.closed_records).length > 0 &&
                        Object.keys(context.cart.reading_room_requests.closed_records).length > 0 &&
                        <hr/>
                      }
                      {Object.keys(context.cart.reading_room_requests.closed_records).length > 0 && (
                        <article>
                          <h2>Restricted Records</h2>
                          <div className="alert alert-warning" role="alert">
                            <h3>
                              <i className="fa fa-comments" />
                              &nbsp;
                              Requesting restricted access records
                            </h3>
                            <p>
                              Some records at Queensland State Archives are subject to a restricted access period, however you may apply to the responsible agency for permission to view and copy these restricted records. Access is granted at the discretion of the responsible agency and some agencies may ask you to provide additional information before making a decision.
                            </p>
                            <p>
                              If access is granted you will be notified on an 'Access to restricted records' permission form. Please contact Queensland State Archives to confirm that we have also received a copy of this permission form prior to visiting.
                            </p>
                          </div>
                          <div className="alert alert-info">
                            <h3>User Details</h3>
                            <p>Please confirm your contact and postal details:</p>
                            <div className="mb-2 qg-grab">
                              <dl className="row">
                                <dt className="col-xs-6">Name</dt>
                                <dd className="col-xs-6">{context.user.first_name} {context.user.last_name}</dd>
                                <dt className="col-xs-6">Email</dt>
                                <dd className="col-xs-6">{context.user.email}</dd>
                                <dt className="col-xs-6">Postal address</dt>
                                <dd className="col-xs-6">
                                  {
                                    context.user.street_address &&
                                    <div>{context.user.street_address}</div>
                                  }
                                  <div>
                                  {
                                     [context.user.city_suburb, context.user.state, context.user.post_code].filter((s: any) => {
                                      return typeof(s) === 'string' && s.length > 0;
                                     }).join(', ')
                                  }
                                  </div>
                                </dd>
                                <dt className="col-xs-6">Telephone</dt>
                                <dd className="col-xs-6">{context.user.phone}</dd>
                              </dl>
                            </div>
                            <p>If these details are not correct, <Link to="/my-details">please update them here</Link>.</p>
                          </div>
                          {Object.keys(context.cart.reading_room_requests.closed_records).map((agency_uri: string) => (
                            <div className="mb-2 qg-grab" role="listitem" key={agency_uri}>
                              <div className="d-flex w-100 justify-content-between">
                                <h3>Agency Access Request</h3>
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
                                <dd className="col-xs-6">Reading Room</dd>
                              </dl>
                              <hr />
                              <h3>Requested items:</h3>
                              {context.cart.reading_room_requests.closed_records[agency_uri].map((cartItem: any) => (
                                <div key={cartItem.id} role="listitem" style={{ marginBottom: 40 }}>
                                  <div className="pull-right">
                                    <span className="badge pull-right">Restricted record</span>
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
                                        {cartItem.record.controlling_record.qsa_id_prefixed} {cartItem.record.controlling_record._resolved.display_string}
                                      </Link>
                                    </dd>
                                    <dt className="col-xs-6">Series</dt>
                                    <dd className="col-xs-6">
                                      <Link to={uriFor(cartItem.record.controlling_record._resolved.resource.qsa_id_prefixed, 'resource')}>
                                        {cartItem.record.controlling_record._resolved.resource.qsa_id_prefixed} {cartItem.record.controlling_record._resolved.resource.display_string}
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
                                  <label htmlFor={`permission_to_copy-${agency_uri}`}>
                                    <input type="checkbox"
                                           id={`permission_to_copy-${agency_uri}`}
                                           onChange={e => {
                                             const newValues: any = {};
                                             newValues[agency_uri] = { ...agencyFields[agency_uri] };
                                             newValues[agency_uri]['permission_to_copy'] = e.target.checked;
                                             setAgencyFields(Object.assign({}, agencyFields, newValues));
                                           }}/>
                                    Request permission to copy
                                  </label>
                                </div>
                              </div>
                              <div className="form-row">
                                <div className="form-group col-xs-12 col-md-12">
                                  <label htmlFor={`request-purpose-${agency_uri}`}>
                                    Reason for request:
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
                            </div>
                          ))}
                          <div className="alert alert-info">
                            <p>
                              <label>
                                <input type="checkbox"
                                       checked={accessTermsAccepted}
                                       onChange={(e) => setAccessTermsAccepted(e.target.checked)}
                                       required />
                                &nbsp;
                                I have read and understand the <Link to="/pages/access-to-restricted-records-faq" target="_blank">Access to Restricted Records FAQs</Link>.
                              </label>
                            </p>
                            <p>
                              <label>
                                <input type="checkbox"
                                       checked={privacyTermsAccepted}
                                       onChange={(e) => setPrivacyTermsAccepted(e.target.checked)}
                                       required />
                                &nbsp;
                                The personal information collected on this form is for the purpose of facilitating an application for permission to access a restricted record. The Queensland Government manages and protects your personal information in line with the Information Privacy Act 2009. We will not disclose your personal information to any other third parties or use it for another purpose without your consent, unless authorised or required by law. I agree to Queensland State Archives providing these details to the agency or agencies responsible for the identified records.
                              </label>
                            </p>
                          </div>
                        </article>
                      )}
                      <div className="mt-5">
                        <p>
                          <button type="submit"
                                  className="qg-btn btn-primary"
                                  disabled={!enableSubmit()}>
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
