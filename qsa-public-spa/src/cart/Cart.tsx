import React from 'react';
import AppContext from "../context/AppContext";
import {Link} from "react-router-dom";
import {iconForType, labelForType} from "../utils/typeResolver";
import Layout from "../recordViews/Layout";
import {Http} from "../utils/http";

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

export const CartSummary: React.FC<any> = ({cart}) => {
  return (
      <small className="cart-summary">
        <Link to="/my-cart"
              className="qg-btn btn-xs btn-default">
                <span className="fa fa-shopping-cart">
                </span>&nbsp;
          {
            cart && cart.length
          }
        </Link>
      </small>
  )
}

export const MyCartPage: React.FC<any> = (route: any) => {
  const removeItem = (id: number, context: any) => {
    Http.get()
        .removeFromCart(id)
        .then((json: any) => {
          context.refreshCart();
        })
        .catch((exception: Error) => {
          console.error(exception);
        });
  }

  return (
    <AppContext.Consumer>
      {(context: any): React.ReactElement => (
          <>
            {
              !context.sessionLoaded && <Layout footer={false}/>
            }
            {
              context.sessionLoaded &&
              <Layout>
                <div className="row">
                  <div className="col-sm-12">
                    <h1>My Cart</h1>
                    {
                      !context.user &&
                      <div className="alert alert-warning">
                        Please login to access your cart
                      </div>
                    }
                    {
                      context.user && context.cart.length === 0 &&
                      <div className="alert alert-info">
                        Cart empty
                      </div>
                    }
                    {
                      context.user && context.cart.length > 0 &&
                      <ul>
                        {
                          context.cart.map((cart_item: any) => (
                            <li key={cart_item.id}>
                              {cart_item.record.display_string}
                              <button
                                className="qg-btn btn-danger btn-xs"
                                onClick={() => removeItem(cart_item.id, context)}>
                                Remove
                              </button>
                            </li>
                          ))
                        }
                      </ul>
                    }
                  </div>
                </div>
              </Layout>
            }
          </>
      )}
    </AppContext.Consumer>
  )
}

export default Cart;
