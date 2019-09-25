import React, {useState} from "react";
import {Link} from "react-router-dom";
import Layout from "./Layout";
import {RecordContext} from "./Helpers";
import {Http} from "../utils/http";

export const UserSession: React.FC = () => {

    return (
        <div className="pull-right">
            <Link to="/login">Login</Link>
        </div>
    )
}

export const LoginPage: React.FC<any> = (route: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showLoginFailed, setShowLoginFailed] = useState(false);

    const onSubmit = (e: any) => {
        Http.login(email, password).then((login_response: any) => {
            console.log(login_response);
        })
    }

    return (
        <Layout>
            <div className="row">
                <div className="col-sm-12">
                    <h1>Login</h1>
                    <form method="GET" onSubmit={ (e) => { e.preventDefault(); onSubmit(e) } } className="form-inline">
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