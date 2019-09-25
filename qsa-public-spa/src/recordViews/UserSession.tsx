import React, {useState} from "react";
import {Link} from "react-router-dom";
import Layout from "./Layout";
import {RecordContext} from "./Helpers";
import {Http} from "../utils/http";

import AppContext from '../models/AppContext';


export const UserSession: React.FC = () => {

    return (
        <AppContext.Consumer>
            {
                (context: any) => (
                    <>
                        { context.sessionLoaded &&
                          <div className="pull-right">
                              { context.user ?
                                <p>Hello, { context.user.first_name || '' } { context.user.last_name || '' }</p> :
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

    const onSubmit = (e: any, appContext: any) => {
        Http.get().login(email, password).then((login_response: any) => {
            if (login_response.authenticated) {
                appContext.setSessionId(login_response.session_id);
            } else {
                appContext.setUser(null);
            }
            console.log(login_response);
        })
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
