import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import { uriFor } from '../utils/typeResolver';
import Layout from '../recordViews/Layout';
import { Http } from '../utils/http';
import { IAppContext } from '../context/AppContext';

export const DigitalCopyRequestQuotePage: React.FC<any> = (route: any) => {
  const context = route.context;

  const [cart, setCart]: [any, any] = useState(null);
  const [completed, setCompleted]: [any, any] = useState(false);
  const [dirtyCart, setDirtyCart]: [any, any] = useState(false);
  const [cartNeedsRefresh, setCartNeedsRefresh]: [any, any] = useState(true);

  const updateCartItem = (context: IAppContext, cartItemId: number, field: string, value: string) => {
    const options: any = {};
    options[field] = value;

    setCart(
      Object.assign({}, cart, {
        digital_copy_requests: Object.assign({}, cart.digital_copy_requests, {
          quotable_records: cart.digital_copy_requests.quotable_records.map((cartItem: any) => {
            if (cartItem.id === cartItemId) {
              return Object.assign({}, cartItem, {
                options: Object.assign({}, cartItem.options, {
                  [field]: value
                })
              });
            } else {
              return cartItem;
            }
          })
        })
      })
    );

    setDirtyCart(true);
  };

  const updateQuotableItems = () => {
    Http.get()
      .updateCartItems(cart.digital_copy_requests.quotable_records, 'DIGITAL_COPY')
      .then(() => {
        cart.refreshCart().then(() => {
          setCartNeedsRefresh(true);
          setDirtyCart(false);
        });
      })
      .catch((exception: Error) => {
        console.error(exception);
      })
  };

  if (completed) {
    return <Redirect
             to={{
               pathname: "/digital-copies-cart",
               state: {
                 flash: "Quote request sent"
               }
             }}
             push={true} />
  }

  if (cartNeedsRefresh && context.user) {
    if (context.cart) {
      setCartNeedsRefresh(false);
      setCart(Object.assign({}, context.cart, { refreshCart: context.refreshCart }));
    }
    return <Layout noindex={true} skipFooter={true}></Layout>;
  }

  if (!context.user) {
    return <></>;
  }

  return (
    <Layout noindex={true}>
      <div className="row">
        <div className="col-sm-12">
          <article>
            <h2>Digital Copy Quote Requests</h2>
            <div className="alert alert-warning" role="alert">
              <h2>
                <i className="fa fa-comments" />
                Digital Copy Quotes
              </h2>
              <p>
                Complete this form to request copies of records which are held by QSA. We will respond with a quote and details on how to pay within 20 working days.
              </p>
              <p>
                Please be as detailed as possible when providing us info about the records you need.
              </p>
            </div>
            {
              cart.digital_copy_requests.quotable_records.map((cartItem: any) => (
                <div key={cartItem.id}>
                  <div className="mb-2 qg-grab" role="listitem">
                    <div className="d-flex w-100 justify-content-between">
                      <h2>
                        <Link to={uriFor(cartItem.record.controlling_record.qsa_id_prefixed, 'archival_object')}>
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
                        <Link to={uriFor(cartItem.record.controlling_record.qsa_id_prefixed, 'archival_object')}>
                          {cartItem.record.controlling_record.qsa_id_prefixed}
                        </Link>
                      </dd>
                      <dt className="col-xs-6">
                        <label htmlFor={`item_${cartItem.id}_digital_copy_type`}>
                          Copy Type
                        </label>
                      </dt>
                      <dd className="col-xs-6">
                        <select id={`item_${cartItem.id}_digital_copy_type`}
                                className="form-control"
                                value={cartItem.options.digital_copy_type}
                                onChange={(e) => updateCartItem(context, cartItem.id, 'digital_copy_type', e.target.value)}>
                          <option disabled value=""> -- Please Select a Copy Type -- </option>
                          <option value="digital copy">Digital Copy</option>
                        </select>
                      </dd>
                      {
                        cartItem.options.digital_copy_type === 'digital copy' &&
                          <>
                            <dt className="col-xs-6">
                              <label htmlFor={`item_${cartItem.id}_digital_copy_delivery`}>
                                Preferred Mode of Delivery
                              </label>
                            </dt>
                            <dd className="col-xs-6">
                              <select id={`item_${cartItem.id}_digital_copy_delivery`}
                                      className="form-control"
                                      value={cartItem.options.digital_copy_delivery}
                                      onChange={(e) => updateCartItem(context, cartItem.id, 'digital_copy_delivery', e.target.value)}>
                                <option disabled value=""> -- Please select a mode of delivery -- </option>
                                <option value="email">Email</option>
                                <option value="USB/CD">USB/CD</option>
                              </select>
                            </dd>
                            <dt className="col-xs-6">
                              <label htmlFor={`item_${cartItem.id}_digital_copy_format`}>
                                Preferred Format
                              </label>
                            </dt>
                            <dd className="col-xs-6">
                              <select id={`item_${cartItem.id}_digital_copy_format`}
                                      className="form-control"
                                      value={cartItem.options.digital_copy_format}
                                      onChange={(e) => updateCartItem(context, cartItem.id, 'digital_copy_format', e.target.value)}>
                                <option disabled value=""> -- Please select a format --</option>
                                <option value="jpg">JPG</option>
                                <option value="tiff">TIFF</option>
                                <option value="pdf">PDF</option>
                              </select>
                            </dd>
                            <dt className="col-xs-6">
                              <label htmlFor={`item_${cartItem.id}_digital_copy_resolution`}>
                                Preferred Resolution
                              </label>
                            </dt>
                            <dd className="col-xs-6">
                              <select id={`item_${cartItem.id}_digital_copy_resolution`}
                                      className="form-control"
                                      value={cartItem.options.digital_copy_resolution}
                                      onChange={(e) => updateCartItem(context, cartItem.id, 'digital_copy_resolution', e.target.value)}>
                                <option disabled value=""> -- Please select a resolution --</option>
                                <option value="300dpi">300dpi</option>
                                <option value="other">Other (please detail in the notes field below)</option>
                              </select>
                            </dd>
                          </>
                      }
                      <dt className="col-xs-6">
                        <label htmlFor={`item_${cartItem.id}_digital_copy_notes`}>
                          Please provide further details or special requirements here:
                        </label>
                      </dt>
                      <dd className="col-xs-6">
                        <textarea id={`item_${cartItem.id}_digital_copy_notes`}
                                  className="form-control"
                                  value={cartItem.options.digital_copy_notes}
                                  onChange={(e) => updateCartItem(context, cartItem.id, 'digital_copy_notes', e.target.value)} />
                      </dd>
                    </dl>
                  </div>
                  <div className="clearfix" />
                </div>
              ))
            }

            {cart &&
              <div className="mt-5">
                <p>
                  {
                    (cart.digital_copy_requests.quotable_records.length > 0 || dirtyCart) &&
                      <>
                        {!dirtyCart &&
                          <>
                            <button className="qg-btn btn-primary"
                                    onClick={e => {
                                      Http.get()
                                          .submitDigitalQuoteRequest()
                                          .then(() => {
                                            context.refreshCart().then(() => {
                                              setCompleted(true);
                                            });
                                          })
                                          .catch((exception: Error) => {
                                            console.error(exception);
                                          });
                                    }}>
                              Submit Quote Requests
                            </button>
                          &nbsp;&nbsp;
                          </>
                        }
                        {
                          dirtyCart &&
                            <>
                              <button className="qg-btn btn-secondary"
                                      onClick={e => {
                                        updateQuotableItems()
                                      }}
                              >Update cart</button>
                            &nbsp;&nbsp;
                          <button className="qg-btn btn-default"
                                  onClick={e => {
                                    cart.refreshCart().then(() => {
                                      setCartNeedsRefresh(true);
                                      setDirtyCart(false);
                                    })
                                  }}
                          >Revert cart</button>
                            &nbsp;&nbsp;
                            </>
                        }
                      </>
                  }
                  {
                    cart.digital_copy_requests.total_count > 0 && !dirtyCart &&
                      <Link className="qg-btn btn-default" to="/digital-copies-cart">Back to Digital Copy Requests</Link>
                  }
                </p>
              </div>
            }
          </article>
        </div>
      </div>
    </Layout>
  );
}
