import React from 'react';
import {RouteComponentProps} from "react-router-dom";
import Layout from './Layout';
import AspaceAdvancedSearch from '../advancedSearch/AdvancedSearch'

const ResultsPage: React.FC<RouteComponentProps<any>> = (route: RouteComponentProps<any>) => {
    return (
        <Layout>
            <AspaceAdvancedSearch></AspaceAdvancedSearch>
            <div>
                And some results!
            </div>
        </Layout>
    );
}

export default ResultsPage;
