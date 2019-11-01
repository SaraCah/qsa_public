import React from 'react';
import { Link } from 'react-router-dom';
import { uriFor } from '../utils/typeResolver';
import Layout from '../recordViews/Layout';
import { Http } from '../utils/http';
import { centsToString } from '../utils/currency';


export const DigitalCopyCartSummaryPage: React.FC<any> = (route: any) => {
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

  const context = route.context;

  if (!context.user) {
    if (context.sessionLoaded) {
      return <Layout noindex={true}>
        <div className="alert alert-warning">Please log in to access your cart</div>
      </Layout>;
    } else {
      return <></>;
    }
  }

  return (
    <Layout noindex={true}>
      <div className="row">
        <div className="col-sm-12">
          <h1>
            <i className="fa fa-copy" aria-hidden="true" />&nbsp; Your Digital Copy Requests
          </h1>

          {(function () {
            if (route.location.state && route.location.state.flash) {
              return <div className="alert alert-success">{route.location.state.flash}</div>;
            } else if (!context.cart || context.cart.digital_copy_requests.total_count === 0) {
              return <div className="alert alert-info">Cart empty</div>;
            }
          })()}

          {context.cart && context.cart.digital_copy_requests.total_count > 0 && (
            <>
              <table className="table table-bordered table-condensed">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Parent Item</th>
                    <th style={{textAlign: 'right'}}>Price</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {
                    (context.cart.digital_copy_requests.set_price_records.concat(context.cart.digital_copy_requests.quotable_records)).map((cartItem: any) => (
                      <tr key={cartItem.id}>
                        <td>
                          <span className="badge badge-info">
                            {cartItem.digital_copy_request_type === 'QUOTE_REQUIRED' ? 'Requires Quote' : 'Set Price'}
                          </span>
                        </td>
                        <td>{cartItem.record.display_string}</td>
                        <td>
                          <Link to={uriFor(cartItem.record.controlling_record.qsa_id_prefixed, 'archival_object')}>
                            {cartItem.record.controlling_record.qsa_id_prefixed}
                          </Link>
                        </td>
                        <td style={{textAlign: 'right'}}>{cartItem.digital_copy_request_type === 'SET_PRICE' ? centsToString(cartItem.price) : 'TBC' }</td>
                        <td style={{textAlign: 'right'}}>
                          <button
                            className="qg-btn btn-default btn-xs"
                            onClick={e => {
                              e.preventDefault();
                              removeItem(cartItem.id, context);
                            }}>
                            <i className="fa fa-trash" aria-hidden="true" />&nbsp; Remove item</button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>

              <div className="checkout-actions mt-5">
                {context.cart.digital_copy_requests.set_price_records.length > 0 &&
                  <Link to="/digital-copies-cart/set-price-checkout" className="qg-btn btn-primary">
                    Checkout Set Price copies
                  </Link>
                }

                {context.cart.digital_copy_requests.quotable_records.length > 0 &&
                  <Link to="/digital-copies-cart/request-quote" className="qg-btn btn-primary">
                    Request Quotes
                  </Link>
                }

                <button
                  className="qg-btn btn-default"
                  onClick={e => {
                    e.preventDefault();
                    Http.get()
                        .clearCart('DIGITAL_COPY')
                        .then(() => context.refreshCart());
                  }}>Clear cart</button>
              </div>
            </>
          )}

          <p>
            <small><Link to="/digital-copies-cart/minicart">View your QGov Cart</Link></small>
          </p>
        </div>
      </div>
    </Layout>
  );
}

