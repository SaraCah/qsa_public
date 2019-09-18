import React from 'react';
import {AppState} from "../models/AppState";
import {agencyResultView, seriesResultView} from "../resultView/ResultView";
import {SeriesResult} from "../models/SeriesResult";
import {AgencyResult} from "../models/AgencyResult";

const ContentView: React.FC<AppState> = (props) => {
  const [selectedResult] = props.selectedResult;
  return (
      <div id="qg-primary-content" role="main">
        <div className="row">
          <div className="col-sm-12">
          { !!selectedResult &&
            <>
              {selectedResult.jsonModelType === 'agent_corporate_entity' && agencyResultView(selectedResult as AgencyResult)}
              {selectedResult.jsonModelType === 'resource' && seriesResultView(selectedResult as SeriesResult)}
            </>
          }
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="qg-content-footer">
              <dl>
                <dt>Last updated:</dt>
                <dd>27 August 2019</dd>
                <dt>Last reviewed:</dt>
                <dd>27 August 2019</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ContentView;