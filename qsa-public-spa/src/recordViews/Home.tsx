import React from 'react';
import {RouteComponentProps} from "react-router-dom";
import Layout from './Layout';
import AspaceAdvancedSearch from '../advancedSearch/AdvancedSearch'
import {AdvancedSearchQuery} from "../models/AdvancedSearch";

const HomePage: React.FC<RouteComponentProps<any>> = (route: RouteComponentProps<any>) => {
    return (
        <Layout>
            <h1>Archives Search</h1>
            <div className="qg-call-out-box">
                <AspaceAdvancedSearch advancedSearchQuery={ AdvancedSearchQuery.emptyQuery() }></AspaceAdvancedSearch>
            </div>
        </Layout>
    );
}

export default HomePage;
