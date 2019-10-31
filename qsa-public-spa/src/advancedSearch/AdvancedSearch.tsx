import React, { useState } from 'react';
import { Redirect } from 'react-router';
import { AdvancedSearchQuery } from '../models/AdvancedSearch';

const AspaceAdvancedSearch: React.FC<{
  advancedSearchQuery: AdvancedSearchQuery;
  limitedTo?: JSX.Element[];
}> = props => {
  const [advancedSearchQuery, setAdvancedSearchQuery] = useState(props.advancedSearchQuery);
  const [needsRedirect, redirectForSearch] = useState('');
  const keywordTypes = [
    ['keywords', 'Keywords'],
    ['title', 'Title'],
    ['qsa_id_search', 'QSA ID'],
    ['previous_system_ids', 'Previous System ID'],
    ['tags', 'Tags']
  ];
  const recordTypes = [
    ['resource', 'Series'],
    ['archival_object', 'Item'],
    ['agent_corporate_entity', 'Agency'],
    ['mandate', 'Mandate'],
    ['function', 'Function']
  ];
  const onSubmit = (e: any): void => {
    // Any filters are cleared when a new search fires
    redirectForSearch('/search?' + advancedSearchQuery.clearFilters().toQueryString());
  };

  if (needsRedirect) {
    return <Redirect to={needsRedirect} push={true} />;
  } else {
    return (
      <div id="advancedSearchContainer" className="container">
        <form
          method="GET"
          onSubmit={(e): void => {
            e.preventDefault();
            onSubmit(e);
          }}
        >
          <button style={{ display: 'none' }} aria-hidden="true" />
          {advancedSearchQuery.map((clause, idx) => (
            <div className="form-row" key={clause.id}>
              <div className="form-group col-md-2">
                {idx === 0 && <span className="form-control-plaintext text-right">Search for:</span>}
                {
                  <select
                    name="op[]"
                    className="form-control custom-select"
                    style={{ display: idx === 0 ? 'none' : 'block' }}
                    value={clause.boolean_operator}
                    onChange={(e): void => setAdvancedSearchQuery(advancedSearchQuery.operatorChanged(e, idx))}
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                    <option value="NOT">NOT</option>
                  </select>
                }
              </div>

              <div className="form-group col-md-5">
                <input
                  type="text"
                  className="form-control"
                  name="q[]"
                  value={clause.query}
                  onChange={(e): void => setAdvancedSearchQuery(advancedSearchQuery.queryChanged(e, idx))}
                />
              </div>

              <div className="form-group col-md-2">
                <select
                  name="f[]"
                  className="form-control"
                  value={clause.target_field}
                  onChange={(e): void => setAdvancedSearchQuery(advancedSearchQuery.fieldChanged(e, idx))}
                >
                  {keywordTypes.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group col-md-1">
                <button
                  className="qg-btn btn-default btn-sm"
                  tabIndex={0}
                  onClick={(e): void => {
                    e.preventDefault();
                    setAdvancedSearchQuery(advancedSearchQuery.addEmpty());
                  }}
                >
                  <i className="fa fa-plus" />
                </button>
              </div>

              {idx > 0 && (
                <div className="form-group col-md-1">
                  <button
                    className="qg-btn btn-default btn-sm"
                    tabIndex={0}
                    onClick={(e): void => {
                      e.preventDefault();
                      setAdvancedSearchQuery(advancedSearchQuery.remove(idx));
                    }}
                  >
                    <i className="fa fa-minus" />
                  </button>
                </div>
              )}
            </div>
          ))}
          <div className="form-group">
            <div>
              <small>Limit to:</small>
            </div>
            <div style={{ columns: 3 }}>
              {recordTypes.map(recordType => {
                return (
                  <div key={recordType[0]}>
                    <label>
                      <input
                        onChange={(e): void =>
                          setAdvancedSearchQuery(advancedSearchQuery.setType(recordType[0], e.target.checked))
                        }
                        type="checkbox"
                        name="type[]"
                        value={recordType[0]}
                        checked={advancedSearchQuery.isTypeSelected(recordType[0])}
                      />{' '}
                      {recordType[1]}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="form-group">
            <div className="form-inline">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    From&nbsp;&nbsp;
                    <input
                      onChange={(e): void => setAdvancedSearchQuery(advancedSearchQuery.setFromDate(e.target.value))}
                      className="form-control"
                      type="text"
                      name="from"
                      value={advancedSearchQuery.getFromDate() || ''}
                    />
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    &nbsp;&nbsp;to&nbsp;&nbsp;
                    <input
                      onChange={(e): void => setAdvancedSearchQuery(advancedSearchQuery.setToDate(e.target.value))}
                      className="form-control"
                      type="text"
                      name="to"
                      value={advancedSearchQuery.getToDate() || ''}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="form-group">
            <div className="form-row">
              <label>
                <input
                  type="checkbox"
                  name="open"
                  checked={advancedSearchQuery.isOpenRecordsOnly()}
                  onChange={(e): void =>
                    setAdvancedSearchQuery(advancedSearchQuery.setOpenRecordsOnly(e.target.checked))
                  }
                />{' '}
                Open records only
              </label>
            </div>
            <div className="form-row">
              <label>
                <input
                  type="checkbox"
                  name="has_digital"
                  checked={advancedSearchQuery.hasDigitalObjects()}
                  onChange={(e): void =>
                    setAdvancedSearchQuery(advancedSearchQuery.setHasDigitalObjects(e.target.checked))
                  }
                />{' '}
                Records with digital objects only
              </label>
            </div>
          </div>
          <div>
            <button className="qg-btn btn-primary">Submit</button>
            <small>{props.limitedTo && props.limitedTo}</small>
          </div>
        </form>
      </div>
    );
  }
};

export default AspaceAdvancedSearch;
