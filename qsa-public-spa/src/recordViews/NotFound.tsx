import React from 'react';
import {RouteComponentProps} from "react-router-dom";
import Layout from './Layout';

const NotFound: React.FC<RouteComponentProps<any>> = (route: RouteComponentProps<any>) => {
    return (
        <Layout noindex={ true }>
            Sorry, page not found.
        </Layout>
    );
}

export default NotFound;
