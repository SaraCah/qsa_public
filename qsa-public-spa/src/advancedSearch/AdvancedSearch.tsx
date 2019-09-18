import React, {useState} from 'react';
import {AppState} from "../models/AppState";
import {DisplayResult} from "../models/DisplayResult";
import {AspaceSearchParameters} from "../models/SearchParameters";
import {AspaceResultTypes, newAspaceResultFromJsonModelType} from "../utils/typeResolver";
import {Http} from "../utils/http";
import {AspaceResult} from "../models/AspaceResult";
import {AgencyResult} from "../models/AgencyResult";
import {SeriesResult} from "../models/SeriesResult";
import {Link} from "react-router-dom";

const AspaceAdvancedSearch: React.FC<AppState> = (props: AppState) => {
  const [results, setResults] = useState(new DisplayResult([]));
  const [selectedResult, setSelectedResult] = props.selectedResult;
  const [searchParameters, setSearchParameters] = useState(new AspaceSearchParameters());
  const recordTypes: Array<string[]> = [
    [AspaceResultTypes.Agency, 'Corporate agencies'],
    [AspaceResultTypes.Series, 'Series'],
  ];
  const keywordTypes = [
    ['keywords', 'Keywords'],
    ['title', 'Title'],
    ['item_id','Item ID'],
    ['agency_id', 'Agency ID'],
    ['series_id', 'Series ID'],
    ['notes', 'Notes'],
    ['function', 'Function'],
    ['mandate', 'Mandate'],
    ['previous_system_id', 'Previous System ID'],
  ];

  const buildResultRow = (result: AspaceResult) => {
    let resultRow: JSX.Element = <></>;
    switch (result.jsonModelType) {
      case 'agent_corporate_entity':
        const agencyResult = result as AgencyResult;
        resultRow = (
          <li key={agencyResult.qsaIdPrefixed} className="list-group-item">
            <h4><Link to={`/basicSearch/#${agencyResult.uri}`}>{agencyResult.displayString}</Link></h4>
            {agencyResult.qsaIdPrefixed}<span className="badge badge-danger">Closed (example)</span><br/>
            Content type: Agency<br/>
            <code>
              {JSON.stringify(agencyResult, null, 2)}
            </code>
          </li>
        );
        break;
      case AspaceResultTypes.Series:
        const seriesResult = result as SeriesResult;
        resultRow = (
          <li key={seriesResult.qsaIdPrefixed} className="list-group-item">
            <h4><Link to={`/basicSearch/#${seriesResult.uri}`}>{seriesResult.displayString}</Link></h4>
            {seriesResult.qsaIdPrefixed}<span className="badge badge-danger">Open (example)</span><br/>
            Content type: Series<br/>
            <section className="qg-accordion qg-dark-accordion" aria-label="Accordion Label">
              <input type="radio" name="control" id="collapse" className="controls collapse" value="collapse" role="radio"/>
              <label htmlFor="collapse" className="controls">Collapse details</label>
              <span className="controls">&#124;</span>
              <article>
                <input id={`panel-json`} type="checkbox" name="tabs" aria-controls={`panel-content-json`}/>
                <h3 className="acc-heading">
                  <label htmlFor={`panel-json`}>
                    Raw response data
                    <span className="arrow"><i/></span>
                  </label>
                </h3>
                <div className="collapsing-section" aria-hidden="true" id={`panel-content-json`}>
                  <pre>{JSON.stringify(seriesResult, null, 2)}</pre>
                </div>
              </article>
            </section>
          </li>
        );
        break;
    }
    return resultRow;
  };

  return (
    <div id="advancedSearchContainer" className="container">
      <div className="row">
        <div className="col">
          <form>
        <div className="row">
          <div className="col pr-1 mx-0">
            <span className="small">Search terms</span>
            <input id="advancedSearchTermsInput" type="text" className="form-control"
                   placeholder="Enter your search terms" onInput={
                     event => setSearchParameters(
                       prevState => prevState.mergeParameters(
                         { clauses: [{
                             field: prevState.clauses.length > 0 ? prevState.clauses[0].field : 'keywords',
                              operator: 'OR',
                              query: event.currentTarget.value
                           }]
                         }) )}/>
          </div>
          <div className="col pr-0 pl-1 mx-0">
            <span className="small">Record type</span>
            <select id="advancedSearchRecordType" className="form-control" onInput={
              event => {
                setSearchParameters(
                  prevState => prevState.mergeParameters({ filterTypes:
                      event.currentTarget.value !== '' ? [event.currentTarget.value] : undefined
                  }) )
              }}>
              <option value="">All record types</option>
              {recordTypes.map(([recordType, recordName]) => <option key={recordType} value={recordType}>{recordName}</option>)}
            </select>
          </div>
          <div className="col px-1 mx-0">
            <span className="small">Keyword</span>
            <select id="advancedSearchKeywordType" className="form-control" onInput={
              event => setSearchParameters(
                prevState => prevState.mergeParameters({ clauses: [{
                    field: event.currentTarget.value,
                    operator: 'OR',
                    query: prevState.clauses.length > 0 ? prevState.clauses[0].query : ''
                  }]
                }) )}>
              <option value="">All</option>
              {keywordTypes.map(([keywordType, recordName]) => <option key={keywordType} value={keywordType}>{recordName}</option>)}
            </select>
          </div>
          <label htmlFor="inputEmail4">Years</label>
          <div className="col pr-0 pl-1 mx-0">
            <span className="small">From</span>
            <input id="advancedSearchYearStart" className="form-control" onInput={
              event => setSearchParameters(
                prevState => prevState.mergeParameters({ filterStartDate: event.currentTarget.value }) )}/>
          </div>
          <div className="col pr-0 pl-1 mx-0">
            <span className="small">To</span>
            <input id="advancedSearchYearEnd" className="form-control" onInput={
              event => setSearchParameters(
                prevState => prevState.mergeParameters({ filterEndDate: event.currentTarget.value }) )}/>
          </div>
        </div>
        <div className="row pt-3 pb-3">
          <div className="col">
            <button type="button" className="btn btn-outline-primary" onClick={() => {
              Http.fetchResults<AspaceResult>(searchParameters)
                .then(async (searchResults: AspaceResult[] = []): Promise<AspaceResult[]> => {
                  return await Promise.all(searchResults
                    .map((searchResult: AspaceResult) => Http.fetchFromUri(searchResult.uri)));
                })
                .then((searchResults: AspaceResult[]) => setResults(new DisplayResult(searchResults)));
            }}>Search</button>
          </div>
        </div>
      </form>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <ul className="list-group">
            {results.data.length === 0 &&
              <>No results found.</>
            }
            {results.data.map(result => buildResultRow(newAspaceResultFromJsonModelType(result.jsonmodel_type, result)))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AspaceAdvancedSearch;