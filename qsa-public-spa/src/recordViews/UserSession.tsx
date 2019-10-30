import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import { Http } from '../utils/http';

import AppContext from '../context/AppContext';
import { CartSummary } from '../cart/CartSummary';

export const UserSession: React.FC<any> = (props: any) => {
  const context = props.context;

  const displayName = (user: any) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`;
    } else {
      return user.email;
    }
  };

  return (
    <>
      {context.sessionLoaded && (
        <div className="login-box pull-right">
          <CartSummary cart={context.cart} />
          {context.user ? (
            <small>
              Hello, {displayName(context.user)}
              &nbsp;|&nbsp;
              <Link to="/logout">
                {
                  context.masterSessionId ? "Return to admin" : "Log Out"
                }
              </Link>
            </small>
          ) : (
            <small>
              <Link to="/login">Log In</Link>
            </small>
          )}
        </div>
      )}
    </>
  );
};


export const LoginPage: React.FC<any> = (route: any) => {
  const context = route.context;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginFailed, setShowLoginFailed] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [rateLimitDelay, setRateLimitDelay] = useState(0);

  const onSubmit = (e: any, appContext: any) => {
    setShowLoginFailed(false);
    Http.get()
      .login(email, password)
      .then((login_response: any) => {
        if (login_response.authenticated) {
          appContext.setSessionId(login_response.session_id);
          setShowLoginSuccess(true);
        } else {
          appContext.setUser(null);
          setShowLoginFailed(true);
          setRateLimitDelay(login_response.delay_seconds);
        }
      });
  };

  if (showLoginSuccess) {
    return (
      <Layout>
        <div className="row">
          <div className="col-sm-12">
            <div className="alert alert-success" role="alert">
              <h2>
                <i className="fa fa-check-circle" />
                Login Success
              </h2>
              <p>
                Return to <Link to="/">Archives Search</Link> or visit <Link to="/my-account">your account</Link>.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="row">
        <div className="col-sm-12">
          <h1>Login</h1>
          <form
            method="GET"
            onSubmit={e => {
              e.preventDefault();
              onSubmit(e, context);
            }}
            className="form-inline"
          >
            <div className="qg-call-out-box">
              {showLoginFailed && (
              <div className="alert alert-warning" role="alert" style={{ marginBottom: 20 }}>
                {rateLimitDelay > 0 ?
                  <p>Please wait {rateLimitDelay} second(s) before trying again.</p>
                  :
                  <p>Invalid email or password.</p>
                }
                </div>
              )}
              <div className="form-row">
                <div className="form-group col-xs-12 col-sm-6">
                  <label htmlFor="email" className="sr-only">
                    Email Address
                  </label>
                  <input
                    type="text"
                    className="form-control-plaintext"
                    id="email"
                    placeholder="Email Address"
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group col-xs-12 col-sm-6">
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control-plaintext"
                    id="password"
                    placeholder="Password"
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <p>
                <small>
                  New user? <Link to="/register">Create an account here</Link>
                </small>
                <br />
                <small>
                  <Link to="/recover-password">Recover password</Link>
                </small>
              </p>
            </div>

            <div className="form-row col-md-12">
              <p>
                <button type="submit" className="qg-btn btn-primary">
                  Login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export const LogoutPage: React.FC<any> = (route: any) => {
  const context = route.context;

  const [logoutTriggered, setLogoutTriggered] = useState(false);

  const logout = (context: any) => {
    if (!logoutTriggered) {
      setLogoutTriggered(true);
      Http.get().logout();

      const masterSessionId = context.masterSessionId;

      context.clearSession();
      context.setSessionId(masterSessionId);
    }

    return true;
  };

  logout(context)

  return (
    <Layout>
      <div className="row">
        <div className="col-sm-12">
          {
            (context.user && context.user.is_admin) ?
              <div className="alert alert-success" role="alert">
                You are now logged in
                as <strong>{context.user.email}</strong> again.
              </div> :
              <div className="alert alert-success" role="alert">
                <h2><i className="fa fa-check-circle"/>Logout Success</h2>
                <p>Return to <Link to="/">Archives Search</Link> or login again <Link to="/login">here</Link>.</p>
              </div>
          }
        </div>
      </div>
    </Layout>
  );
}
