import React, {useEffect, useState} from 'react';
import {Link, RouteComponentProps} from "react-router-dom";
import Layout from './Layout';
import AspaceAdvancedSearch from '../advancedSearch/AdvancedSearch'
import {AdvancedSearchQuery, Filter} from "../models/AdvancedSearch";
import {Http} from "../utils/http";
import {iconForType, labelForType, uriFor} from "../utils/typeResolver";
import queryString from "query-string";

const ResultsPage: React.FC<any> = (route: any) => {
    const [searchResults, setSearchResults] = useState<any | null>(null);
    const [advancedSearchQuery, setAdvancedSearchQuery] = useState<AdvancedSearchQuery>(AdvancedSearchQuery.fromQueryString(route.location.search));

    const currentPage: number = Number(queryString.parse(route.location.search).page || 0);

    if (!searchResults) {
        Http.fetchResults(advancedSearchQuery, currentPage).then(setSearchResults);
        return <Layout skipFooter={ true }></Layout>
    } else {
        return (
            <Layout skipFooter={ !searchResults }>
                <SearchFacets facets={ searchResults.facets } advancedSearchQuery={ advancedSearchQuery } />
                <h1>Archives Search</h1>
                <div className="qg-call-out-box">
                    <AspaceAdvancedSearch advancedSearchQuery={ advancedSearchQuery }></AspaceAdvancedSearch>
                </div>
                {searchResults && <SearchResults searchResults={ searchResults } currentPage={ currentPage } advancedSearchQuery={ advancedSearchQuery }></SearchResults> }
            </Layout>
        );
    }
};

const SearchFacets: React.FC<{ facets: any, advancedSearchQuery: AdvancedSearchQuery }> = (props) => {
    const FACET_LABELS: {[name: string]: string} = {
        'mandate_id': 'Mandates',
        'function_id': 'Functions',
    };

    return (<>
        {
            (props.advancedSearchQuery.filters().length > 0 &&
             <section>
                <h4>Active filters</h4>
                <ul>
                    {
                        props.advancedSearchQuery.filters().map((filter: Filter) => {
                            return <li>
                                {FACET_LABELS[filter.field]}: {filter.label}&nbsp;
                                <Link className="btn btn-sm btn-outline-dark"
                                      to={{
                                            pathname: '/search',
                                            search: props.advancedSearchQuery.removeFilter(filter).toQueryString()
                                        }}>
                                    <i className="fa fa-minus" title="Remove this filter"></i>
                                </Link>
                            </li>;
                        })
                    }
                </ul>
             </section>
            )
        }
        {
            Object.keys(props.facets).map((field: string) => {
                const facets = props.facets[field];
                return <section>
                    <h4>{FACET_LABELS[field]}</h4>
                    <ul>
                        {
                            facets.map((facet: any) => {
                                if (props.advancedSearchQuery.hasFilter(facet.facet_field, facet.facet_value)) {
                                    return <li>{facet.facet_label}&nbsp;{facet.facet_count}</li>
                                } else {
                                    return <li><Link
                                                   to={{
                                                       pathname: '/search',
                                                       search: props.advancedSearchQuery.addFilter(facet.facet_field, facet.facet_value, facet.facet_label).toQueryString()
                                                   }}>
                                        {facet.facet_label}
                                    </Link>&nbsp;{facet.facet_count}</li>;
                                }
                            })
                        }
                    </ul>
                </section>
            })
        }
    </>)
}

const SearchResult: React.FC<{ searchResult: any }> = (props) => {
    const formatRepresentationCounts = ():any => {
        if (props.searchResult.digital_representation_count > 0 || props.searchResult.physical_representation_count > 0) {
            return (
                <div>
                    <small>
                        Format:&nbsp;
                        {
                            [
                                props.searchResult.physical_representation_count > 0 && props.searchResult.physical_representation_count + " Physical representation(s)",
                                props.searchResult.digital_representation_count > 0 && props.searchResult.digital_representation_count + " Digital representation(s)"
                            ].filter((e: string|false) => e).join('; ')
                        }
                    </small>
                </div>
            )
        } else {
            return;
        }
    }

    return (
        <li className="list-group-item">
            <div className="d-flex w-100 justify-content-between">
                <h3>
                    <Link to={ uriFor(props.searchResult.qsa_id_prefixed, props.searchResult.primary_type) }>
                        { props.searchResult.title }
                    </Link>
                </h3>
                <span className="badge">
                    <i className={ iconForType(props.searchResult.primary_type) } aria-hidden="true"></i>&nbsp;
                    { labelForType(props.searchResult.primary_type) }&nbsp;&nbsp;
                    { props.searchResult.qsa_id_prefixed }
                </span>
            </div>
            { props.searchResult.description && <p>{ props.searchResult.description }</p> }
            { props.searchResult.dates_display_string && <div><small>Dates: { props.searchResult.dates_display_string }</small></div> }
            { props.searchResult.primary_type === 'archival_object' && formatRepresentationCounts() }
            <p>
                <Link to={ uriFor(props.searchResult.qsa_id_prefixed, props.searchResult.primary_type) } className="qg-btn btn-primary btn-sm pull-right">
                    View { labelForType(props.searchResult.primary_type) }
                </Link>
            </p>
        </li>
    )
}

const SearchResults: React.FC<{ searchResults: any, currentPage: number, advancedSearchQuery: AdvancedSearchQuery }> = (props) => {
    return (
        <section className="qg-results">

            <h2>Results search</h2>

            <div className="row">
                <div className="col-sm-12">
                    <div className="pull-right">
                        <small>Showing { props.searchResults.current_page * props.searchResults.page_size + 1 } - { Math.min((props.searchResults.current_page + 1) * props.searchResults.page_size, props.searchResults.total_count)} of { props.searchResults.total_count } Results</small>
                    </div>
                </div>
            </div>

            <ul className="list-group">
                {props.searchResults.results.length === 0 && <li>No Results</li>}
                {props.searchResults.results.length > 0 && props.searchResults.results.map((result:any) => {
                    return <SearchResult searchResult={ result }></SearchResult>
                })}
            </ul>

            <nav>
                <div className="text-center">
                    <ul className="pagination">
                        <li className={'page-item prev ' + (props.currentPage === 0 ? 'disabled' : '')}>
                            <Link to={ '/search?' + props.advancedSearchQuery.toQueryString() + '&page=' + (props.currentPage - 1)} className="page-link">
                                <span aria-hidden="true">«</span> Previous
                            </Link>
                        </li>
                        <li className={"page-item next " + ((props.currentPage >= (Math.ceil(props.searchResults.total_count / props.searchResults.page_size) - 1)) ? 'disabled' : '')} >
                            <Link to={ '/search?' + props.advancedSearchQuery.toQueryString() + '&page=' + (props.currentPage + 1)} className="page-link">
                                Next <span aria-hidden="true">»</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>
        </section>
    )
};



export default ResultsPage;
