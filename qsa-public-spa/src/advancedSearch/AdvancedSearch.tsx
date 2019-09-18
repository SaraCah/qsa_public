import React, {useState, useEffect} from 'react';
import { Redirect } from 'react-router';
import { AdvancedSearchQuery } from '../models/AdvancedSearch';

const AspaceAdvancedSearch: React.FC<{advancedSearchQuery: AdvancedSearchQuery, onSearch?: ()=>void }> = (props) => {
  const [advancedSearchQuery, setAdvancedSearchQuery] = useState(props.advancedSearchQuery);
  const [needsRedirect, redirectForSearch] = useState('');

  /* const recordTypes: Array<string[]> = [
   *   [AspaceResultTypes.Agency, 'Agencies'],
   *   [AspaceResultTypes.Series, 'Series'],
   * ]; */

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

  const onSubmit = (e: any) => {
    redirectForSearch('/search?' + advancedSearchQuery.toQueryString());
  }

  useEffect(() => {
    if (needsRedirect && props.onSearch) {
      props.onSearch();
    }
    redirectForSearch('');
  });

  if (needsRedirect) {
    return <Redirect to={ needsRedirect } push={ true }></Redirect>;
  } else {
    return ( 
      <div id="advancedSearchContainer" className="container">
        <form method="GET" onSubmit={ (e) => { e.preventDefault(); onSubmit(e) } }>
          {
            advancedSearchQuery.map((clause, idx) => (
              <div className="form-row" key={ clause.id }>
                <div className="form-group col-md-2">
                  <select name="op[]"
                          className="form-control custom-select"
                          style={{visibility: (idx === 0) ? 'hidden' : 'visible'}}
                          value={ clause.boolean_operator }
                          onChange={ (e) => setAdvancedSearchQuery(advancedSearchQuery.operatorChanged(e, idx)) }>
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                    <option value="NOT">NOT</option>
                  </select>
                </div>

                <div className="form-group col-md-5">
                  <input type="text"
                         className="form-control"
                         name="q[]"
                         value={ clause.query }
                         onChange={ (e) => setAdvancedSearchQuery(advancedSearchQuery.queryChanged(e, idx)) }>
                  </input>
                </div>

                <div className="form-group col-md-2">
                  <select name="f[]"
                          className="form-control"
                          value={ clause.target_field }
                          onChange={ (e) => setAdvancedSearchQuery(advancedSearchQuery.fieldChanged(e, idx)) }>
                    { keywordTypes.map(([value, label], idx) => (<option key={ value } value={ value }>{label}</option>)) }
                  </select>
                </div>

                <div className="form-group col-md-1">
                  <button className="form-control" onClick={ (e) => { e.preventDefault(); setAdvancedSearchQuery(advancedSearchQuery.addEmpty()) } }><i className="fa fa-plus"></i></button>
                </div>

                {idx > 0 &&
                 <div className="form-group col-md-1">
                   <button className="form-control" onClick={ (e) => { e.preventDefault(); setAdvancedSearchQuery(advancedSearchQuery.remove(idx)) } }><i className="fa fa-minus"></i></button>
                 </div>
                }
              </div>
            ))
          }
          <div>
            <button>Submit</button>
          </div>
        </form>
      </div>
    );
  }
};

export default AspaceAdvancedSearch;
