import React, {useEffect, useState} from "react";
import {Http} from "../utils/http";
import {Redirect} from "react-router";
import AppContext from "../context/AppContext";
import Layout from "./Layout";
import {Link} from "react-router-dom";
import {UserForm} from "../models/User";
import {
    errorMessageForCode,
    snakeToUppercaseInitials
} from "../utils/typeResolver";

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
        return "Error occurred";
    }

    const fieldLabel = (field: string) => {
        return snakeToUppercaseInitials(field);
    }

    return (
        <div className="alert alert-warning" role="alert">
            <h2><i className="fa fa-exclamation-triangle"></i>Errors registering user:</h2>
            <ol>
                { errors.map((error: any, idx: number) => (
                    <li key={ idx }>
                        { 
                            error.field ?
                                <span>{ fieldLabel(error.field) } - { errorMessage(error) }</span> :
                                <span>{ errorMessage(error) }</span>
                        }
                    </li>
                )) }
            </ol>
        </div>
    )    
}


export const RegisterPage: React.FC<any> = (route: any) => {
    const [user, setUser]: [UserForm|undefined, any] = useState();
    const [errors, setErrors]: [any, any] = useState([]);
    const [showRegisterSuccess, setShowRegisterSuccess]: [boolean, any] = useState(false);

    const emptyUser = () => {
        return {
            email: '',
            password: '',
            confirm_password: '',
        }
    }

    const onSubmit = (e: any) => {
        setErrors([]);
        if (user) {
            Http.get().register(user).then((response: any) => {
                if (response.status === 'created') {
                    setShowRegisterSuccess(true);
                    setUser(emptyUser());
                } else if (response.errors) {
                    setErrors(response.errors);
                } else {
                    setErrors([{validation_code: "Registration Failed -- please try again"}]);
                }
            })
        }
    }

    useEffect(() => {
        setUser(emptyUser());
    }, []);

    if (showRegisterSuccess) {
        return (
            <Layout>
                <div className="alert alert-success" role="alert">
                    <h2><i className="fa fa-check-circle"></i>Registration Success</h2>
                    <p>Please proceed to <Link to="/login">login</Link>.</p>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="row">
                <div className="col-sm-12">
                    <h1>Register</h1>

                    <form method="GET" onSubmit={ (e) => { e.preventDefault(); onSubmit(e) } }>
                        {
                            errors && errors.length > 0 &&
                            <FormErrors errors={ errors } />
                        }

                        <h3>Your login details</h3>
                        <div className="qg-call-out-box">

                            <div className="form-group">
                                <label htmlFor="email">Email address</label>
                                <input type="text" className="form-control"
                                       id="email"
                                       aria-describedby="emailHelp"
                                       placeholder="Enter email"
                                       onChange={ (e) => setUser(Object.assign({}, user, {email: e.target.value}))} />
                            </div>
                            <div className="form-group">
                                <label
                                    htmlFor="password">Password</label>
                                <input type="password" className="form-control"
                                       id="password"
                                       placeholder="Password"
                                       onChange={ (e) => setUser(Object.assign({}, user, {password: e.target.value}))} />
                            </div>
                            <div className="form-group">
                                <label
                                    htmlFor="confirm_password">Confirm Password</label>
                                <input type="password" className="form-control"
                                       id="confirm_password"
                                       placeholder="Confirm Password"
                                       onChange={ (e) => setUser(Object.assign({}, user, {confirm_password: e.target.value}))} />
                                {
                                    user && user.password && user.confirm_password && user.password !== user.confirm_password &&
                                    <small id="passwordHelpInline" className="text-danger">
                                        Password mismatch
                                    </small>
                                }
                                {
                                    user && user.password && user.confirm_password && user.password === user.confirm_password &&
                                    <small id="passwordHelpInline" className="text-success">
                                        Passwords match!
                                    </small>
                                }
                            </div>
                        </div>

                        <h3>Your contact details</h3>
                        <div className="qg-call-out-box">

                            <div className="form-group">
                                <label htmlFor="first_name">First Name</label>
                                <input type="text" className="form-control"
                                       id="first_name" placeholder="First name"
                                       onChange={ (e) => setUser(Object.assign({}, user, {first_name: e.target.value}))} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="last_name">Last Name</label>
                                <input type="text" className="form-control"
                                       id="last_name" placeholder="Last name"
                                       onChange={ (e) => setUser(Object.assign({}, user, {last_name: e.target.value}))} />
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
    )
}

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
                            <Link to="/my-details" className="btn btn-primary">My contact details</Link>
                        </div>
                    </div>
                </article>
                <article className="qg-card col-12 col-sm-6 col-lg-4">
                    <div className="content">
                        <div className="details">
                            <h2>Change password</h2>
                            <p>Change your password</p>
                            <a href="#" className="btn btn-primary">Change password</a>
                        </div>
                    </div>
                </article>
                <article className="qg-card col-12 col-sm-6 col-lg-4">
                    <div className="content">
                        <div className="details">
                            <h2>Request list</h2>
                            <p>Review a daily request list including
                                printing request slips</p>
                            <a href="#" className="btn btn-primary">Request
                                list</a>
                        </div>
                    </div>
                </article>
                <article className="qg-card col-12 col-sm-6 col-lg-4">
                    <div className="content">
                        <div className="details">
                            <h2>User management</h2>
                            <p>Review users, validate online users and
                                review account profiles</p>
                            <a href="#" className="btn btn-primary">User
                                management</a>
                        </div>
                    </div>
                </article>
                <article className="qg-card col-12 col-sm-6 col-lg-4">
                    <div className="content">
                        <div className="details">
                            <h2>Admin ordering</h2>
                            <p>Order items or lodge a request on behalf of a
                                user</p>
                            <a href="#" className="btn btn-primary">Admin
                                ordering</a>
                        </div>
                    </div>
                </article>
            </section>
        </>
    )
}

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
                            <Link to="/my-details" className="btn btn-primary">My contact details</Link>
                        </div>
                    </div>
                </article>
                <article className="qg-card col-12 col-sm-6 col-lg-4">
                    <div className="content">
                        <div className="details">
                            <h2>Change password</h2>
                            <p>Change your password</p>
                            <a href="#" className="btn btn-primary">Change password</a>
                        </div>
                    </div>
                </article>
                <article className="qg-card col-12 col-sm-6 col-lg-4">
                    <div className="content">
                        <div className="details">
                            <h2>My requests</h2>
                            <p>Review all of your request slips</p>
                            <a href="#" className="btn btn-primary">My requests</a>
                        </div>
                    </div>
                </article>
            </section>
        </>
    )
}

const LoginRequired: React.FC<any> = (props: any) => {
    return (
        <AppContext.Consumer>
            {
                (context: any) => (
                    !context.sessionLoaded ?
                        <Layout skipFooter={ true }></Layout> :
                        context.user ?
                            <Layout showNavForUser={ true }>
                                {
                                    props.children
                                }
                            </Layout> :
                            <Redirect to="/login" push={ true } />

                )
            }
        </AppContext.Consumer>
    )
}

export const MyAccountPage: React.FC<any> = (route: any) => {
    return (
        <LoginRequired>
            <AppContext.Consumer>
                {
                    (context: any) => (
                        context.user.is_admin ?
                            <AdminAccountSummary></AdminAccountSummary> :
                            <UserAccountSummary></UserAccountSummary>
                    )
                }
            </AppContext.Consumer>
        </LoginRequired>
    )
}

const UserDetailsForm: React.FC<{ context: any }> = ({ context }) => {
    const [user, setUser]: [UserForm, any] = useState({...context.user});
    const [errors, setErrors]: [any, any] = useState([]);
    const [showUpdateSuccess, setShowUpdateSuccess]: [boolean, any] = useState(false);

    const onSubmit = (e: any) => {
        setErrors([]);
        setShowUpdateSuccess(false);

        Http.get().updateUser(user).then((response: any) => {
            if (response.status === 'updated') {
                setShowUpdateSuccess(true);
                Http.get().getCurrentUser().then((response) => {
                    context.setUser(response.data);
                    setUser(response.data);
                });
            } else if (response.errors) {
                setErrors(response.errors);
            } else {
                setErrors([{validation_code: "Update Failed -- please try again"}]);
            }
        })
    }

    return (
        <div className="row">
            <div className="col-sm-12">
                <h1>My contact details</h1>
                {
                    showUpdateSuccess &&
                    <div className="alert alert-success" role="alert">
                        <p>Contact details updated.</p>
                    </div>
                }
                <form method="GET" onSubmit={ (e) => { e.preventDefault(); onSubmit(e) } }>
                    {
                        errors && errors.length > 0 &&
                        <FormErrors errors={ errors } />
                    }

                    <h3>Your login details</h3>
                    <div className="qg-call-out-box">
                        <div className="form-group">
                            <label htmlFor="email">Email address</label>
                            <input type="text" className="form-control"
                                   id="email"
                                   aria-describedby="emailHelp"
                                   placeholder="Enter email"
                                   value={ user.email }
                                   onChange={ (e) => setUser(Object.assign({}, user, {email: e.target.value}))} />
                            <small className="form-text text-muted">
                                Please note your updated email address will be required for login
                            </small>
                        </div>
                    </div>

                    <h3>Your contact details</h3>
                    <div className="qg-call-out-box">
                        <div className="form-group">
                            <label htmlFor="first_name">First Name</label>
                            <input type="text" className="form-control"
                                   id="first_name" placeholder="First name"
                                   value={ user.first_name }
                                   onChange={ (e) => setUser(Object.assign({}, user, {first_name: e.target.value}))} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="last_name">Last Name</label>
                            <input type="text" className="form-control"
                                   id="last_name" placeholder="Last name"
                                   value={ user.last_name }
                                   onChange={ (e) => setUser(Object.assign({}, user, {last_name: e.target.value}))} />
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
    )
}

export const MyContactDetailsPage: React.FC<any> = (route: any) => {
    return (
        <LoginRequired>
            <AppContext.Consumer>
                {
                    (context: any) => (
                        <UserDetailsForm context={ context }/>
                    )
                }
            </AppContext.Consumer>
        </LoginRequired>
    )
}