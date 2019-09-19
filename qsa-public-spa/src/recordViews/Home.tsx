import React from 'react';
import {RouteComponentProps} from "react-router-dom";
import Layout from './Layout';
import AspaceAdvancedSearch from '../advancedSearch/AdvancedSearch'
import {AdvancedSearchQuery} from "../models/AdvancedSearch";

const HomePage: React.FC<RouteComponentProps<any>> = (route: RouteComponentProps<any>) => {
    return (
        <Layout>
            <AspaceAdvancedSearch advancedSearchQuery={ new AdvancedSearchQuery({clauses: []}) }></AspaceAdvancedSearch>
        </Layout>
    );
}

export default HomePage;
