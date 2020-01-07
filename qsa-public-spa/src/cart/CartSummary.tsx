import React from 'react';
import { Link } from 'react-router-dom';

export const CartSummary: React.FC<any> = ({ cart }) => {
  return (
    <>
      <small className="cart-summary">
        <Link to="/reading-room-requests-cart" className="qg-btn btn-xs btn-default" title="Pending Reading Room Requests" aria-label="Pending Reading Room Requests">
          <span className="fa fa-institution" aria-hidden="true" />
          &nbsp;
          {cart && cart.reading_room_requests.total_count}
        </Link>
      </small>
      <small className="cart-summary">
        <Link to="/digital-copies-cart" className="qg-btn btn-xs btn-default" title="Pending Digital Copy Requests" aria-label="Pending Digital Copy Requests">
          <span className="fa fa-copy" aria-hidden="true" />
          &nbsp;
          {cart && cart.digital_copy_requests.total_count}
        </Link>
      </small>
    </>
  );
};
