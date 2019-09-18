import React, {useState} from 'react';
import {RouteComponentProps} from "react-router-dom";
import Layout from './Layout';
import AspaceAdvancedSearch from '../advancedSearch/AdvancedSearch'
import {AdvancedSearchQuery} from "../models/AdvancedSearch";
import {Http} from "../utils/http";

// {"total_count":0,"current_page":0,"page_size":10,"sorted_by":"score desc","results":[]}

const ResultsPage: React.FC<RouteComponentProps<any>> = (route: RouteComponentProps<any>) => {
    const [searchResults, setSearchResults] = useState<any | null>(null);

    const advancedSearchQuery: AdvancedSearchQuery = AdvancedSearchQuery.fromQueryString(route.location.search);

    if (!searchResults) {
        Http.fetchResults(advancedSearchQuery).then(setSearchResults);
    }

    return (
        <Layout>
            <AspaceAdvancedSearch advancedSearchQuery={ advancedSearchQuery } onSearch={ () => setSearchResults(null) }></AspaceAdvancedSearch>
            {searchResults && <pre>{JSON.stringify(searchResults)}</pre>}
        </Layout>
    );
}

export default ResultsPage;
