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
    <small className="cart-summary">
      <Link to="/my-cart" className="qg-btn btn-xs btn-default">
        <span className="fa fa-shopping-cart" />
        &nbsp;
        {cart && cart.length}
      </Link>
    </small>
  );
};

export const MyCartPage: React.FC<any> = () => {
  const [requiredDate, setRequiredDate] = useState('');
  const [showReadingRoomSuccess, setShowReadingRoomSuccess] = useState(false);

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

  const submitReadingRoomRequests = (context: any): void => {
    setShowReadingRoomSuccess(false);
    Http.get()
      .submitReadingRoomRequests(requiredDate)
      .then(() => {
        context.refreshCart();
        setShowReadingRoomSuccess(true);
      })
      .catch((exception: Error) => {
        console.error(exception);
      });
  };

  const filterReadingRoomRequests = (cart: any[]): any[] => {
    return cart.filter((cartItem: any) => {
      return cartItem.record.rap_access_status === 'Open Access';
    });
  };

  const filterClosedItemRequests = (cart: any[]): any[] => {
    return cart.filter((cartItem: any) => {
      return cartItem.record.rap_access_status === 'Restricted Access';
    });
  };

  const proceedToClosedRecordRequests = (context: any): void => {
    console.log(context);
    setShowReadingRoomSuccess(false);
    alert('TODO');
  };

  return (
    <AppContext.Consumer>
      {(context: any): React.ReactElement => (
        <>
          {!context.sessionLoaded && <Layout footer={false} />}
          {context.sessionLoaded && (
            <Layout>
              <div className="row">
                <div className="col-sm-12">
                  <h1>My Cart</h1>
                  {showReadingRoomSuccess && (
                      <div className="alert alert-success">
                        Reading room requests created! View them at <Link to="/my-requests">My requests</Link>.
                      </div>
                  )}
                  {!context.user && <div className="alert alert-warning">Please login to access your cart</div>}
                  {context.user && context.cart.length === 0 && <div className="alert alert-info">Cart empty</div>}
                  {context.user && context.cart.length > 0 && (
                    <>
                      <section className="qg-accordion qg-dark-accordion" aria-label="All Requests">
                        {filterReadingRoomRequests(context.cart).length > 0 && (
                          <article>
                            <input
                              id="panel-1"
                              type="checkbox"
                              name="tabs"
                              aria-controls="id-panel-content-1"
                              aria-expanded="false"
                              role="checkbox"
                            />
                            <h3 className="acc-heading">
                              <label htmlFor="panel-1">
                                Reading room requests&nbsp;
                                <span className="badge badge-primary">
                                  {filterReadingRoomRequests(context.cart).length}
                                </span>
                                <span className="arrow">
                                  <i />
                                </span>
                              </label>
                            </h3>
                            <div className="collapsing-section" aria-hidden="true" id="id-panel-content-1">
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
                                  />
                                  {requiredDate && new Date(requiredDate) <= new Date() && (
                                    <small className="text-danger">Date required must be in the future</small>
                                  )}
                                </div>
                              </div>

                              {filterReadingRoomRequests(context.cart).map((cartItem: any) => (
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
                                        onClick={() => removeItem(cartItem.id, context)}
                                      >
                                        <i className="fa fa-trash" aria-hidden="true" />
                                        &nbsp; Remove item
                                      </button>
                                    </div>
                                  </div>
                                  <div className="clearfix" />
                                </div>
                              ))}
                              <p>
                                <button
                                  className="qg-btn btn-primary"
                                  onClick={e => submitReadingRoomRequests(context)}
                                >
                                  Submit reading room requests
                                </button>
                              </p>
                            </div>
                          </article>
                        )}
                        {filterClosedItemRequests(context.cart).length > 0 && (
                          <article>
                            <input
                              id="panel-3"
                              type="checkbox"
                              name="tabs"
                              aria-controls="id-panel-content-3"
                              aria-expanded="false"
                              role="checkbox"
                            />
                            <h3 className="acc-heading">
                              <label htmlFor="panel-3">
                                Requests for closed data&nbsp;
                                <span className="badge badge-primary">
                                  {filterClosedItemRequests(context.cart).length}
                                </span>
                                <span className="arrow">
                                  {' '}
                                  <i />
                                </span>
                              </label>
                            </h3>
                            <div className="collapsing-section" aria-hidden="true" id="id-panel-content-3">
                              <div className="alert alert-warning" role="alert">
                                <h2>
                                  <i className="fa fa-comments" />
                                  Requesting restricted access records
                                </h2>
                                <p>
                                  You currently have restricted access records in your cart. When you checkout you will
                                  have the opportunity to complete a webform to request access to these records from the
                                  responsible agency. Queensland State Archives cannot guarantee access will be granted
                                  to the records.
                                </p>
                              </div>
                              {filterClosedItemRequests(context.cart).map((cartItem: any) => (
                                <div key={cartItem.id}>
                                  <div className="mb-2 qg-grab" role="listitem">
                                    <div className="d-flex w-100 justify-content-between">
                                      <h2>
                                        <Link to={uriFor(cartItem.record.parent_qsa_id, 'archival_object')}>
                                          {cartItem.record.qsa_id_prefixed}: {cartItem.record.display_string}
                                        </Link>
                                      </h2>
                                      <span className="badge">Closed record</span>
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
                                      <dd className="col-xs-6">Confirm access with agency</dd>
                                      <dt className="col-xs-6">Cost</dt>
                                      <dd className="col-xs-6">Free</dd>
                                    </dl>
                                    <h3 className="sr-only">Actions</h3>
                                    <div className="btn-group">
                                      <a className="qg-btn btn-default btn-xs" href="#">
                                        <i className="fa fa-trash" aria-hidden="true" /> Remove item
                                      </a>
                                    </div>
                                  </div>
                                  <div className="clearfix" />
                                </div>
                              ))}
                              <p>
                                <button
                                  className="qg-btn btn-primary"
                                  onClick={e => proceedToClosedRecordRequests(context)}
                                >
                                  Submit closed record requests...
                                </button>
                              </p>
                            </div>
                          </article>
                        )}
                        <div className="mt-5">
                          <button
                            type="submit"
                            className="qg-btn btn-secondary"
                            onClick={e => Http.get().clearCart().then(() => context.refreshCart())}
                          >
                            Clear cart
                          </button>
                        </div>
                      </section>
                    </>
                  )}
                </div>
              </div>
            </Layout>
          )}
        </>
      )}
    </AppContext.Consumer>
  );
};

export default Cart;
