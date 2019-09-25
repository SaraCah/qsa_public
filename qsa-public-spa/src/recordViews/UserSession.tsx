import React, {useState} from "react";
import {Link, Redirect} from "react-router-dom";
import Layout from "./Layout";
import {RecordContext} from "./Helpers";
import {Http} from "../utils/http";

import AppContext from '../models/AppContext';


export const UserSession: React.FC = () => {

    const logout = (appContext: any) => {
        appContext.clearSession();
    }

    return (
        <AppContext.Consumer>
            {
                (context: any) => (
                    <>
                        { context.sessionLoaded &&
                          <div className="login-box pull-right">
                              { context.user ?
                                <div>
                                    Hello, { context.user.first_name || '' } { context.user.last_name || '' }
                                    &nbsp;|<button onClick={ (e) => logout(context) } className="qg-btn btn-link btn-xs">Logout</button>
                                </div> :
                                <Link to="/login">Login</Link>
                              }
                          </div>
                        }
                    </>
                )
            }
        </AppContext.Consumer>
    )
}

export const LoginPage: React.FC<any> = (route: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showLoginFailed, setShowLoginFailed] = useState(false);
    const [needsRedirect, setNeedsRedirect] = useState('');

    const onSubmit = (e: any, appContext: any) => {
        setShowLoginFailed(false);
        Http.get().login(email, password).then((login_response: any) => {
            if (login_response.authenticated) {
                appContext.setSessionId(login_response.session_id);
                setNeedsRedirect('/')
            } else {
                appContext.setUser(null);
                setShowLoginFailed(true);
            }
        })
    }

    if (needsRedirect) {
        return <Redirect to={ needsRedirect } push={ true } ></Redirect>;
    }

    return (
        <AppContext.Consumer>
        {
            (context: any) => (
            <Layout>
                <div className="row">
                    <div className="col-sm-12">
                        <h1>Login</h1>
                        <form method="GET" onSubmit={ (e) => { e.preventDefault(); onSubmit(e, context) } } className="form-inline">
                            <div className="qg-call-out-box">
                                { showLoginFailed &&
                                    <div className="alert alert-warning" role="alert" style={ {marginBottom: 20} }>
                                        <p>Invalid email or password.</p>
                                    </div>
                                }
                                <div className="form-row">
                                    <div className="form-group col-xs-12 col-sm-6">
                                        <label htmlFor="email"
                                               className="sr-only">Email Address</label>
                                        <input type="text"
                                               className="form-control-plaintext"
                                               id="email" placeholder="Email Address"
                                               onChange={ (e) => setEmail(e.target.value) } />
                                    </div>
                                    <div className="form-group col-xs-12 col-sm-6">
                                        <label htmlFor="password"
                                               className="sr-only">Password</label>
                                        <input type="password"
                                               className="form-control-plaintext"
                                               id="password" placeholder="Password"
                                               onChange={ (e) => setPassword(e.target.value) } />
                                    </div>
                                </div>

                                <p>
                                    <small>New user? <Link to="/register">Create an account here</Link></small>
                                </p>
                            </div>

                            <div className="form-row col-md-12">
                                <p>
                                    <button type="submit"
                                            className="qg-btn btn-primary">Login
                                    </button>
                                </p>
                            </div>
                        </form>

                    </div>
                </div>
            </Layout>
            )
        }
        </AppContext.Consumer>
    );
}
