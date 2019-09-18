import React, {useState} from 'react';

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
    const emptyClause = new Clause();

    emptyClause.boolean_operator = 'AND'
    emptyClause.query = '';
    emptyClause.target_field = 'keywords';

    return emptyClause;
  }

  addEmpty() {
    return new Clauses(this.clauses.concat([this.emptyClause()]));
  }

  map(fn: (clause: Clause, idx: number) => any) {
    return this.clauses.map((clause, idx) => fn(clause, idx));
  }

  remove(idx: number) {
    if (idx < this.clauses.length) {
      return new Clauses(this.clauses.slice(0, idx).concat(this.clauses.slice(idx + 1)));
    } else {
      return this;
    }

    /* FIXME */
    return this;
  }
}

class Clause {
  boolean_operator?: string;
  query?: string;
  target_field?: string;
}

const AspaceAdvancedSearch: React.FC = () => {
  const [clauses, setClauses] = useState(new Clauses());

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

  return (
    <div id="advancedSearchContainer" className="container">
      <form method="GET" action="/search">
        {
          clauses.map((clause, idx) => (
            <div>
              <select name="op[]" style={{visibility: (idx === 0) ? 'hidden' : 'visible'}}>
                <option value="AND">AND</option>
                <option value="OR">OR</option>
                <option value="NOT">NOT</option>
              </select>
              <input type="text" name="q[]"></input>
              <select name="f[]">
                <option value="keywords">keywords</option>
              </select>
              <button onClick={ (e) => { e.preventDefault(); setClauses(clauses.addEmpty()) } }>Add Clause</button>
              {
              idx > 0 &&
              <button onClick={ (e) => { e.preventDefault(); setClauses(clauses.remove(idx)) } }>Drop Clause</button>
              }
            </div>
          ))
        }
      </form>
    </div>
  );
};

export default AspaceAdvancedSearch;
