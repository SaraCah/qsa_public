import React, { useEffect } from 'react';
import Layout from '../recordViews/Layout';

declare var AppConfig: any;

export const DigitalCopyMinicartPage: React.FC<any> = () => {

    useEffect(() => {
        const cartContents = document.createElement('script');
        cartContents.src = AppConfig.minicart_contents_url;
        cartContents.async = false;

        const minicart = document.createElement('script');
        minicart.src = AppConfig.minicart_script_url;
        minicart.async = false;

        document.body.appendChild(cartContents);
        document.body.appendChild(minicart);
    }, []);

  return (
      <Layout noindex={true}>
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
                              <li><img src={AppConfig.minicart_base_url + '/payment/minicart/visa.png'}
                                       alt="Visa" /></li>
                              <li><img src={AppConfig.minicart_base_url + '/payment/minicart/mastercard.png'}
                                       alt="MasterCard" /></li>
                          </ul>
                      </div>
                  </div>
              </div>
      </div>
      </Layout>
  );
};
