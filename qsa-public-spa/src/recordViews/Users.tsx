import React, { useEffect, useState, useRef, SyntheticEvent } from 'react';
import { Http } from '../utils/http';
import { Redirect } from 'react-router';
import AppContext from '../context/AppContext';
import Layout from './Layout';
import { Link } from 'react-router-dom';
import { UserForm } from '../models/User';
import { errorMessageForCode, snakeToUppercaseInitials, uriFor } from '../utils/typeResolver';
import { AxiosResponse } from 'axios';

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
        Errors registering user:
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

export const RegisterPage: React.FC<any> = (route: any) => {
  const [user, setUser]: [UserForm | undefined, any] = useState();
  const [errors, setErrors]: [any, any] = useState([]);
  const [showRegisterSuccess, setShowRegisterSuccess]: [boolean, any] = useState(false);

  const emptyUser = () => {
    return {
      email: '',
      password: '',
      confirm_password: ''
    };
  };

  const onSubmit = (e: any) => {
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
      <Layout>
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

  return (
    <Layout>
      <div className="row">
        <div className="col-sm-12">
          <h1>Register</h1>

          <form
            method="GET"
            onSubmit={e => {
              e.preventDefault();
              onSubmit(e);
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

            <div className="form-row col-md-12">
              <p>
                <button type="submit" className="qg-btn btn-primary">
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
              <h2>Request list</h2>
              <p>Review a daily request list including printing request slips</p>
              <a href="#" className="btn btn-primary">
                Request list
              </a>
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
              <h2>Admin ordering</h2>
              <p>Order items or lodge a request on behalf of a user</p>
              <a href="#" className="btn btn-primary">
                Admin ordering
              </a>
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
      </section>
    </>
  );
};

const LoginRequired: React.FC<any> = (props: any) => {
  return (
    <AppContext.Consumer>
      {(context: any) =>
        !context.sessionLoaded ? (
          <Layout skipFooter={true} />
        ) : context.user && ((props.adminOnly && context.user.is_admin) || !props.adminOnly) ? (
          <Layout showNavForUser={true}>{props.children}</Layout>
        ) : props.adminOnly ? (
          <Redirect to="/404" push={true} />
        ) : (
          <Redirect to="/login" push={true} />
        )
      }
    </AppContext.Consumer>
  );
};

export const MyAccountPage: React.FC<any> = (route: any) => {
  return (
    <LoginRequired>
      <AppContext.Consumer>
        {(context: any) => (context.user.is_admin ? <AdminAccountSummary /> : <UserAccountSummary />)}
      </AppContext.Consumer>
    </LoginRequired>
  );
};

const UserDetailsForm: React.FC<{ context: any }> = ({ context }) => {
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

export const MyContactDetailsPage: React.FC<any> = (route: any) => {
  return (
    <LoginRequired>
      <AppContext.Consumer>{(context: any) => <UserDetailsForm context={context} />}</AppContext.Consumer>
    </LoginRequired>
  );
};

const ChangePasswordForm: React.FC<{ context: any }> = ({ context }) => {
  const [data, setData]: [any, any] = useState({});
  const [errors, setErrors]: [any, any] = useState([]);
  const [showUpdateSuccess, setShowUpdateSuccess]: [boolean, any] = useState(false);

  const onSubmit = (e: any) => {
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
            onSubmit(e);
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

export const ChangePasswordPage: React.FC<any> = (route: any) => {
  return (
    <LoginRequired>
      <AppContext.Consumer>{(context: any) => <ChangePasswordForm context={context} />}</AppContext.Consumer>
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
  }, [user.lock_version]);

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

const UserManagementListing: React.FC = () => {
  const [page, setPage]: [number, any] = useState(0);
  const [filter, setFilter]: [any, any] = useState({ version: 0 });
  const [results, setResults]: [any, any] = useState({});

  useEffect(() => {
    Http.get()
      .getUsers(page, filter)
      .then((results: AxiosResponse) => {
        setResults(results);
        console.log(results);
      });
  }, [page, filter.version]);

  const onSubmit = () => {
    setPage(0);
    setFilter(Object.assign({ ...filter }, { version: filter.version + 1 }));
  };

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
                    </Link>
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
                  <a
                    className="page-link"
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      setPage(results.current_page - 1);
                    }}
                  >
                    <span aria-hidden="true">«</span> Previous
                  </a>
                </li>
                <li className={'page-item next ' + (results.current_page >= results.max_page ? 'disabled' : '')}>
                  <a
                    className="page-link"
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      setPage(results.current_page + 1);
                    }}
                  >
                    Next <span aria-hidden="true">»</span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export const UserManagementPage: React.FC<any> = (route: any) => {
  const userId: string | null = route.match.params.user_id;

  return (
    <LoginRequired adminOnly={true}>
      <AppContext.Consumer>
        {(context: any) => (userId ? <AdminUserDetailsForm userId={userId} /> : <UserManagementListing />)}
      </AppContext.Consumer>
    </LoginRequired>
  );
};

const RequestSummary: React.FC<any> = props => {
  const [request, setRequest] = useState(props.request);

  const refreshRequest = () => {
    Http.get().getRequestStatus(request.id);
  };

  const setStatus = (status: string) => {
    Http.get()
      .setRequestStatus(request.id, status)
      .then(refreshRequest);
  };

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
        <div>
          <h1>Reading Room Request: {request.id}</h1>
          <dl className="row">
            <dt className="col-3">Status</dt>
            <dd className="col-9">{request.status}</dd>
            <dt className="col-3">Date Required</dt>
            <dd className="col-9">{new Date(request.date_required).toLocaleDateString()}</dd>
          </dl>
          <table className="table table-bordered">
            <tbody>
              <tr>
                <th scope="row" colSpan={2}>
                  Queensland State Archive
                </th>
                <th scope="row" colSpan={2}>
                  Client copy
                </th>
              </tr>
              <tr>
                <th>Item ID</th>
                <td>
                  <Link to={uriFor(request.record.parent_qsa_id, 'archival_object')} target="_blank">
                    {request.record.qsa_id_prefixed}
                  </Link>
                </td>
                <th>Previous System ID</th>
                <td>
                  {request.record.external_ids.map((external_id: any) => (
                    <div>
                      {external_id.source}: {external_id.external_id}
                    </div>
                  ))}
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
                <td>{request.record.rap_access_status}</td>
                <th>Dates</th>
                <td>FIXME need to map dates</td>
              </tr>
              <tr>
                <th>Description</th>
                <td colSpan={3}>
                  <p>{request.record.display_string}</p>
                  {request.record.description && <p>request.record.description</p>}
                </td>
              </tr>
              <tr>
                <th>Series ID</th>
                <td colSpan={3}>FIXME need to map Series ID</td>
              </tr>
              <tr>
                <th>Home location</th>
                <td>FIXME need to map home location</td>
                <th>Top Container ID</th>
                <td>FIXME need to map top container ID</td>
              </tr>
              <tr>
                <th>Researcher ID</th>
                <td>
                  {props.context.user.first_name} {props.context.user.last_name}
                </td>
                <th>Date Requested</th>
                <td>{new Date(request.date_required).toLocaleDateString()}</td>
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
            <th scope="col">Item Title</th>
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
                  <Link to={uriFor(request.record.parent_qsa_id, 'archival_object')}>
                    {request.record.display_string}
                  </Link>
                </td>
                <td>{request.date_required && new Date(request.date_required).toLocaleDateString()}</td>
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

export const MyRequestsPage: React.FC<any> = (route: any) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  return (
    <LoginRequired>
      <AppContext.Consumer>
        {(context: any) =>
          selectedRequest ? (
            <RequestSummary context={context} request={selectedRequest} onClear={() => setSelectedRequest(null)} />
          ) : (
            <RequestsSummary context={context} onSelectRequest={setSelectedRequest} />
          )
        }
      </AppContext.Consumer>
    </LoginRequired>
  );
};
