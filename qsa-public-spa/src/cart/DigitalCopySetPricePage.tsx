import React, {useEffect, useState} from 'react';
import AppContext from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import { uriFor } from '../utils/typeResolver';
import Layout from '../recordViews/Layout';
import { Http } from '../utils/http';
import {centsToString} from "../utils/currency";

export const DigitalCopySetPricePage: React.FC<any> = (route: any) => {
  const context = route.context;

  const [deliveryMethod, setDeliveryMethod] = useState('digital');
  const [registeredPost, setRegisteredPost] = useState(false);

  const [digitalCopyPricing, setDigitalCopyPricing]: [any, any] = useState(undefined);

  const [showError, setShowError]: [string?, any?] = useState(undefined);
  const [showMinicart, setShowMinicart] = useState(false);
  const [minicartLoaded, setMinicartLoaded] = useState(false);
  const [minicartId] = useState((window as any).SSQ.cart.id);
  const [submitDisabled, setSubmitDisabled] = useState(false);

  useEffect(() => {
    if (typeof(digitalCopyPricing) === 'undefined') {
      Http.get().getDigitalCopyPricing().then(
        (pricing: any) => {
          setDigitalCopyPricing(pricing);
        },
        () => {
          setDigitalCopyPricing(null);
        }
      );
    }
  }, []);

  const calculateTotal = (cart: any) => {
    let total_in_cents = 0;

    cart.digital_copy_requests.set_price_records.forEach((cartItem: any) => {
      total_in_cents += cartItem.price;
    });

    if (deliveryMethod === 'usb') {
      total_in_cents += digitalCopyPricing.usb;
      total_in_cents += digitalCopyPricing.usb_postage;
    }

    if (registeredPost) {
      total_in_cents += digitalCopyPricing.registered_mail;
    }

    return total_in_cents;
  }

  useEffect(() => {
    if (deliveryMethod === 'digital') {
      setRegisteredPost(false);
    }
  }, [deliveryMethod]);

  if (showMinicart) {
    return <Redirect to="/digital-copies-cart/minicart" push={true} />
  }

  if (!context.user) {
    return <></>;
  }

  if (typeof(digitalCopyPricing) === 'undefined') {
    return <Layout noindex={true} skipFooter={true} />
  }

  if (!digitalCopyPricing) {
    return <Layout noindex={true}>
      <div className="row">
        <div className="col-sm-12">
          <div className="alert alert-danger" role="alert">Unable to process payments at this time.  Please contact Queensland State Archives for assistance.</div>
        </div>
      </div>
    </Layout>
  }

  return (
    <Layout noindex={true}>
      <div className="row">
        <div className="col-sm-12">
          {showError && <div className="alert alert-danger">{showError}</div>}

          <article>
            <h2>Digital Copy Set Price Requests</h2>
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
              context.cart && context.cart.digital_copy_requests.set_price_records.map((cartItem: any) => (
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
                  </div>
                  <div className="clearfix" />
                </div>
              ))
            }

            {context.cart && context.cart.digital_copy_requests.set_price_records.length > 0 &&
              <section>
                <div className="row">
                  <div className="col-sm-12">
                    <label>Delivery method:&nbsp;
                      <select value={deliveryMethod} onChange={e => setDeliveryMethod(e.target.value)}>
                        <option value="digital">Digital Download (No extra cost)</option>
                        <option value="usb">USB via post ({centsToString(digitalCopyPricing.usb + digitalCopyPricing.usb_postage)})</option>
                      </select>
                    </label>
                  </div>
                </div>
                {
                  deliveryMethod === 'usb' &&
                    <div className="row">
                      <div className="col-sm-12">
                        <label>Registered Mail ({centsToString(digitalCopyPricing.registered_mail)}):&nbsp;
                          <input type="checkbox" checked={registeredPost} value="registeredPost" onChange={e => setRegisteredPost(e.target.checked)}/>
                        </label>
                      </div>
                    </div>
                }
                <div className="row">
                  <div className="col-sm-12">
                    <hr/>
                    <strong>Total:</strong> {centsToString(calculateTotal(context.cart))}
                    <hr/>
                  </div>
                </div>

                <div>
                  <p>
                    <button className="qg-btn btn-primary"
                            disabled={!minicartId || submitDisabled}
                            onClick={e => {
                              setSubmitDisabled(true);
                              Http.get().goToPayment({
                                deliveryMethod,
                                registeredPost,
                                minicartId,
                              }).then(() => { context.refreshCart().then(() => {setShowMinicart(true); }) },
                                      () => {
                                        setSubmitDisabled(false);
                                        setShowError("Your payment could not be completed at this time");
                                      });
                            }}>
                      Continue to payment
                    </button>&nbsp;&nbsp;
            <Link className="qg-btn btn-default" to="/digital-copies-cart">Back to Digital Copy Requests</Link>
                  </p>
                </div>
              </section>
            }
          </article>
        </div>

      </div>
    </Layout>
  );
}
