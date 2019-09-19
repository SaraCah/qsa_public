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
    ['qsa_id_search','QSA ID'],
    ['previous_system_ids', 'Previous System ID'],
  ];

  const onSubmit = (e: any) => {
    redirectForSearch('/search?' + advancedSearchQuery.toQueryString());
  }

  useEffect(() => {
    if (needsRedirect && props.onSearch) {
      props.onSearch();
    }

    redirectForSearch('');
  }, [needsRedirect, props]);

  if (needsRedirect) {
    return <Redirect to={ needsRedirect } push={ true }></Redirect>;
  } else {
    return ( 
      <div id="advancedSearchContainer" className="container">
        <form method="GET" onSubmit={ (e) => { e.preventDefault(); onSubmit(e) } }>
          <button style={{display: "none"}} aria-hidden="true"></button>
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
                         onChange={ (e) => setAdvancedSearchQuery(advancedSearchQuery.queryChanged(e, idx)) }
                         required>
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
                  <button className="btn btn-default" tabIndex={ 0 } onClick={ (e) => { e.preventDefault(); setAdvancedSearchQuery(advancedSearchQuery.addEmpty()) } }><i className="fa fa-plus"></i></button>
                </div>

                {idx > 0 &&
                 <div className="form-group col-md-1">
                   <button className="btn btn-default" tabIndex={ 0 } onClick={ (e) => { e.preventDefault(); setAdvancedSearchQuery(advancedSearchQuery.remove(idx)) } }><i className="fa fa-minus"></i></button>
                 </div>
                }
              </div>
            ))
          }
          <div>
            <button className="btn btn-primary">Submit</button>
          </div>
        </form>
      </div>
    );
  }
};

export default AspaceAdvancedSearch;
