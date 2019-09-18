import React, {useState} from 'react';
import {Http} from "../utils/http";
import {AppState} from "../models/AppState";
import {SeriesResult} from "../models/SeriesResult";
import {DisplayResult} from "../models/DisplayResult";
import {AgencyResult} from "../models/AgencyResult";
import {TypeaheadSearch} from "./typeaheadSearch";

const AspaceSearch: React.FC<AppState> = (props: AppState) => {
  const [results, setResults] = useState(new DisplayResult([]));
  const [selectedResult, setSelectedResult] = props.selectedResult;
  const [typeAheadSearch] = useState(new TypeaheadSearch(setResults));
  const agencies = results.displayResults('agent_corporate_entity');
  const series = results.displayResults('resource');

  return (
    <nav id="qg-section-nav" aria-label="side navigation" role="navigation">
      <h2><a href="#">ArchivesSearch</a></h2>
      <input type="text" className="form-control-plaintext" id="search-input" placeholder="Search all types"
             onInput={(event) => typeAheadSearch.updateSearchText(event.currentTarget.value)}/>
      <ul aria-label="section navigation">
        <li>
          <a href="#">Agencies</a>
          <ul>
            {agencies.map(agency => (
              <li key={agency.id} onClick={() => {
                Http.fetchFromUri(agency.uri)
                  .then((agencyResult: any) => {
                    setSelectedResult(new AgencyResult(agencyResult));
                  });
              }}>
                <a href="#">{agency.title}</a>
              </li>
            ))}
          </ul>
        </li>
        <li>
          <a href="#">Series</a>
          <ul>
            { series.map(seriesItem => (
              <li key={seriesItem.id} onClick={() => {
                Http.fetchFromUri(seriesItem.uri)
                  .then((seriesResult: any) => {
                    setSelectedResult(new SeriesResult(seriesResult));
                  });
              }}>
                <a href="#">{seriesItem.title}</a>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default AspaceSearch