import React, { useEffect, useState, useRef, SyntheticEvent } from 'react';
import { Http } from '../utils/http';
import { Redirect } from 'react-router';
import Layout from './Layout';
import { Link } from 'react-router-dom';
import { UserForm } from '../models/User';
import { errorMessageForCode, snakeToUppercaseInitials, uriFor } from '../utils/typeResolver';
import { AxiosResponse } from 'axios';
import { AccordionPanel } from "./Helpers";
import { RichText } from './RichText';

import { PageSnippet } from './PageViewPage';
import { ClientState } from '../context/AppContext';
import { IAppContext } from '../context/AppContext';
import { PageRoute } from '../models/PageRoute';
import {AdvancedSearchQuery} from "../models/AdvancedSearch";
import {CompactSearchSummary} from "./Results";
import {formatDateForDisplay} from "../utils/rendering";


const FormErrors: React.FC<{ errors: any }> = ({ errors }) => {
  const errorMessage = (error: any) => {
    if (error.validation_code) {
      return error.validation_code;
    }
    if (error.code) {
      return errorMessageForCode(error.code);
    }
    if (error.SERVER_ERROR) {
      return error.SERVER_ERROR.message;
    }
    return 'Error occurred';
  };

  const fieldLabel = (field: string): string => {
    return snakeToUppercaseInitials(field);
  };

  return (
    <div className="alert alert-warning" role="alert">
      <h2>
        <i className="fa fa-exclamation-triangle" />
        An error has occurred:
      </h2>
      <ol>
        {errors.map((error: any, idx: number) => (
          <li key={idx}>
            {error.field ? (
              <span>
                {fieldLabel(error.field)} - {errorMessage(error)}
              </span>
            ) : (
              <span>{errorMessage(error)}</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

const scrollToRef = (ref?: React.RefObject<HTMLDivElement>): void => {
  if (ref && ref.current) {
    window.scrollTo(0, ref.current.offsetTop);
  }
};

export const RegisterPage: React.FC<PageRoute> = (route: PageRoute) => {
  const [user, setUser]: [UserForm | undefined, any] = useState();
  const [errors, setErrors]: [any, any] = useState([]);
  const [showRegisterSuccess, setShowRegisterSuccess]: [boolean, any] = useState(false);
  const [termsAccepted, setTermsAccepted]: [any, any] = useState(false);

  const emptyUser = () => {
    return {
      email: '',
      password: '',
      confirm_password: ''
    };
  };

  const onSubmit = () => {
    window.scrollTo(0,0);
    setErrors([]);

    if (user) {
      Http.get()
        .register(user)
        .then((response: any) => {
          if (response.status === 'created') {
            setShowRegisterSuccess(true);
            setUser(emptyUser());
          } else if (response.errors) {
            setErrors(response.errors);
          } else {
            setErrors([{ validation_code: 'Registration Failed -- please try again' }]);
          }
        });
    }
  };

  useEffect(() => {
    setUser(emptyUser());
  }, []);

  if (showRegisterSuccess) {
    return (
      <Layout noindex={true}>
        <div className="alert alert-success" role="alert">
          <h2>
            <i className="fa fa-check-circle" />
            Registration Success
          </h2>
          <p>
            Please proceed to <Link to="/login">login</Link>.
          </p>
        </div>
      </Layout>
    );
  }

  const updateTOCAccept = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(e.target.checked);
  };

  return (
    <Layout noindex={true}>
      <div className="row">
        <div className="col-sm-12">
          <h1>Register</h1>

          <form
            method="GET"
            onSubmit={e => {
              e.preventDefault();
              onSubmit();
            }}
          >
            {errors && errors.length > 0 && <FormErrors errors={errors} />}

            <h3>Your login details</h3>
            <div className="qg-call-out-box">
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="text"
                  className="form-control"
                  id="email"
                  aria-describedby="emailHelp"
                  placeholder="Enter email"
                  onChange={e => setUser(Object.assign({}, user, { email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Password"
                  onChange={e => setUser(Object.assign({}, user, { password: e.target.value }))}
                />
                <div className="form-text text-muted">
                  <small>Must be at least 12 characters in length; Include both upper and lower case letters; Include at least one non-letter (numeral, space or punctuation)</small>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirm_password">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirm_password"
                  placeholder="Confirm Password"
                  onChange={e =>
                    setUser(
                      Object.assign({}, user, {
                        confirm_password: e.target.value
                      })
                    )
                  }
                />
                {user && user.password && user.confirm_password && user.password !== user.confirm_password && (
                  <small id="passwordHelpInline" className="text-danger">
                    Password mismatch
                  </small>
                )}
                {user && user.password && user.confirm_password && user.password === user.confirm_password && (
                  <small id="passwordHelpInline" className="text-success">
                    Passwords match!
                  </small>
                )}
              </div>
            </div>

            <h3>Your contact details</h3>

            <div className="qg-call-out-box">
              <blockquote>
                <PageSnippet slug="proof-of-identity-statement" />
              </blockquote>
              <br />

              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="first_name"
                  placeholder="First name"
                  onChange={(e): void => setUser(Object.assign({}, user, { first_name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="last_name"
                  placeholder="Last name"
                  onChange={e => setUser(Object.assign({}, user, { last_name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="street_address">Street Address</label>
                <input
                  type="text"
                  className="form-control"
                  id="street_address"
                  placeholder="Street Address"
                  onChange={e => setUser(Object.assign({}, user, { street_address: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="city_suburb">City/Suburb</label>
                <input
                  type="text"
                  className="form-control"
                  id="city_suburb"
                  placeholder="City/Suburb"
                  onChange={e => setUser(Object.assign({}, user, { city_suburb: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  className="form-control"
                  id="state"
                  placeholder="State"
                  onChange={e => setUser(Object.assign({}, user, { state: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="post_code">Post Code</label>
                <input
                  type="text"
                  className="form-control"
                  id="post_code"
                  placeholder="Post Code"
                  onChange={e => setUser(Object.assign({}, user, { post_code: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  id="phone"
                  placeholder="Phone Number"
                  onChange={e => setUser(Object.assign({}, user, { phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="qg-call-out-box">
              <PageSnippet slug="terms-and-conditions" />
              <br />
              <label><input type="checkbox" value={termsAccepted} onChange={updateTOCAccept}></input>
                <strong>I accept the terms and conditions</strong>
              </label>
            </div>


            <div className="form-row col-md-12">
              <p>
                <button type="submit" className="qg-btn btn-primary" disabled={!termsAccepted}>
                  Register
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

const AdminAccountSummary: React.FC = () => {
  return (
    <>
      <h1>My Account</h1>
      <section className="row qg-cards">
        <article className="qg-card col-12 col-sm-6 col-lg-4">
          <div className="content">
            <div className="details">
              <h2>My contact details</h2>
              <p>Review and modify your name and contact details</p>
              <Link to="/my-details" className="btn btn-primary">
                My contact details
              </Link>
            </div>
          </div>
        </article>
        <article className="qg-card col-12 col-sm-6 col-lg-4">
          <div className="content">
            <div className="details">
              <h2>Change password</h2>
              <p>Change your password</p>
              <Link to="/change-password" className="btn btn-primary">
                Change password
              </Link>
            </div>
          </div>
        </article>
        <article className="qg-card col-12 col-sm-6 col-lg-4">
          <div className="content">
            <div className="details">
              <h2>User management</h2>
              <p>Review users, validate online users and review account profiles</p>
              <Link to="/admin/users" className="btn btn-primary">
                User management
              </Link>
            </div>
          </div>
        </article>
        <article className="qg-card col-12 col-sm-6 col-lg-4">
          <div className="content">
            <div className="details">
              <h2>Tag management</h2>
              <p>Moderate tags and manage the banned tag list</p>
              <Link to="/admin/tags" className="btn btn-primary">
                Tag management
              </Link>
            </div>
          </div>
        </article>
        <article className="qg-card col-12 col-sm-6 col-lg-4">
          <div className="content">
            <div className="details">
              <h2>Page management</h2>
              <p>Create and manage static pages</p>
              <Link to="/admin/pages" className="btn btn-primary">
                Page management
              </Link>
            </div>
          </div>
        </article>
        <article className="qg-card col-12 col-sm-6 col-lg-4">
          <div className="content">
            <div className="details">
              <h2>My searches</h2>
              <p>Manage your saved searches</p>
              <Link to="/my-searches" className="btn btn-primary">
                My searches
              </Link>
            </div>
          </div>
        </article>
      </section>
    </>
  );
};

const UserAccountSummary: React.FC = () => {
  return (
    <>
      <h1>My Account</h1>
      <section className="row qg-cards">
        <article className="qg-card col-12 col-sm-6 col-lg-4">
          <div className="content">
            <div className="details">
              <h2>My contact details</h2>
              <p>Review and modify your name and contact details</p>
              <Link to="/my-details" className="btn btn-primary">
                My contact details
              </Link>
            </div>
          </div>
        </article>
        <article className="qg-card col-12 col-sm-6 col-lg-4">
          <div className="content">
            <div className="details">
              <h2>Change password</h2>
              <p>Change your password</p>
              <Link to="/change-password" className="btn btn-primary">
                Change password
              </Link>
            </div>
          </div>
        </article>
        <article className="qg-card col-12 col-sm-6 col-lg-4">
          <div className="content">
            <div className="details">
              <h2>My requests</h2>
              <p>Review all of your request slips</p>
              <Link to="/my-requests" className="btn btn-primary">
                My requests
              </Link>
            </div>
          </div>
        </article>
        <article className="qg-card col-12 col-sm-6 col-lg-4">
          <div className="content">
            <div className="details">
              <h2>My searches</h2>
              <p>Manage your saved searches</p>
              <Link to="/my-searches" className="btn btn-primary">
                My searches
              </Link>
            </div>
          </div>
        </article>
      </section>
    </>
  );
};

export const LoginRequired: React.FC<any> = (props: any) => {
  const context = props.context;

  if (!context.sessionLoaded) {
    return <Layout noindex={true} skipFooter={true} />;
  } else if (context.user && ((props.adminOnly && context.user.is_admin) || !props.adminOnly)) {
    return <Layout noindex={true} showNavForUser={true}>{props.children}</Layout>;
  } else if (props.adminOnly) {
    return <Redirect to="/404" push={true} />;
  } else {
    return <Redirect to="/login" push={true} />;
  }
};

export const MyAccountPage: React.FC<PageRoute> = (route: PageRoute) => {
  const context = route.context;
  return (
    <LoginRequired context={context}>
      {((context.user && context.user.is_admin) ? <AdminAccountSummary /> : <UserAccountSummary />)}
    </LoginRequired>
  );
};

const UserDetailsForm: React.FC<{ context: IAppContext }> = ({ context }) => {
  const [user, setUser]: [UserForm, any] = useState({ ...context.user });
  const [errors, setErrors]: [any, any] = useState([]);
  const [showUpdateSuccess, setShowUpdateSuccess]: [boolean, any] = useState(false);
  const updateUserRef = useRef<HTMLDivElement>(null);

  const onSubmit = (): Promise<AxiosResponse> => {
    setErrors([]);
    setShowUpdateSuccess(false);

    return Http.get()
      .updateUser(user)
      .then((response: any) => {
        if (response.status === 'updated') {
          setShowUpdateSuccess(true);
          Http.get()
            .getCurrentUser()
            .then((response: AxiosResponse) => {
              context.setUser(response.data);
              setUser(response.data);
            });
        } else if (response.errors) {
          setErrors(response.errors);
        } else {
          setErrors([{ validation_code: 'Update Failed -- please try again' }]);
        }
      });
  };

  return (
    <div ref={updateUserRef} className="row">
      <div className="col-sm-12">
        <h1>My contact details</h1>
        {showUpdateSuccess && (
          <div className="alert alert-success" role="alert">
            <p>Contact details updated.</p>
          </div>
        )}
        <form
          method="GET"
          onSubmit={async (e: SyntheticEvent): Promise<void> => {
            e.preventDefault();
            await onSubmit();
            scrollToRef(updateUserRef);
          }}
        >
          {errors && errors.length > 0 && <FormErrors errors={errors} />}

          <h3>Your login details</h3>
          <div className="qg-call-out-box">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="text"
                className="form-control"
                id="email"
                aria-describedby="emailHelp"
                placeholder="Enter email"
                value={user.email}
                onChange={e => setUser(Object.assign({}, user, { email: e.target.value }))}
              />
              <small className="form-text text-muted">
                Please note your updated email address will be required for login
              </small>
            </div>
          </div>

          <h3>Your contact details</h3>
          <div className="qg-call-out-box">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                className="form-control"
                id="first_name"
                placeholder="First name"
                value={user.first_name}
                onChange={e => setUser(Object.assign({}, user, { first_name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                className="form-control"
                id="last_name"
                placeholder="Last name"
                value={user.last_name}
                onChange={e => setUser(Object.assign({}, user, { last_name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="street_address">Street Address</label>
              <input
                type="text"
                className="form-control"
                id="street_address"
                placeholder="Street Address"
                value={user.street_address}
                onChange={e => setUser(Object.assign({}, user, { street_address: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="city_suburb">City/Suburb</label>
              <input
                type="text"
                className="form-control"
                id="city_suburb"
                placeholder="City/Suburb"
                value={user.city_suburb}
                onChange={e => setUser(Object.assign({}, user, { city_suburb: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                className="form-control"
                id="state"
                placeholder="State"
                value={user.state}
                onChange={e => setUser(Object.assign({}, user, { state: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="post_code">Post Code</label>
              <input
                type="text"
                className="form-control"
                id="post_code"
                placeholder="Post Code"
                value={user.post_code}
                onChange={e => setUser(Object.assign({}, user, { post_code: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="text"
                className="form-control"
                id="phone"
                placeholder="Phone Number"
                value={user.phone}
                onChange={e => setUser(Object.assign({}, user, { phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row col-md-12">
            <p>
              <button type="submit" className="qg-btn btn-primary">
                Update details
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export const MyContactDetailsPage: React.FC<PageRoute> = (route: PageRoute) => {
  return (
    <LoginRequired context={route.context}>
      <UserDetailsForm context={route.context} />
    </LoginRequired>
  );
};

const ChangePasswordForm: React.FC<{ context: IAppContext }> = ({ context }) => {
  const [data, setData]: [any, any] = useState({});
  const [errors, setErrors]: [any, any] = useState([]);
  const [showUpdateSuccess, setShowUpdateSuccess]: [boolean, any] = useState(false);

  const onSubmit = () => {
    setErrors([]);
    setShowUpdateSuccess(false);

    Http.get()
      .updatePassword(data)
      .then((response: any) => {
        if (response.status === 'updated') {
          setShowUpdateSuccess(true);
          setData({});
        } else if (response.errors) {
          setErrors(response.errors);
        } else {
          setErrors([{ validation_code: 'Update Failed -- please try again' }]);
        }
      });
  };

  return (
    <div className="row">
      <div className="col-sm-12">
        <h1>Update password</h1>
        {showUpdateSuccess && (
          <div className="alert alert-success" role="alert">
            <p>Password updated.</p>
          </div>
        )}
        <form
          method="GET"
          onSubmit={e => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {errors && errors.length > 0 && <FormErrors errors={errors} />}

          <div className="qg-call-out-box">
            <div className="form-group">
              <label htmlFor="current_password">Current Password</label>
              <input
                type="password"
                className="form-control"
                id="current_password"
                value={data.current_password || ''}
                onChange={e => setData(Object.assign({ ...data }, { current_password: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="new_password">New Password</label>
              <input
                type="password"
                className="form-control"
                id="new_password"
                value={data.password || ''}
                onChange={e => setData(Object.assign({ ...data }, { password: e.target.value }))}
              />
              <div className="form-text text-muted">
                <small>Must be at least 12 characters in length; Include both upper and lower case letters; Include at least one non-letter (numeral, space or punctuation)</small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm_new_password">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                id="confirm_new_password"
                value={data.confirm_password || ''}
                onChange={e => setData(Object.assign({ ...data }, { confirm_password: e.target.value }))}
              />
            </div>
            {data.password && data.password !== data.confirm_password && (
              <small id="passwordHelpInline" className="text-danger">
                Password mismatch
              </small>
            )}
            {data.password && data.password === data.confirm_password && (
              <small id="passwordHelpInline" className="text-success">
                Passwords match!
              </small>
            )}
          </div>

          <div className="form-row col-md-12">
            <p>
              <button type="submit" className="qg-btn btn-primary">
                Update password
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ChangePasswordPage: React.FC<PageRoute> = (route: PageRoute) => {
  return (
    <LoginRequired context={route.context}>
      <ChangePasswordForm context={route.context} />
    </LoginRequired>
  );
};

const AdminUserDetailsForm: React.FC<any> = ({ userId }) => {
  const [user, setUser]: [any, any] = useState({ lock_version: -1 });
  const [userToEdit, setUserToEdit]: [any, any] = useState(null);
  const [errors, setErrors]: [any, any] = useState([]);
  const [showUpdateSuccess, setShowUpdateSuccess]: [boolean, any] = useState(false);
  const updateUserRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Http.get()
      .getUser(userId)
      .then((user: any) => {
        setUser(user);
        setUserToEdit(user);
      });
  },
  // lock_version here is a proxy for the user being updated.
  //
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  [user.lock_version]);

  const onSubmit = (): AxiosResponse => {
    setErrors([]);
    setShowUpdateSuccess(false);

    return Http.get()
      .updateUser(userToEdit)
      .then((response: any) => {
        if (response.status === 'updated') {
          setShowUpdateSuccess(true);
          setUser(Object.assign({ ...userToEdit }, { lock_version: userToEdit.lock_version + 1 }));
        } else if (response.errors) {
          setErrors(response.errors);
        } else {
          setErrors([{ validation_code: 'Update Failed -- please try again' }]);
        }
      });
  };

  return userToEdit ? (
    <div ref={updateUserRef} className="row">
      <div className="col-sm-12">
        <div>
          <small>
            <span aria-hidden="true">«</span> <Link to="/admin/users">Return to user listing</Link>
          </small>
        </div>
        <h1>User management</h1>
        <section>
          <h2>
            Profile for {user.first_name || ''} {user.last_name || ''}
          </h2>

          {showUpdateSuccess && (
            <div className="alert alert-success" role="alert">
              <p>Contact details updated.</p>
            </div>
          )}

          <form
            onSubmit={async (e: SyntheticEvent): Promise<void> => {
              e.preventDefault();
              await onSubmit();
              scrollToRef(updateUserRef);
            }}
          >
            {errors && errors.length > 0 && <FormErrors errors={errors} />}

            <h3>Core details</h3>
            <div className="qg-call-out-box">
              <div className="form-group">
                <label htmlFor="email-address">Email address</label>
                <input
                  type="text"
                  className="form-control"
                  id="email-address"
                  aria-describedby="emailHelp"
                  value={userToEdit.email}
                  placeholder="Enter email"
                  onChange={e => setUserToEdit(Object.assign({ ...userToEdit }, { email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="account-password">Update Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="account-password"
                  placeholder="Password"
                  onChange={e => setUserToEdit(Object.assign({ ...userToEdit }, { password: e.target.value }))}
                />
                <div className="form-text text-muted">
                  <small>Must be at least 12 characters in length; Include both upper and lower case letters; Include at least one non-letter (numeral, space or punctuation)</small>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirm-password"
                  placeholder="Confirm Password"
                  onChange={e => setUserToEdit(Object.assign({ ...userToEdit }, { confirm_password: e.target.value }))}
                />
                {userToEdit && userToEdit.password && userToEdit.password !== userToEdit.confirm_password && (
                  <small id="passwordHelpInline" className="text-danger">
                    Password mismatch
                  </small>
                )}
                {userToEdit && userToEdit.password && userToEdit.password === userToEdit.confirm_password && (
                  <small id="passwordHelpInline" className="text-success">
                    Passwords match!
                  </small>
                )}
              </div>
              <div className="form-group form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="verfied-check"
                  checked={userToEdit.is_verified}
                  onChange={e => setUserToEdit(Object.assign({ ...userToEdit }, { is_verified: e.target.checked }))}
                />
                <label className="form-check-label" htmlFor="verfied-check">
                  Verified account?
                </label>
              </div>
              <div className="form-group form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="admin-check"
                  checked={userToEdit.is_admin}
                  onChange={e => setUserToEdit(Object.assign({ ...userToEdit }, { is_admin: e.target.checked }))}
                />
                <label className="form-check-label" htmlFor="admin-check">
                  Admin account?
                </label>
              </div>
            </div>
            <h3>Verified user details</h3>
            <div className="qg-call-out-box">
              <div className="form-group">
                <label htmlFor="first-name">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="first-name"
                  placeholder="First name"
                  value={userToEdit.first_name}
                  onChange={e => setUserToEdit(Object.assign({ ...userToEdit }, { first_name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="first-name">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="last-name"
                  placeholder="Last name"
                  value={userToEdit.last_name}
                  onChange={e => setUserToEdit(Object.assign({ ...userToEdit }, { last_name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="street_address">Street Address</label>
                <input
                  type="text"
                  className="form-control"
                  id="street_address"
                  placeholder="Street Address"
                  value={userToEdit.street_address}
                  onChange={e => setUserToEdit(Object.assign({}, user, { street_address: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="city_suburb">City/Suburb</label>
                <input
                  type="text"
                  className="form-control"
                  id="suburb"
                  placeholder="City/Suburb"
                  value={userToEdit.city_suburb}
                  onChange={e => setUserToEdit(Object.assign({}, user, { city_suburb: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  className="form-control"
                  id="state"
                  placeholder="State"
                  value={userToEdit.state}
                  onChange={e => setUserToEdit(Object.assign({}, user, { state: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="post_code">Post Code</label>
                <input
                  type="text"
                  className="form-control"
                  id="post_code"
                  placeholder="Post Code"
                  value={userToEdit.post_code}
                  onChange={e => setUserToEdit(Object.assign({}, user, { post_code: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  id="phone"
                  placeholder="Phone Number"
                  value={userToEdit.phone}
                  onChange={e => setUserToEdit(Object.assign({}, user, { phone: e.target.value }))}
                />
              </div>
            </div>

            <p>
              <button type="submit" className="btn btn-primary">
                Update account
              </button>
              &nbsp;&nbsp;<Link to="/admin/users">Return to user listing</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  ) : (
    <></>
  );
};

const UserManagementListing: React.FC<any> = (props: any) => {
  const context = props.context;

  const [page, setPage]: [number, any] = useState(0);
  const [filter, setFilter]: [any, any] = useState({ version: 0 });
  const [results, setResults]: [any, any] = useState({});
  const [redirect, setRedirect]: [any, any] = useState(undefined);

  useEffect(() => {
    Http.get()
      .getUsers(page, filter)
      .then((results: AxiosResponse) => {
        setResults(results);
      });
  },
  // filter.version here is a proxy for the user being updated.
  //
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  [page, filter.version]);

  const onSubmit = () => {
    setPage(0);
    setFilter(Object.assign({ ...filter }, { version: filter.version + 1 }));
  };

  const becomeUser = (user: any, context: IAppContext) => {
    Http.get()
        .becomeUser(user.id)
        .then((json: any) => {
          context.setMasterSessionId(context.sessionId);
          context.setSessionId(json.session_id);
          setRedirect('/my-account');
        });
  };

  if (redirect) {
    return (
      <Redirect to={redirect} />
    )
  }

  return (
    <div className="row">
      <div className="col-sm-12">
        <h1>User management</h1>
        <h2>Filter the user lists</h2>
        <section className="search-input">
          <form
            className="form-inline"
            onSubmit={e => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <div className="qg-call-out-box">
              <div className="form-row">
                <div className="form-group col-xs-12 col-md-4">
                  <label htmlFor="name" className="sr-only">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control-plaintext"
                    id="name"
                    placeholder="Search names"
                    onChange={e => setFilter(Object.assign({ ...filter }, { q: e.target.value }))}
                  />
                </div>
                <div className="input-group col-xs-12 col-md-8">
                  <div className="input-group-prepend">
                    <span className="input-group-text small">Registration date</span>
                  </div>
                  <input
                    type="text"
                    aria-label="Start date"
                    placeholder="start"
                    className="form-control"
                    onChange={e => setFilter(Object.assign({ ...filter }, { start_date: e.target.value }))}
                  />
                  <input
                    type="text"
                    aria-label="End date"
                    placeholder="end"
                    className="form-control"
                    onChange={e => setFilter(Object.assign({ ...filter }, { end_date: e.target.value }))}
                  />
                </div>
                <div className="input-group col-md-12 col-md-8" style={{ marginTop: 10 }}>
                  <button type="submit" className="qg-btn btn-primary">
                    Filter
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>

        <h2>QSA user profiles</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Registration date</th>
              <th scope="col">Verified?</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {results.results &&
              results.results.map((user: any) => (
                <tr key={user.id}>
                  <th scope="row">{user.id}</th>
                  <td>
                    {user.first_name} {user.last_name}
                  </td>
                  <td>{user.email}</td>
                  <td>{new Date(user.create_time).toLocaleDateString()}</td>
                  <td>
                    {user.is_admin ? (
                      <span className="badge badge-info">Admin</span>
                    ) : user.is_verified ? (
                      <span className="badge badge-primary">Verifed</span>
                    ) : (
                      <span className="badge badge-secondary">Not verified</span>
                    )}
                  </td>
                  <td>
                    <Link to={`/admin/users/${user.id}`} className="qg-btn btn-primary btn-xs">
                      Edit Details
                    </Link>&nbsp;
                {
                  user.id !== context.user.id && !user.is_admin &&
                    <button
                      className="qg-btn btn-secondary btn-xs"
                      onClick={e => becomeUser(user, context)}>
                      Become User
                    </button>
                }
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {results && results.results && (
          <nav>
            <div className="text-center">
              <ul className="pagination">
                <li className={'page-item prev ' + (results.current_page === 0 ? 'disabled' : '')}>
                  <button
                    className="page-link"
                    style={{float: 'left'}}
                    onClick={e => {
                      e.preventDefault();
                      window.scrollTo(0,0);
                      setPage(results.current_page - 1);
                    }}
                  >
                    <span aria-hidden="true">«</span> Previous
                  </button>
                </li>
                <li className={'page-item next ' + (results.current_page >= results.max_page ? 'disabled' : '')}>
                  <button
                    className="page-link"
                    style={{float: 'left'}}
                    onClick={e => {
                      e.preventDefault();
                      window.scrollTo(0,0);
                      setPage(results.current_page + 1);
                    }}
                  >
                    Next <span aria-hidden="true">»</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export const UserManagementPage: React.FC<PageRoute> = (route: PageRoute) => {
  const userId: string | null = route.match.params.user_id;

  return (
    <LoginRequired adminOnly={true} context={route.context}>
      {(userId ? <AdminUserDetailsForm userId={userId} /> : <UserManagementListing context={route.context} />)}
    </LoginRequired>
  );
};

const RequestSummary: React.FC<any> = props => {
  const [request] = useState(props.request);

  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <small>
            <span aria-hidden="true">«</span>
            <button className="qg-btn btn-link btn-xs" onClick={() => props.onClear()}>
              Return to listing
            </button>
          </small>
        </div>
        <div className="col-sm-12">
          <h1>Reading Room Request: {request.id}</h1>
          <dl className="row">
            <dt className="col-3">Status</dt>
            <dd className="col-9">{request.status}</dd>
            <dt className="col-3">Date Required</dt>
            <dd className="col-9">{(request.date_required ? new Date(request.date_required).toLocaleDateString() : 'Not yet provided')}</dd>
          </dl>
          <table className="table table-bordered" style={{width: 'auto', maxWidth: '100%'}}>
            <tbody>
              <tr>
                <th>Item ID</th>
                <td>
                  <Link to={uriFor(request.record.controlling_record.qsa_id_prefixed, 'archival_object')} target="_blank">
                    {request.record.qsa_id_prefixed}
                  </Link>
                </td>
                <th>Previous System ID</th>
                <td>
                  {request.record.previous_system_ids.join('; ')}
                </td>
              </tr>
              <tr>
                <th>Dept ID</th>
                <td colSpan={3}>
                  <Link
                    to={uriFor(request.record.responsible_agency._resolved.qsa_id_prefixed, 'agent_corporate_entity')}
                    target="_blank"
                  >
                    {request.record.responsible_agency._resolved.qsa_id_prefixed}&nbsp;
                    {request.record.responsible_agency._resolved.display_string}
                  </Link>
                </td>
              </tr>
              <tr>
                <th>Access</th>
                <td>{(request.record.rap_access_status === 'Open Access' ? 'Open' : 'Closed')}</td>
                <th>Dates</th>
                <td>{formatDateForDisplay(request.record.controlling_record.begin_date || '')} - {formatDateForDisplay(request.record.controlling_record.end_date || '')}</td>
              </tr>
              <tr>
                <th>Description</th>
                <td colSpan={3}>
                  <p>{request.record.display_string}</p>
                  {request.record.controlling_record._resolved.description && <p>request.record.controlling_record._resolved.description</p>}
                  {request.record.description && <p>request.record.description</p>}
                </td>
              </tr>
              <tr>
                <th>Series</th>
                <td colSpan={3}>
                  <Link
                      to={uriFor(request.record.controlling_record._resolved.resource.qsa_id_prefixed, 'resource')}
                      target="_blank"
                  >
                    {request.record.controlling_record._resolved.resource.qsa_id_prefixed}&nbsp;
                    {request.record.controlling_record._resolved.resource.display_string}
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const RequestsSummary: React.FC<any> = props => {
  const [results, setResults] = useState({ results: [] });

  useEffect(() => {
    Http.get()
      .getRequests()
      .then((data: any) => {
        setResults(data);
      });
  }, []);

  return (
    <>
      <h1>My Requests</h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Request Type</th>
            <th scope="col">Status</th>
            <th scope="col">Item</th>
            <th scope="col">Required Date</th>
            <th scope="col">Requested Date</th>
            <th scope="col" />
          </tr>
        </thead>
        <tbody>
          {results.results &&
            results.results.map((request: any) => (
              <tr key={request.id}>
                <td>{request.id}</td>
                <td>{request.request_type}</td>
                <td>{request.status}</td>
                <td>
                  <Link to={uriFor(request.record.controlling_record.qsa_id_prefixed, 'archival_object')}>
                    {request.record.qsa_id_prefixed}
                  </Link>
                  &nbsp;
                  <Link to={uriFor(request.record.controlling_record.qsa_id_prefixed, 'archival_object')}>
                    {request.record.display_string}
                  </Link>
                </td>
                <td>{request.date_required && new Date(request.date_required).toLocaleDateString()} {request.time_required}</td>
                <td>{new Date(request.create_time).toLocaleString()}</td>
                <td>
                  <button className="qg-btn btn-primary btn-xs" onClick={() => props.onSelectRequest(request)}>
                    View Request
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
};

export const MyRequestsPage: React.FC<PageRoute> = (route: PageRoute) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  return (
    <LoginRequired context={route.context}>
      {
        selectedRequest ? (
          <RequestSummary context={route.context} request={selectedRequest} onClear={() => setSelectedRequest(null)} />
        ) : (
          <RequestsSummary context={route.context} onSelectRequest={setSelectedRequest} />
        )
      }
    </LoginRequired>
  );
};

const TagModeration: React.FC<any> = props => {
  const [flaggedTags, setFlaggedTags]: [any, any] = useState([]);
  const [refreshTags, setRefreshTags]: [any, any] = useState(0);

  useEffect(() => {
    Http.get().getAllFlaggedTags().then((json: any) => {
      setFlaggedTags(json);
    });
  }, [refreshTags]);

  const moderateTag = (tagId: string, action: string) => {
    Http.get().moderateTag(tagId, action).then(() => {
      setRefreshTags(refreshTags + 1);
    });
  };

  const unflagTag = (tagId: string) => {
    moderateTag(tagId, 'unflag');
  };

  const deleteTag = (tagId: string) => {
    moderateTag(tagId, 'delete');
  };

  const banTag = (tagId: string) => {
    moderateTag(tagId, 'ban');
  };

  return (
    <>
      <h1>Tag management</h1>
      <div className="alert alert-warning">
        <p>By showing the list of banned tags, you may see some copy that is offensive and inappropriate. Are you sure you want to see this message list?</p>
        <p><Link to="/admin/banned-tags">Manage banned tags</Link></p>
      </div>

      <br/>

      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th style={{width: '40%'}}>Tag</th>
            <th style={{width: '10%'}}>Record</th>
            <th style={{width: '20%'}}>Date Reported</th>
            <th/>
          </tr>
        </thead>
        <tbody>
          {
            flaggedTags.length === 0 && <tr><td colSpan={4} className="table-info">No tags to moderate</td></tr>
          }
          {
            flaggedTags.map((tag: any) => (
              <tr key={tag.id}>
                <td>{tag.tag}</td>
                <td>
                  <Link to={uriFor(tag.record.qsa_id_prefixed, tag.record.jsonmodel_type)}>
                    {tag.record.qsa_id_prefixed}
                  </Link>
                </td>
                <td>
                  {new Date(tag.date_flagged).toLocaleString()}
                </td>
                <td>
                  <button className="qg-btn btn-success btn-xs" onClick={(e) => unflagTag(tag.id)}>
                    <i aria-hidden="true" className="fa fa-thumbs-up"/> Unflag
                  </button>&nbsp;
                  <button className="qg-btn btn-warning btn-xs" onClick={(e) => deleteTag(tag.id)}>
                    <i aria-hidden="true" className="fa fa-thumbs-down"/> Remove
                  </button>&nbsp;
                  <button className="qg-btn btn-danger btn-xs" onClick={(e) => banTag(tag.id)}>
                    <i aria-hidden="true" className="fa fa-ban"/> Remove and Ban
                  </button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </>
  );
}

export const TagManagementPage: React.FC<PageRoute> = (route: PageRoute) => {

  return (
      <LoginRequired adminOnly={true} context={route.context}>
        <TagModeration />
      </LoginRequired>
  );
};

const BannedTags: React.FC<any> = props => {
  const [tagsToBan, setTagsToBan] = useState('');
  const [tagsToUnban, setTagsToUnban] = useState('');
  const [bannedTags, setBannedTags]: [any, any] = useState([]);
  const [refreshTags, setRefreshTags] = useState(0);

  useEffect(() => {
    Http.get().getBannedTags().then((json: any) => {
      setBannedTags(json);
    });
  }, [refreshTags]);

  const addToBannedTags = () => {
    Http.get().addToBannedTags(tagsToBan.split('\n')).then(() => {
      setTagsToBan('');
      setRefreshTags(refreshTags + 1);
    })
  };

  const removeFromBannedTags = () => {
    Http.get().removeFromBannedTags(tagsToUnban.split('\n')).then(() => {
      setTagsToUnban('');
      setRefreshTags(refreshTags + 1);
    })
  };

  return (
    <>
      <h1>Banned tags</h1>

      <div className="row">
        <div className="col-sm-6">
          <form onSubmit={(e) => {e.preventDefault(); addToBannedTags()}}>
            <textarea className="form-control" value={tagsToBan} onChange={(e) => setTagsToBan(e.target.value)} placeholder="One tag per line"/>
            <button type="submit" className="qg-btn btn-primary btn-sm pull-right">Add to banned tags</button>
          </form>
        </div>
        <div className="col-sm-6">
          <form onSubmit={(e) => {e.preventDefault(); removeFromBannedTags()}}>
            <textarea className="form-control" value={tagsToUnban} onChange={(e) => setTagsToUnban(e.target.value)} placeholder="One tag per line"/>
            <button type="submit" className="qg-btn btn-danger btn-sm pull-right">Remove from banned tags</button>
          </form>
        </div>
      </div>

      <br/>

      <section className="qg-accordion qg-dark-accordion" aria-label="Accordion Label">
        <div className="alert alert-warning">By showing the list of banned tags, you may see some copy that is offensive and inappropriate.</div>
        <AccordionPanel
            id="banned_tags"
            title="List of banned tags"
            children={<div className="banned-tags-listing">
              {
                bannedTags.map((tag: any) => (<div key={tag}>{tag}</div>))
              }
            </div>}
        />
      </section>
    </>
  );
}

export const BannedTagsManagementPage: React.FC<PageRoute> = (route: PageRoute) => {
  return (
      <LoginRequired adminOnly={true} context={route.context}>
        <BannedTags />
      </LoginRequired>
  );
};

export const PageList: React.FC<any> = () => {
  const [pageList, setPageList]: [any, any] = useState(null);

  useEffect(() => {
    Http.get().listPages().then((json: any) => {
      setPageList(json);
    });
  }, []);

  const deletePage = (slug: string) => {
    Http.get().deletePage(slug).then((json: any) => {
      setPageList(json);
    });
  };

  const restorePage = (slug: string) => {
    Http.get().restorePage(slug).then((json: any) => {
      setPageList(json);
    });
  };


  if (!pageList) {
    return <></>;
  }

  if (pageList.length === 0) {
    return <p>No pages defined yet</p>;
  }

  return (
    <>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Page name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            pageList.map((page: any) => (
              <tr key={page.slug}>
                <td style={{width: '75%'}}><Link target="_blank" to={`/pages/${page.slug}`}>{page.slug}</Link></td>
                <td style={{width: '25%'}} className="page-table-actions">
                  {!page.deleted && <Link to={`/admin/pages/${page.slug}`} className="qg-btn btn-xs btn-secondary">Edit</Link>}
                  {page.hidden && <span className="badge badge-primary" title="This page is not visible to the public">hidden</span>}
                  {(() => {
                    if (page.locked) {
                      return <span className="badge badge-primary" title="Used by the system and can't be removed">locked</span>;
                    } else if (page.deleted) {
                      return <button onClick={() => { restorePage(page.slug) }} className="qg-btn btn-xs btn-secondary">Restore</button>;
                    } else {
                      return <button onClick={() => { deletePage(page.slug) }} className="qg-btn btn-xs btn-secondary">Delete</button>;
                    }
                  })()}
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </>
  );
}

export const PageEdit: React.FC<any> = (props: any) => {
  const [slug, setSlug]: [any, any] = useState(props.slug || '');
  const [content, setContent]: [any, any] = useState(props.slug ? undefined : '');

  const [completed, setCompleted] = useState(false);
  const [errors, setErrors]: [any, any] = useState([]);

  useEffect(() => {
    if (props.slug) {
      Http.get().getPageContent(props.slug, '' + Math.random()).then((content: string) => {
        setContent(content);
      });
    }
  }, [props.slug]);

  const updateSluggo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase());
  };

  const savePage = (e: React.FormEvent) => {
    e.preventDefault();

    Http.get()
        .savePage(slug, content, !props.slug)
        .then((response: any) => {
          ClientState.refreshNonce();
          if (response.data.status === 'success') {
            setCompleted(true);
          } else if (response.data.errors) {
            setErrors(response.data.errors);
          }
        })
        .catch(() => {
          setErrors([{
            SERVER_ERROR: {message: "Unknown error while saving.  Please copy your changes somewhere safe and reload!"}
          }]);
        });

    return false;
  };

  if (completed) {
    return <Redirect to="/admin/pages" push={true} />
  }

  return (<form onSubmit={savePage}>
    {errors && errors.length > 0 && <FormErrors errors={errors} />}

    <div>
      <label htmlFor="slug">Page slug</label>
    </div>
    <div>
      {props.slug ?
        <>
          <span className="text-muted">{props.slug}</span>
        </> :
        <input type="text" id="slug" name="slug" onChange={updateSluggo} value={slug} required></input>
      }
    </div>
    <br />

    {typeof(content) === 'string' &&
      <RichText value={content} onChange={setContent} />
    }

    <br />
    <button className="qg-btn btn-primary">Save</button>&nbsp;
    <Link to="/admin/pages" className="qg-btn btn-secondary">Cancel</Link>

  </form>);
}

export const PageManagementPage: React.FC<PageRoute> = (route: PageRoute) => {
  return (
    <LoginRequired adminOnly={true} context={route.context}>
      {
        (() => {
          if (route.match.params.slug && route.match.params.slug !== 'new') {
            return <PageEdit slug={route.match.params.slug} />;
          } else if (route.match.params.slug && route.match.params.slug === 'new') {
            return <PageEdit />;
          } else {
            return <>
              <h1>Pages</h1>
              <p>Use pages to define publicly visible rich text content.</p>

              <PageList />

              <Link to="/admin/pages/new" className="qg-btn btn-primary">Add Page</Link>
            </>
          }
        })()
      }
    </LoginRequired>
  );
};

export const SavedSearches: React.FC<any> = (props: any) => {
  const [results, setResults]: [any, any] = useState([]);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [unsaved, setUnsaved]: [string[], any] = useState([]);

  useEffect(() => {
    Http.get()
        .getSavedSearches()
        .then((data: any) => {
          setResults(data);
        });
  }, [forceRefresh]);

  const deleteSavedSearch = (id: string) => {
    Http.get()
        .deleteSavedSearch(id)
        .then(() => {
          setForceRefresh(forceRefresh + 1);
        });
  };

  const setNoteChange = (id: string, note: string) => {
    setResults(results.map((result: any) => {
      if (result.id === id) {
        result.note = note;
        if (unsaved.indexOf(id) < 0) {
          setUnsaved(unsaved.concat([id]));
        }
      }

      return result;
    }));
  };

  const updateNote = (id: string, note: string) => {
    Http.get()
        .updateSavedSearch(id, note)
        .then(() => {
          setUnsaved(unsaved.filter((anId :string) => {
            return anId !== id;
          }));
          setForceRefresh(forceRefresh+1);
        });
  };

  return (
      <>
        <h1>My searches</h1>
        <table className="table table-striped">
          <thead>
          <tr>
            <th scope="col">Search Summary</th>
            <th scope="col">Notes</th>
            <th scope="col">Date Saved</th>
            <th scope="col" />
          </tr>
          </thead>
          <tbody>
          {results.map((savedSearch: any) => (
              <tr key={savedSearch.id}>
                <td>
                  <CompactSearchSummary
                      advancedSearchQuery={AdvancedSearchQuery.fromQueryString(savedSearch.query_string)}
                      limitedTo={[]}
                      modifySearch={() => {}}
                      summaryOnly={true}
                  />
                </td>
                <td>
                  <textarea className="form-control" onChange={(e) => setNoteChange(savedSearch.id, e.target.value)} value={savedSearch.note}/>
                  {
                    unsaved.indexOf(savedSearch.id) >= 0 &&
                    <button className="qg-btn btn-primary btn-xs" onClick={() => updateNote(savedSearch.id, savedSearch.note)}>
                      Update Note
                    </button>
                  }
                </td>
                <td>{new Date(savedSearch.create_time).toLocaleString()}</td>
                <td>
                  <Link
                      to={'/search?' + savedSearch.query_string}
                      className="qg-btn btn-secondary btn-xs"
                  >
                    View Results
                  </Link>
                  <div><button onClick={(e) => deleteSavedSearch(savedSearch.id)} className="qg-btn btn-danger btn-xs">Delete</button></div>
                </td>
              </tr>
          ))}
          </tbody>
        </table>
      </>
  );
};

export const MySearchesPage: React.FC<PageRoute> = (route: PageRoute) => {
  return (
      <LoginRequired context={route.context}>
        <SavedSearches context={route.context} />
      </LoginRequired>
  );
};
