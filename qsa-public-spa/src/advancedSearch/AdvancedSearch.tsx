import React, {useState} from 'react';
import { Redirect } from 'react-router';
import queryString from 'query-string';

let clauseCount: number = 0;

class Clauses {
  private clauses: Clause[];

  constructor(clauses?: Clause[]) {
    if (clauses) {
      this.clauses = clauses;
    } else {
      this.clauses = [];
    }

    if (this.clauses.length === 0) {
      this.clauses.push(this.emptyClause());
    }
  }

  emptyClause() {
    return {
      id: clauseCount++,
      boolean_operator: 'AND',
      query: '',
      target_field: 'keywords'
    };
  }

  addEmpty(): Clauses {
    return new Clauses(this.clauses.concat([this.emptyClause()]));
  }

  map(fn: (clause: Clause, idx: number) => any): any[] {
    return this.clauses.map((clause, idx) => fn(clause, idx));
  }

  remove(idx: number): Clauses {
    if (idx < this.clauses.length) {
      return new Clauses(this.clauses.slice(0, idx).concat(this.clauses.slice(idx + 1)));
    } else {
      return this;
    }
  }

  setClauseField(idx: number, field: string, value: string): Clauses {
    let updated = [...this.clauses];
    updated[idx] = Object.assign({}, updated[idx], {[field]: value});

    return new Clauses(updated);
  }

  operatorChanged(event: any, idx: number): Clauses {
    return this.setClauseField(idx, 'boolean_operator', event.target.value);
  }

  fieldChanged(event: any, idx: number): Clauses {
    return this.setClauseField(idx, 'target_field', event.target.value);
  }

  queryChanged(event: any, idx: number): Clauses {
    return this.setClauseField(idx, 'query', event.target.value);
  }

  toQueryString() {
    return queryString.stringify({
      op: this.clauses.map((c: Clause) => c.boolean_operator),
      q: this.clauses.map((c: Clause) => c.query),
      f: this.clauses.map((c: Clause) => c.target_field),
    }, {
      arrayFormat: 'bracket',
    });
  }

}

interface Clause {
  id: number;
  boolean_operator?: string;
  query?: string;
  target_field?: string;
}

const AspaceAdvancedSearch: React.FC = () => {
  const [clauses, setClauses] = useState(new Clauses());
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
    redirectForSearch('/bananas?' + clauses.toQueryString());
  }

  if (needsRedirect) {
    return <Redirect to={needsRedirect} push={ true }></Redirect>;
  } else {
    return (
      <div id="advancedSearchContainer" className="container">
        <form method="GET" action="/search" onSubmit={ (e) => { e.preventDefault(); onSubmit(e) } }>
          {
            clauses.map((clause, idx) => (
              <div className="form-row" key={ clause.id }>
                <div className="form-group col-md-2">
                  <select name="op[]"
                          className="form-control custom-select"
                          style={{visibility: (idx === 0) ? 'hidden' : 'visible'}}
                          value={ clause.boolean_operator }
                          onChange={ (e) => setClauses(clauses.operatorChanged(e, idx)) }>
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
                         onChange={ (e) => setClauses(clauses.queryChanged(e, idx)) }>
                  </input>
                </div>

                <div className="form-group col-md-2">
                  <select name="f[]"
                          className="form-control"
                          value={ clause.target_field }
                          onChange={ (e) => setClauses(clauses.fieldChanged(e, idx)) }>
                    { keywordTypes.map(([value, label], idx) => (<option key={ value } value={ value }>{label}</option>)) }
                  </select>
                </div>

                <div className="form-group col-md-1">
                  <button className="form-control" onClick={ (e) => { e.preventDefault(); setClauses(clauses.addEmpty()) } }><i className="fa fa-plus"></i></button>
                </div>

                {idx > 0 &&
                 <div className="form-group col-md-1">
                   <button className="form-control" onClick={ (e) => { e.preventDefault(); setClauses(clauses.remove(idx)) } }><i className="fa fa-minus"></i></button>
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
