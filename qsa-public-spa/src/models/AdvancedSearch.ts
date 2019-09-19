// import {AspaceResultTypes} from "../utils/typeResolver";
// import moment from "moment";
import queryString from "query-string";

type HashSet = { [name:string]: boolean };

export interface Clause {
  id: number;
  boolean_operator?: string;
  query?: string;
  target_field?: string;
}

export class AdvancedSearchQuery {
  private readonly clauses: Clause[];
  private readonly recordTypes: HashSet;

  static clauseCount: number = 0;

  constructor(clauses?: Clause[], recordTypes?: HashSet) {
    if (clauses) {
      this.clauses = clauses;
    } else {
      this.clauses = [];
    }

    if (recordTypes) {
      this.recordTypes = recordTypes;
    } else {
      this.recordTypes = {};
    }

    AdvancedSearchQuery.clauseCount += this.clauses.length;

    if (this.clauses.length === 0) {
      this.clauses.push(AdvancedSearchQuery.emptyClause());
    }
  }

  static emptyClause() {
    return {
      id: AdvancedSearchQuery.clauseCount++,
      boolean_operator: 'AND',
      query: '',
      target_field: 'keywords'
    };
  }

  setType(recordType: string, checked: boolean): AdvancedSearchQuery {
    return new AdvancedSearchQuery(this.clauses, Object.assign({}, this.recordTypes, {[recordType]: checked}));
  }

  isTypeSelected(recordType:string): boolean {
    if (Object.keys(this.recordTypes).length === 0) {
      return false;
    } else {
      return this.recordTypes[recordType];
    }
  }

  addEmpty(): AdvancedSearchQuery {
    return new AdvancedSearchQuery(this.clauses.concat([AdvancedSearchQuery.emptyClause()]), this.recordTypes);
  }

  map(fn: (clause: Clause, idx: number) => any): any[] {
    return this.clauses.map((clause, idx) => fn(clause, idx));
  }

  remove(idx: number): AdvancedSearchQuery {
    if (idx < this.clauses.length) {
      return new AdvancedSearchQuery(this.clauses.slice(0, idx).concat(this.clauses.slice(idx + 1)), this.recordTypes);
    } else {
      return this;
    }
  }

  setClauseField(idx: number, field: string, value: string): AdvancedSearchQuery {
    let updated = [...this.clauses];
    updated[idx] = Object.assign({}, updated[idx], {[field]: value});

    return new AdvancedSearchQuery(updated, this.recordTypes);
  }

  operatorChanged(event: any, idx: number): AdvancedSearchQuery {
    return this.setClauseField(idx, 'boolean_operator', event.target.value);
  }

  fieldChanged(event: any, idx: number): AdvancedSearchQuery {
    return this.setClauseField(idx, 'target_field', event.target.value);
  }

  queryChanged(event: any, idx: number): AdvancedSearchQuery {
    return this.setClauseField(idx, 'query', event.target.value);
  }

  toQueryString() {
    return queryString.stringify({
      op: this.clauses.map((c: Clause) => c.boolean_operator),
      q: this.clauses.map((c: Clause) => c.query),
      f: this.clauses.map((c: Clause) => c.target_field),
      type: Object.keys(this.recordTypes).filter((recordType: string) => this.recordTypes[recordType]),
    }, {
      arrayFormat: 'bracket',
    });
  }

  toJSON() {
    return JSON.stringify({
      clauses: this.clauses.map((clause: Clause) => {
        return {
          'field': clause.target_field,
          'operator': clause.boolean_operator,
          'query': clause.query,
        }
      }),
      filter_types: Object.keys(this.recordTypes).filter((recordType: string) => this.recordTypes[recordType]),
    })
  }

  static fromQueryString(searchString: string) {
    const raw:any = queryString.parse(searchString, {arrayFormat: 'bracket'});
    const clauses:Clause[] = raw.q.map((queryString: string, idx: number) => {
      return {
        id: idx,
        query: queryString,
        boolean_operator: raw.op[idx] || 'AND',
        target_field: raw.f[idx] || 'keywords',
      }
    });

    const recordTypes: HashSet = {};
    if (raw.type) {
      raw.type.forEach((recordType: string) => recordTypes[recordType] = true)
    }

    return new AdvancedSearchQuery(clauses, recordTypes);
  }
}

// class AspaceClause {
//   field!: string;
//   operator!: string;
//   query!: string;
//
//   constructor (data: any) {
//     this.field = data.field;
//     this.operator = data.operator;
//     this.query = data.query;
//   }
// }

// export class AdvancedSearch {
//   filter_start_date?: string;
//   filter_end_date?: string;
//   filter_types?: ResultTypes[];
//   filter_open_records_only?: boolean;
//   filter_linked_digital_objects_only?: boolean;
//   clauses: AspaceClause[] = [];
//
//   constructor (data: any = {}) {
//     this.mergeParameters(data);
//   }
//
//   mergeParameters (data: any) {
//     if (Array.isArray(data.clauses)) {
//       this.clauses = data.clauses.map((clause: any) => new AspaceClause(clause));
//     }
//     if (!!data.filterStartDate) {
//       this.filter_start_date = `${moment(data.filterStartDate).get('year')}-01-01`;
//     }
//     if (!!data.filterEndDate) {
//       const currentYear = moment(data.filterEndDate).get('year') + 1;
//       this.filter_end_date = `${currentYear + 1}-12-31`;
//     }
//     if (!!data.filterTypes) {
//       this.filter_types = data.filterTypes;
//     }
//     if (!!data.filter_open_records_only) {
//       this.filter_open_records_only = data.filterOpenRecordsOnly;
//     }
//     if (!!data.filter_linked_digital_objects_only) {
//       this.filter_linked_digital_objects_only = data.filterLinkedDigitalObjectsOnly;
//     }
//     return this;
//   }
// }