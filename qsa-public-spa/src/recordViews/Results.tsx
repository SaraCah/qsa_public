import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import AspaceAdvancedSearch from '../advancedSearch/AdvancedSearch';
import { AdvancedSearchQuery, Filter } from '../models/AdvancedSearch';
import { Http } from '../utils/http';
import { iconForType, labelForType, uriFor } from '../utils/typeResolver';
import queryString from 'query-string';

const FACET_LABELS: { [name: string]: string } = {
  mandate_id: 'Mandates',
  function_id: 'Functions',
  parent_id: 'Parent Record',
  resource_id: 'Series',
  creating_agency_id: 'Creating Agency',
  responsible_agency_id: 'Responsible Agency'
};

const ResultsPage: React.FC<any> = (route: any) => {
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [advancedSearchQuery] = useState<AdvancedSearchQuery>(
    AdvancedSearchQuery.fromQueryString(route.location.search)
  );
  const [showCompact, setShowCompact] = useState<boolean>(false);

  const currentPage = Number(queryString.parse(route.location.search).page || 0);

  const hasFacets = (searchResults: any) => {
    if (!searchResults.facets) {
      return false;
    }

    for (const facetField of Object.keys(searchResults.facets)) {
      if (searchResults.facets[facetField].length > 0) {
        return true;
      }
    }

    return false;
  };

  if (!searchResults) {
    Http.get()
      .fetchResults(advancedSearchQuery, currentPage)
      .then((results: any) => {
        setSearchResults(results);
        setShowCompact(true);
      });

    return <Layout skipFooter={true} />;
  } else {
    const stickyFilters = advancedSearchQuery.filters().filter((f: Filter) => f.isSticky);
    const limitedTo = stickyFilters.map((f: Filter) => (
      <p>
        <small>
          Limited to {FACET_LABELS[f.field]}: {f.label}
        </small>
      </p>
    ));

    return (
      <Layout
        skipFooter={!searchResults}
        aside={
          hasFacets(searchResults) && (
            <SearchFacets facets={searchResults.facets} advancedSearchQuery={advancedSearchQuery} />
          )
        }
      >
        <h1>Archives Search</h1>

        {showCompact ? (
          <CompactSearchSummary
            advancedSearchQuery={advancedSearchQuery}
            limitedTo={limitedTo}
            modifySearch={() => {
              setShowCompact(false);
            }}
          />
        ) : (
          <div className="qg-call-out-box">
            <AspaceAdvancedSearch advancedSearchQuery={advancedSearchQuery} limitedTo={limitedTo} />
          </div>
        )}
        {searchResults && (
          <SearchResults
            searchResults={searchResults}
            currentPage={currentPage}
            advancedSearchQuery={advancedSearchQuery}
          />
        )}
      </Layout>
    );
  }
};

const CompactSearchSummary: React.FC<{
  advancedSearchQuery: AdvancedSearchQuery;
  limitedTo: JSX.Element[];
  modifySearch: () => void;
}> = props => {
  const buildAccessLabel = () => {
    const [openOnly, hasDigitalObjects] = [
      props.advancedSearchQuery.isOpenRecordsOnly(),
      props.advancedSearchQuery.hasDigitalObjects()
    ];

    if (openOnly && hasDigitalObjects) {
      return 'open records with digital objects';
    } else if (openOnly) {
      return 'open records';
    } else if (hasDigitalObjects) {
      return 'records with digital objects';
    } else {
      return 'records';
    }
  };

  const buildQuerySummary = () => {
    const clauseSummary: string[] = [];

    props.advancedSearchQuery.getClauses().forEach((clause, idx) => {
      if (clause.target_field && clause.query && clause.boolean_operator) {
        if (idx > 0) {
          clauseSummary.push(clause.boolean_operator);
        }
        clauseSummary.push(`${clause.target_field}:${clause.query}`);
      }
    });

    if (clauseSummary.length === 0) {
      const accessLabel = buildAccessLabel();
      return (
        <>
          <span key={accessLabel}> Showing all {accessLabel}</span>
          {props.limitedTo}
        </>
      );
    } else {
      const queryString = clauseSummary.join(' ');
      return (
        <>
          <span>
            {' '}
            Searching for {buildAccessLabel()} matching <strong>{queryString}</strong>
          </span>
          {props.limitedTo}
        </>
      );
    }
  };

  const buildTypeSummary = () => {
    const limits = props.advancedSearchQuery.getTypeLimits();
    if (limits.length > 0) {
      const labels = limits.map(labelForType);

      let labelString = '';
      if (labels.length > 1) {
        labelString = labels.slice(0, labels.length - 1).join(', ') + ' or ' + labels[labels.length - 1];
      } else {
        labelString = labels[0];
      }

      return (
        <span key={labelString}>
          {' '}
          of type <strong>{labelString}</strong>
        </span>
      );
    }
  };

  const buildDateSummary = () => {
    const [fromDate, toDate] = [props.advancedSearchQuery.getFromDate(), props.advancedSearchQuery.getToDate()];

    if (fromDate && toDate) {
      return (
        <span>
          {' '}
          between dates <strong>{fromDate}</strong> &mdash; <strong>{toDate}</strong>
        </span>
      );
    } else if (fromDate) {
      return (
        <span>
          {' '}
          after date <strong>{fromDate}</strong>
        </span>
      );
    } else if (toDate) {
      return (
        <span>
          {' '}
          before date <strong>{toDate}</strong>
        </span>
      );
    } else {
      return null;
    }
  };

  let clauses = [buildQuerySummary(), buildTypeSummary(), buildDateSummary()].filter(elt => elt);

  if (clauses.length > 2) {
    clauses = clauses.map((clause, idx) =>
      idx > 0 ? <div key={idx} className="query-subclause">{clause}</div> : <div key={idx}>{clause}</div>
    );
  } else {
    clauses = clauses.map((clause, idx) => (<span key={idx}>{clause}</span>));
  }

  return (
    <div className="qg-call-out-box">
      {clauses}
      <div>
        <button onClick={(e: any) => props.modifySearch()} className="qg-btn btn-primary btn-xs">
          Modify search
        </button>
      </div>
    </div>
  );
};

const SearchFacets: React.FC<{
  facets: any;
  advancedSearchQuery: AdvancedSearchQuery;
}> = props => {
  return (
    <section className="search-filters">
      <h2>Results facets</h2>
      {props.advancedSearchQuery.filters().length > 0 && (
        <section className="active-filters">
          <h4>Active filters</h4>
          <ul>
            {props.advancedSearchQuery.filters().map((filter: Filter) => {
              return (
                <li key={filter.field}>
                  <div className="facet-label">
                    {FACET_LABELS[filter.field]}: {filter.label}&nbsp;
                  </div>
                  <div className="facet-count">
                    <Link
                      className="qg-btn btn-link facet-remove-btn"
                      to={{
                        pathname: '/search',
                        search: props.advancedSearchQuery.removeFilter(filter).toQueryString()
                      }}
                    >
                      <i className="fa fa-minus-circle" title="Remove this filter" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {Object.keys(props.facets).map((field: string) => {
        const facets = props.facets[field];
        if (facets.length === 0) {
          return <></>;
        }

        return (
          <section className="available-filters" key={field}>
            <h4>{FACET_LABELS[field]}</h4>
            <ul>
              {facets.map((facet: any) => {
                if (props.advancedSearchQuery.hasFilter(facet.facet_field, facet.facet_value)) {
                  return (
                    <li key={facet.facet_field + '_' + facet.facet_label}>
                      <div className="facet-label">{facet.facet_label}</div>
                      <div className="facet-count">{facet.facet_count}</div>
                    </li>
                  );
                } else {
                  return (
                    <li key={facet.facet_field + '_' + facet.facet_label}>
                      <div className="facet-label">
                        <Link
                          to={{
                            pathname: '/search',
                            search: props.advancedSearchQuery
                                         .addFilter(facet.facet_field, facet.facet_value, facet.facet_label)
                                         .toQueryString()
                          }}
                        >
                          {facet.facet_label}
                        </Link>
                      </div>
                      <div className="facet-count">{facet.facet_count}</div>
                    </li>
                  );
                }
              })}
            </ul>
          </section>
        );
      })}
    </section>
  );
};

const SearchResult: React.FC<{ searchResult: any }> = props => {
  const formatRepresentationCounts = (): any => {
    if (props.searchResult.digital_representation_count > 0 || props.searchResult.physical_representation_count > 0) {
      return (
        <div>
          <small>
            Format:&nbsp;
            {[
              props.searchResult.physical_representation_count > 0 &&
                props.searchResult.physical_representation_count + ' Physical representation(s)',
              props.searchResult.digital_representation_count > 0 &&
                props.searchResult.digital_representation_count + ' Digital representation(s)'
            ]
              .filter((e: string | false) => e)
              .join('; ')}
          </small>
        </div>
      );
    } else {
      return;
    }
  };

  return (
    <li className="list-group-item">
      <div className="d-flex w-100 justify-content-between">
        <h3>
          <Link to={uriFor(props.searchResult.qsa_id_prefixed, props.searchResult.primary_type)}>
            {props.searchResult.title}
          </Link>
        </h3>
        <span className="badge">
          <i className={iconForType(props.searchResult.primary_type)} aria-hidden="true" />
          &nbsp;
          {labelForType(props.searchResult.primary_type)}&nbsp;&nbsp;
          {props.searchResult.qsa_id_prefixed}
        </span>
      </div>
      {props.searchResult.description && <p>{props.searchResult.description}</p>}
      {props.searchResult.dates_display_string && (
        <div>
          <small>Dates: {props.searchResult.dates_display_string}</small>
        </div>
      )}
      {props.searchResult.primary_type === 'archival_object' && formatRepresentationCounts()}
      <p>
        <Link
          to={uriFor(props.searchResult.qsa_id_prefixed, props.searchResult.primary_type)}
          className="qg-btn btn-primary btn-sm pull-right"
        >
          View {labelForType(props.searchResult.primary_type)}
        </Link>
      </p>
    </li>
  );
};

const SearchResults: React.FC<{
  searchResults: any;
  currentPage: number;
  advancedSearchQuery: AdvancedSearchQuery;
}> = props => {
  const pageUpper = Math.min(
    (props.searchResults.current_page + 1) * props.searchResults.page_size,
    props.searchResults.total_count
  );
  const pageLower = Math.min(pageUpper, props.searchResults.current_page * props.searchResults.page_size + 1);

  return (
    <section className="qg-results">
      <h2>Your search results</h2>

      <div className="row">
        <div className="col-sm-12">
          <div className="pull-right">
            <small>
              Showing {pageLower} - {pageUpper} of {props.searchResults.total_count} Results
            </small>
          </div>
        </div>
      </div>

      <ul className="list-group">
        {props.searchResults.results.length === 0 && <li>No Results</li>}
        {props.searchResults.results.length > 0 &&
          props.searchResults.results.map((result: any) => {
            return <SearchResult searchResult={result} key={result.id} />;
          })}
      </ul>

      <nav>
        <div className="text-center">
          <ul className="pagination">
            <li className={'page-item prev ' + (props.currentPage === 0 ? 'disabled' : '')}>
              <Link
                to={'/search?' + props.advancedSearchQuery.toQueryString() + '&page=' + (props.currentPage - 1)}
                className="page-link"
              >
                <span aria-hidden="true">«</span> Previous
              </Link>
            </li>
            <li
              className={
                'page-item next ' +
                (props.currentPage >= Math.ceil(props.searchResults.total_count / props.searchResults.page_size) - 1
                  ? 'disabled'
                  : '')
              }
            >
              <Link
                to={'/search?' + props.advancedSearchQuery.toQueryString() + '&page=' + (props.currentPage + 1)}
                className="page-link"
              >
                Next <span aria-hidden="true">»</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </section>
  );
};

export default ResultsPage;
