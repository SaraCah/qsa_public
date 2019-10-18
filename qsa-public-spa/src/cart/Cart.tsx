import React, { useState } from 'react';
import AppContext from '../context/AppContext';
import { Link } from 'react-router-dom';
import { uriFor } from '../utils/typeResolver';
import Layout from '../recordViews/Layout';
import { Http } from '../utils/http';

const Cart: React.FC = () => {
  return (
    <div id="minicart" className="qg-aside minicart" role="complementary">
      <div className="inner">
        <div id="ssq-minicart" className="placeholder">
          <h2>Cart</h2>
          <div id="ssq-minicart-view">
            <noscript>
              <p className="ssq-minicart-noscript">Edit cart or checkout to place your order.</p>
              <div className="ssq-minicart-submit">
                <input type="hidden" id="ssq-cart-contents" name="ssq-cart-contents" value="" />
                <img
                  src="https://www.smartservice.qld.gov.au/payment/minicart/synchronise?cartId=(cartId)"
                  id="ssq-synch-img"
                  height="0"
                  width="0"
                  alt=""
                />
                <a href="https://www.smartservice.qld.gov.au/payment/cart/checkout" id="ssq-cart-checkout">
                  <img
                    id="ssq_minicart_checkout"
                    src="https://www.smartservice.qld.gov.au/payment/minicart/btn-checkout.png"
                    alt="Checkout"
                  />
                </a>
                <a href="https://www.smartservice.qld.gov.au/payment/cart/view" id="ssq-cart-edit">
                  <img
                    id="ssq_minicart_cart"
                    src="https://www.smartservice.qld.gov.au/payment/minicart/btn-cart.png"
                    alt="Edit cart"
                  />
                </a>
              </div>
            </noscript>
          </div>
          <div className="ssq-minicart-cards">
            <h3>Cards accepted</h3>
            <ul>
              <li>
                <img src="https://www.smartservice.qld.gov.au/payment/minicart/visa.png" alt="Visa" />
              </li>
              <li>
                <img src="https://www.smartservice.qld.gov.au/payment/minicart/mastercard.png" alt="MasterCard" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CartSummary: React.FC<any> = ({ cart }) => {
  return (
    <>
      <small className="cart-summary">
        <Link to="/reading-room-requests-cart" className="qg-btn btn-xs btn-default" title="Pending Reading Room Requests">
          <span className="fa fa-institution" aria-hidden="true" />
          &nbsp;
          {cart && cart.reading_room_requests.total_count}
        </Link>
      </small>
      <small className="cart-summary">
        <Link to="/digital-copies-cart" className="qg-btn btn-xs btn-default" title="Pending Digital Copy Requests">
          <span className="fa fa-copy" aria-hidden="true" />
          &nbsp;
          {cart && cart.digital_copy_requests.total_count}
        </Link>
      </small>
    </>
  );
};

export const MyReadingRoomRequestsCartPage: React.FC<any> = () => {
  const [requiredDate, setRequiredDate] = useState('');
  const [showReadingRoomSuccess, setShowReadingRoomSuccess] = useState(false);
  const [agencyFields, setAgencyFields]: [any, any] = useState({});

  const removeItem = (id: number, context: any): void => {
    Http.get()
      .removeFromCart(id)
      .then(() => {
        context.refreshCart();
      })
      .catch((exception: Error) => {
        console.error(exception);
      });
  };

  const handleSubmit = (event: any, context: any): void => {
    event.preventDefault();
    setShowReadingRoomSuccess(false);
    Http.get()
      .submitReadingRoomRequests(requiredDate, agencyFields)
      .then(() => {
        context.refreshCart();
        setShowReadingRoomSuccess(true);
      })
      .catch((exception: Error) => {
        console.error(exception);
      });
  };

  return (
    <AppContext.Consumer>
      {(context: any): React.ReactElement => (
        <>
          {!context.sessionLoaded && <Layout footer={false} />}
          {context.sessionLoaded && (
            <Layout>
              <form onSubmit={e => handleSubmit(e, context)}>
                <div className="row">
                  <div className="col-sm-12">
                    <h1>Submit Your Reading Room Requests</h1>
                    {showReadingRoomSuccess && (
                      <div className="alert alert-success">
                        Reading room requests created! View them at <Link to="/my-requests">My requests</Link>.
                      </div>
                    )}
                    {!context.user && <div className="alert alert-warning">Please login to access your cart</div>}
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
                                  Looks like you are planning to visit the reading room. You&apos;ll need to nominate a
                                  day to visit:
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
                                    required
                                  />
                                  {requiredDate && new Date(requiredDate) <= new Date() && (
                                    <small className="text-danger">Date required must be in the future</small>
                                  )}
                                </div>
                              </div>
                              {context.cart.reading_room_requests.open_records.map((cartItem: any) => (
                                <div key={cartItem.id}>
                                  <div className="mb-2 qg-grab" role="listitem">
                                    <div className="d-flex w-100 justify-content-between">
                                      <h2>
                                        <Link to={uriFor(cartItem.record.parent_qsa_id, 'archival_object')}>
                                          {cartItem.record.qsa_id_prefixed}: {cartItem.record.display_string}
                                        </Link>
                                      </h2>
                                      <span className="badge">Open record</span>
                                    </div>
                                    <dl className="row">
                                      <dt className="col-xs-6">Item type</dt>
                                      <dd className="col-xs-6">Physical representation</dd>
                                      <dt className="col-xs-6">Parent item</dt>
                                      <dd className="col-xs-6">
                                        <Link to={uriFor(cartItem.record.parent_qsa_id, 'archival_object')}>
                                          {cartItem.record.parent_qsa_id} {cartItem.record.display_string}
                                        </Link>
                                      </dd>
                                      <dt className="col-xs-6">Delivery location</dt>
                                      <dd className="col-xs-6">Reading room</dd>
                                      <dt className="col-xs-6">Cost</dt>
                                      <dd className="col-xs-6">Free</dd>
                                    </dl>
                                    <h3 className="sr-only">Actions</h3>
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
                                    <div key={cartItem.id} role="list-item" style={{ marginBottom: 40 }}>
                                      <div className="pull-right">
                                        <span className="badge pull-right">Closed record</span>
                                      </div>
                                      <h4>
                                        <Link to={uriFor(cartItem.record.parent_qsa_id, 'archival_object')}>
                                          {cartItem.record.parent_qsa_id} {cartItem.record.display_string}
                                        </Link>
                                      </h4>
                                      <dl className="row" style={{ marginBottom: 0 }}>
                                        <dt className="col-xs-6">Item type</dt>
                                        <dd className="col-xs-6">Physical representation</dd>
                                        <dt className="col-xs-6">Parent item</dt>
                                        <dd className="col-xs-6">
                                          <Link to={uriFor(cartItem.record.parent_qsa_id, 'archival_object')}>
                                            {cartItem.record.parent_qsa_id} {cartItem.record.display_string}
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
                                className="qg-btn btn-secondary"
                                onClick={e => {
                                  e.preventDefault();
                                  Http.get()
                                    .clearCart('READING_ROOM')
                                    .then(() => context.refreshCart());
                                }}
                              >
                                Clear cart
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
      )}
    </AppContext.Consumer>
  );
};
export const MyDigitalCopyRequestsCartPage: React.FC<any> = () => {
  return (
      <AppContext.Consumer>
        {(context: any): React.ReactElement => (
            <Layout>
              <h1>TODO</h1>
            </Layout>
        )}
      </AppContext.Consumer>
  );
};

export default Cart;
