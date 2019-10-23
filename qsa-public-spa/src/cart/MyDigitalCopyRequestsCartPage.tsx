import React, { useState } from 'react';
import AppContext from '../context/AppContext';
import { Link } from 'react-router-dom';
import { uriFor } from '../utils/typeResolver';
import Layout from '../recordViews/Layout';
import { Http } from '../utils/http';
import { centsToString } from '../utils/currency';
import { AccordionPanel } from '../recordViews/Helpers';


export const MyDigitalCopyRequestsCartPage: React.FC<any> = () => {
  const [cart, setCart]: [any, any] = useState(null);
  const [dirtyCart, setDirtyCart]: [any, any] = useState(false);
  const [cartNeedsRefresh, setCartNeedsRefresh]: [any, any] = useState(true);
  const [showQuoteRequestSentSuccessMessage, setShowQuoteRequestSentSuccessMessage]: [any, any] = useState(false);

  const removeItem = (cartItemId: number): void => {
    let updated_digital_copy_requests = Object.assign({}, cart.digital_copy_requests, {
      quotable_records: cart.digital_copy_requests.quotable_records.filter((cartItem: any) => {
        return cartItem.id !== cartItemId;
      })
    });

    updated_digital_copy_requests.total_count = (updated_digital_copy_requests.quotable_records.length +
      updated_digital_copy_requests.set_price_records.length);

    setCart(
      Object.assign({}, cart, {
        digital_copy_requests: updated_digital_copy_requests
      })
    );

    setDirtyCart(true);
  };

  const updateCartItem = (context: any, cartItemId: number, field: string, value: string) => {
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

  return (
    <AppContext.Consumer>
      {(context: any): React.ReactElement => {
        if (cartNeedsRefresh && context.user) {
          if (context.cart) {
            setCartNeedsRefresh(false);
            setCart(Object.assign({}, context.cart, { refreshCart: context.refreshCart }));
          }
          return <Layout footer={false}></Layout>;
        } else {
          return (
            <Layout>
              <div className="row">
                <div className="col-sm-12">
                  <h1>
                    <i className="fa fa-copy" aria-hidden="true" />&nbsp;
                    Submit Your Digital Copy Requests
                    </h1>
                  {showQuoteRequestSentSuccessMessage &&
                    <div className="alert alert-success">Your quote request has been successfully submitted.</div>
                  }
                  {!context.user && context.sessionLoaded && <div className="alert alert-warning">Please login to access your cart</div>}
                  {context.user && cart && cart.digital_copy_requests.total_count === 0 && (
                    <div className="alert alert-info">Cart empty</div>
                  )}
                  {context.user && cart && cart.digital_copy_requests.total_count > 0 && (
                    <section className="qg-accordion qg-dark-accordion">
                      {
                        cart.digital_copy_requests.set_price_records.length > 0 &&
                        <AccordionPanel
                          id={"set_price_digital_copy_requests_section"}
                          anchor="set_price_digital_copy_requests"
                          title={`Set Price Digital Copy Requests (${cart.digital_copy_requests.set_price_records.length})`}
                          children={
                            <article>
                              <div className="alert alert-success" role="alert">
                                <h2>
                                  <i className="fa fa-comments" />
                                  Set Price Requests
                                  </h2>
                                <p>
                                  These copy charges are based on the average size of files within a series (a group of related records), not on the number of pages within individual records. The relevant charge is then applied to all items within the series.
                                  </p>
                              </div>

                              {
                                cart.digital_copy_requests.set_price_records.map((cartItem: any) => (
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
                                        <dt className="col-xs-6">Unit price</dt>
                                        <dd className="col-xs-6">{centsToString(cartItem.price)}</dd>

                                      </dl>
                                      <h3 className="sr-only">Actions</h3>
                                      <div className="btn-group">
                                        <button
                                          className="qg-btn btn-default btn-xs"
                                          onClick={e => {
                                            e.preventDefault();
                                            removeItem(cartItem.id);
                                          }}
                                        >
                                          <i className="fa fa-trash" aria-hidden="true" />
                                          &nbsp; Remove item
                                            </button>
                                      </div>
                                    </div>
                                    <div className="clearfix" />
                                  </div>
                                ))
                              }

                              {cart.digital_copy_requests.set_price_records.length > 0 &&
                                <section>
                                  <label>Delivery method:&nbsp;
                                      <select>
                                      <option value="digital">Digital Download</option>
                                      <option value="post">USB/CD via post</option>
                                    </select>
                                  </label>

                                  <div>
                                    <button className="qg-btn btn-primary"
                                      onClick={e => { alert("bang!") }}>
                                      Continue to payment
                                      </button>
                                  </div>

                                </section>
                              }
                            </article>
                          }
                        />
                      }
                      {
                        cart.digital_copy_requests.quotable_records.length > 0 &&
                        <AccordionPanel
                          id={"quote_digital_copy_requests_section"}
                          anchor="quote_digital_copy_requests"
                          title={`Digital Copy Quote Requests (${cart.digital_copy_requests.quotable_records.length})`}
                          children={
                            <article>
                              <h2>Digital Copy Quote Requests</h2>
                              <div className="alert alert-warning" role="alert">
                                <h2>
                                  <i className="fa fa-comments" />
                                  Digital Copy Quotes
                                  </h2>
                                <p>
                                  Complete this form to request copies of materials which are held by us. Depending on what you request, a fee may apply. We'll get in touch to let you know how much the fee is.
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
                                            <option value="photocopy">Photocopy</option>
                                            <option value="photo">Photo</option>
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
                                        {
                                          cartItem.options.digital_copy_type === 'photocopy' &&
                                          <>
                                            <dt className="col-xs-6">
                                              <label htmlFor={`item_${cartItem.id}_digital_copy_mode`}>
                                                Preferred Mode
                                                  </label>
                                            </dt>
                                            <dd className="col-xs-6">
                                              <select id={`item_${cartItem.id}_digital_copy_mode`}
                                                className="form-control"
                                                value={cartItem.options.digital_copy_mode}
                                                onChange={(e) => updateCartItem(context, cartItem.id, 'digital_copy_mode', e.target.value)}>
                                                <option disabled value=""> -- Please select a resolution --</option>
                                                <option value="colour">Colour</option>
                                                <option value="grayscale">Grayscale</option>
                                              </select>
                                            </dd>
                                          </>
                                        }
                                        {
                                          cartItem.options.digital_copy_type === 'photo' &&
                                          <>
                                            <dt className="col-xs-6">
                                              <label htmlFor={`item_${cartItem.id}_digital_copy_size`}>
                                                Preferred Size
                                                  </label>
                                            </dt>
                                            <dd className="col-xs-6">
                                              <select id={`item_${cartItem.id}_digital_copy_size`}
                                                className="form-control"
                                                value={cartItem.options.digital_copy_size}
                                                onChange={(e) => updateCartItem(context, cartItem.id, 'digital_copy_size', e.target.value)}>
                                                <option disabled value=""> -- Please select a size --</option>
                                                <option value="5x7">5x7</option>
                                                <option value="8x10">8x10</option>
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
                                      <h3 className="sr-only">Actions</h3>
                                      <div className="btn-group">
                                        <button
                                          className="qg-btn btn-default btn-xs"
                                          onClick={e => {
                                            e.preventDefault();
                                            removeItem(cartItem.id);
                                          }}
                                        >
                                          <i className="fa fa-trash" aria-hidden="true" />
                                          &nbsp; Remove item
                                            </button>
                                      </div>
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
                                                    cart.refreshCart().then(() => {
                                                      setCartNeedsRefresh(true);
                                                      setShowQuoteRequestSentSuccessMessage(true);
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
                                      <button className="qg-btn btn-default"
                                        onClick={e => {
                                          Http.get().clearCart('DIGITAL_COPY').then(() => {
                                            cart.refreshCart().then(() => {
                                              setCartNeedsRefresh(true);
                                              setDirtyCart(false);
                                            })
                                          });
                                        }}
                                      >
                                        Clear cart
                                       </button>
                                    }
                                  </p>
                                </div>
                              }
                            </article>
                          }
                        />
                      }
                    </section>
                  )}
                </div>
              </div>
            </Layout>
          )
        }
      }}
    </AppContext.Consumer>
  );
};
