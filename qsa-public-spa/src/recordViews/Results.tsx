import React, {useEffect, useState} from 'react';
import {Link, RouteComponentProps} from "react-router-dom";
import Layout from './Layout';
import AspaceAdvancedSearch from '../advancedSearch/AdvancedSearch'
import {AdvancedSearchQuery} from "../models/AdvancedSearch";
import {Http} from "../utils/http";
import {iconForType, labelForType, uriFor} from "../utils/typeResolver";
import queryString from "query-string";

const ResultsPage: React.FC<RouteComponentProps<any>> = (route: RouteComponentProps<any>) => {
    const [searchResults, setSearchResults] = useState<any | null>(null);
    // const [currentPage, setCurrentPage] = useState<number>(0);

    const advancedSearchQuery: AdvancedSearchQuery = AdvancedSearchQuery.fromQueryString(route.location.search);

    const currentPage: number = Number(queryString.parse(route.location.search).page || 0);

    if (!searchResults) {
        Http.fetchResults(advancedSearchQuery, currentPage).then(setSearchResults);
    }

    return (
        <Layout>
            <AspaceAdvancedSearch advancedSearchQuery={ advancedSearchQuery } onSearch={ () => setSearchResults(null) }></AspaceAdvancedSearch>
            {searchResults && <SearchResults searchResults={ searchResults } currentPage={ currentPage } advancedSearchQuery={ advancedSearchQuery }></SearchResults> }
        </Layout>
    );
}

const SearchResults: React.FC<{ searchResults: any, currentPage: number, advancedSearchQuery: AdvancedSearchQuery }> = (props) => {
    return (
        <>
            <div className="pull-right">
                <small>Showing { props.searchResults.current_page * props.searchResults.page_size + 1 } - { Math.min((props.searchResults.current_page + 1) * props.searchResults.page_size, props.searchResults.total_count)} of { props.searchResults.total_count } Results</small>
            </div>
            <table className="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th>Record Type</th>
                        <th>QSA ID</th>
                        <th>Title</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                {props.searchResults.results.map((result: any) => {
                    return <tr>
                        <td><i className={ iconForType(result.primary_type) } aria-hidden="true"></i> { labelForType(result.primary_type) }</td>
                        <td>{ result.qsa_id_prefixed }</td>
                        <td>{ result.title }</td>
                        <td><Link to={ uriFor(result.qsa_id_prefixed, result.primary_type) }>View</Link></td>
                    </tr>
                })}
                </tbody>
            </table>
            <nav>
                <ul className="pagination">
                    <li className={'page-item prev ' + (props.currentPage === 0 ? 'disabled' : '')}>
                        <Link to={ '/search?' + props.advancedSearchQuery.toQueryString() + '&page=' + (props.currentPage - 1)} className="page-link">
                            <span aria-hidden="true">«</span> Previous
                        </Link>
                    </li>
                    <li className={"page-item next " + ((props.currentPage === Math.floor(props.searchResults.total_count / props.searchResults.page_size)) ? 'disabled' : '')} >
                        <Link to={ '/search?' + props.advancedSearchQuery.toQueryString() + '&page=' + (props.currentPage + 1)} className="page-link">
                            Next <span aria-hidden="true">»</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </>
    )
}

export default ResultsPage;
