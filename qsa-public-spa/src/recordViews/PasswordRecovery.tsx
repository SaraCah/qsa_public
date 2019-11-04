import React, { SyntheticEvent, useState } from 'react';
import { Http } from '../utils/http';
import Layout from './Layout';
import { Link } from 'react-router-dom';
import { PasswordRecoveryResponse } from '../models/HttpResponse';
import {errorMessageForCode} from "../utils/typeResolver";

export const PasswordRecoveryPage: React.FC<any> = (route: any) => {
  const [email, setEmail]: [string, Function] = useState('');
  const [emailIsValid, setEmailIsValid]: [boolean, Function] = useState(false);
  const [errors, setErrors]: [string[], Function] = useState([]);
  const [showEmailSuccess, setShowEmailSuccess]: [boolean, Function] = useState(false);
  const [showPasswordChangeSuccess, setShowPasswordChangeSuccess]: [boolean, Function] = useState(false);
  const [password, setPassword]: [string, Function] = useState('');
  const token = route.match.params.token;

  const onSubmitTokenRequest = (): void => {
    if (!emailIsValid) {
      setErrors([{ message: 'Email field was invalid' }]);
      return;
    }
    Http.get()
      .generateRecoveryToken(email)
      .then((response: PasswordRecoveryResponse) => {
        if (!response.errors) {
          setShowEmailSuccess(true);
        } else {
          setErrors([{ message: 'Something went wrong. Please try again' }]);
        }
      });
  };

  const onSubmitPasswordChangeRequest = (): void => {
    if (password.length === 0) {
      setErrors([{ message: 'Password was invalid' }]);
      return;
    }

    setErrors([]);
    Http.get()
      .recoverPassword(token, password)
      .then((response: PasswordRecoveryResponse) => {
        if (!response.errors) {
          setShowPasswordChangeSuccess(true);
        } else if (response.errors) {
          setErrors(response.errors);
        }
      });
  };

  return (
    <Layout noindex={true}>
      {errors.length > 0 && (
        <div className="alert alert-warning" role="alert">
          <h2>
            <i className="fa fa-exclamation-triangle" />
            Error requesting password recovery:
          </h2>
          {errors.map((error: any, idx: number) => (
            <div key={idx}>{ error.message }</div>
          ))}
        </div>
      )}
      {showEmailSuccess && (
        <div className="alert alert-success" role="alert">
          <h2>
            <i className="fa fa-check-circle" />
            If your email was entered correctly, an email will be sent with a link to reset your password.
          </h2>
          <p>
            Please proceed to <Link to="/login">login</Link>.
          </p>
        </div>
      )}
      {showPasswordChangeSuccess && (
        <div className="alert alert-success" role="alert">
          <h2>
            <i className="fa fa-check-circle" />
            Your password was changed successfully!
          </h2>
          <p>
            Please proceed to <Link to="/login">login</Link>.
          </p>
        </div>
      )}
      {
        !showEmailSuccess && !showPasswordChangeSuccess &&
        <div className="row">
          <div className="col-sm-12">
            <h1>Password Recovery</h1>
            {!token && (
                <form
                    onSubmit={(e: SyntheticEvent): void => {
                      e.stopPropagation();
                      e.preventDefault();
                      onSubmitTokenRequest();
                    }}
                >
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="Email Address"
                        onChange={(e: SyntheticEvent): void => {
                          const emailInput = e.target as HTMLInputElement;
                          setEmailIsValid(emailInput.validity.valid);
                          setEmail(emailInput.value);
                        }}
                    />
                  </div>
                  <div className="form-row col-md-12">
                    <p>
                      <button type="submit" className="qg-btn btn-primary">
                        Submit
                      </button>
                    </p>
                  </div>
                </form>
            )}
            {!!token && (
                <form
                    onSubmit={(e: SyntheticEvent): void => {
                      e.stopPropagation();
                      e.preventDefault();
                      onSubmitPasswordChangeRequest();
                    }}
                >
                  <div className="form-group">
                    <label htmlFor="email">New Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        onChange={(e: SyntheticEvent): void => {
                          const passwordInput = e.target as HTMLInputElement;
                          setPassword(passwordInput.value);
                        }}
                    />
                    <div className="form-text text-muted">
                      <small>Must be at least 12 characters in length; Include both upper and lower case letters; Include at least one non-letter (numeral, space or punctuation)</small>
                    </div>
                  </div>
                  <div className="form-row col-md-12">
                    <p>
                      <button type="submit" className="qg-btn btn-primary">
                        Submit
                      </button>
                    </p>
                  </div>
                </form>
            )}
          </div>
        </div>
      }
    </Layout>
  );
};
