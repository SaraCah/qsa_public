import React, { useEffect } from 'react';
import Layout from '../recordViews/Layout';

export const DigitalCopyMinicartPage: React.FC<any> = () => {

    useEffect(() => {
        const cartContents = document.createElement('script');
        cartContents.src = "https://test.smartservice.qld.gov.au/payment/minicart/contents_1.0.js";
        cartContents.async = false;

        /* const jquery = document.createElement('script');
         * jquery.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js";
         * jquery.async = false; */

        const minicart = document.createElement('script');
        minicart.src = "https://test.smartservice.qld.gov.au/payment/ui/minicart_1.0.js";
        minicart.async = false;

        /* document.body.appendChild(jquery); */
        document.body.appendChild(cartContents);
        document.body.appendChild(minicart);
    }, []);

  return (
      <Layout>
          <div id="minicart" className="aside">
              <div className="inner">
                  <div id="ssq-minicart" className="placeholder">
                      <h2>Cart</h2>
                      <div id="ssq-minicart-view">
                          Loading...
                      </div>
                      <div className="ssq-minicart-cards">
                          <h3>Cards accepted</h3>
                          <ul>
                              <li><img src="https://test.smartservice.qld.gov.au/payment/minicart/visa.png"
                                       alt="Visa" /></li>
                              <li><img src="https://test.smartservice.qld.gov.au/payment/minicart/mastercard.png"
                                       alt="MasterCard" /></li>
                          </ul>
                      </div>
                  </div>
              </div>
      </div>
      </Layout>
  );
};
