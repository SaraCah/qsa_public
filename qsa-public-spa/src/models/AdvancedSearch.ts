import queryString from 'query-string';

type HashSet = { [name: string]: boolean };

export interface Clause {
  id: number;
  boolean_operator?: string;
  query?: string;
  target_field?: string;
}

export interface Criteria {
  clauses: Clause[];
  filters: Filter[];
  recordTypes?: HashSet;
  fromDate?: string;
  toDate?: string;
  openRecordsOnly?: boolean;
  hasDigitalObjects?: boolean;
}

export interface Filter {
  field: string;
  value: string;
  label: string;
  isSticky: boolean;
}

export class AdvancedSearchQuery {
  private readonly criteria: Criteria;
  static clauseCount = 0;

  constructor(criteria: Criteria) {
    if (!criteria.clauses) {
      criteria.clauses = [];
    }

    if (!criteria.recordTypes) {
      criteria.recordTypes = {};
    }

    AdvancedSearchQuery.clauseCount += criteria.clauses.length;

    if (criteria.clauses.length === 0) {
      criteria.clauses.push(AdvancedSearchQuery.emptyClause());
    }

    this.criteria = criteria;
  }
  static emptyClause(): any {
    /* eslint-disable @typescript-eslint/camelcase */
    return {
      id: AdvancedSearchQuery.clauseCount++,
      boolean_operator: 'AND',
      query: '',
      target_field: 'keywords'
    };
    /* eslint-enable @typescript-eslint/camelcase */
  }

  setHasDigitalObjects(checked: boolean): AdvancedSearchQuery {
    const newCriteria: Criteria = { ...this.criteria };
    newCriteria.hasDigitalObjects = checked;
    return new AdvancedSearchQuery(newCriteria);
  }

  hasDigitalObjects(): boolean {
    return !!this.criteria.hasDigitalObjects;
  }

  setOpenRecordsOnly(checked: boolean): AdvancedSearchQuery {
    const newCriteria: Criteria = { ...this.criteria };
    newCriteria.openRecordsOnly = checked;
    return new AdvancedSearchQuery(newCriteria);
  }

  isOpenRecordsOnly(): boolean {
    return !!this.criteria.openRecordsOnly;
  }

  getClauses(): Clause[] {
    return this.criteria.clauses;
  }

  setFromDate(date: string): AdvancedSearchQuery {
    const newCriteria: Criteria = { ...this.criteria };
    newCriteria.fromDate = date;
    return new AdvancedSearchQuery(newCriteria);
  }

  getFromDate(): string | undefined {
    return this.criteria.fromDate;
  }

  setToDate(date: string): AdvancedSearchQuery {
    const newCriteria: Criteria = { ...this.criteria };
    newCriteria.toDate = date;
    return new AdvancedSearchQuery(newCriteria);
  }

  getToDate(): string | undefined {
    return this.criteria.toDate;
  }

  getTypeLimits(): string[] {
    if (this.criteria.recordTypes) {
      return Object.keys(this.criteria.recordTypes);
    } else {
      return [];
    }
  }

  setType(recordType: string, checked: boolean): AdvancedSearchQuery {
    const newCriteria: Criteria = { ...this.criteria };
    newCriteria.recordTypes = Object.assign({}, this.criteria.recordTypes, {
      [recordType]: checked
    });
    return new AdvancedSearchQuery(newCriteria);
  }

  isTypeSelected(recordType: string): boolean {
    if (!this.criteria.recordTypes || Object.keys(this.criteria.recordTypes).length === 0) {
      return false;
    } else {
      return !!this.criteria.recordTypes[recordType];
    }
  }

  addEmpty(): AdvancedSearchQuery {
    const newCriteria: Criteria = { ...this.criteria };
    newCriteria.clauses = newCriteria.clauses.concat([AdvancedSearchQuery.emptyClause()]);
    return new AdvancedSearchQuery(newCriteria);
  }

  map(fn: (clause: Clause, idx: number) => any): any[] {
    return this.criteria.clauses.map((clause, idx) => fn(clause, idx));
  }

  remove(idx: number): AdvancedSearchQuery {
    if (idx < this.criteria.clauses.length) {
      const newCriteria: Criteria = { ...this.criteria };
      newCriteria.clauses = newCriteria.clauses.slice(0, idx).concat(newCriteria.clauses.slice(idx + 1));
      return new AdvancedSearchQuery(newCriteria);
    } else {
      return this;
    }
  }

  setClauseField(idx: number, field: string, value: string): AdvancedSearchQuery {
    const updated = [...this.criteria.clauses];
    updated[idx] = Object.assign({}, updated[idx], { [field]: value });

    const newCriteria: Criteria = { ...this.criteria };
    newCriteria.clauses = updated;

    return new AdvancedSearchQuery(newCriteria);
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

  addFilter(field: string, value: string, label: string): AdvancedSearchQuery {
    const newFilter = { field, value, label, isSticky: false };
    const result = this.removeFilter(newFilter);
    result.criteria.filters.push(newFilter);

    return result;
  }

  addStickyFilter(field: string, value: string, label: string): AdvancedSearchQuery {
    const newFilter = { field, value, label, isSticky: true };
    const result = this.removeFilter(newFilter);
    result.criteria.filters.push(newFilter);

    return result;
  }

  removeFilter(filter: Filter): AdvancedSearchQuery {
    const newFilters = this.criteria.filters.filter(
      (elt: Filter) => !(elt.field === filter.field && elt.value === filter.value)
    );
    return new AdvancedSearchQuery(Object.assign({}, this.criteria, { filters: newFilters }));
  }

  hasFilter(field: string, value: string): boolean {
    for (const filter of this.criteria.filters) {
      if (filter.field === field && filter.value === value) {
        return true;
      }
    }

    return false;
  }

  filters(): Filter[] {
    return this.criteria.filters;
  }

  clearFilters(): AdvancedSearchQuery {
    const newFilters = this.criteria.filters.filter((f: Filter) => f.isSticky);
    return new AdvancedSearchQuery(Object.assign({}, this.criteria, { filters: newFilters }));
  }

  toQueryString(): string {
    /* eslint-disable @typescript-eslint/camelcase */
    return queryString.stringify(
      {
        op: this.criteria.clauses.map((c: Clause) => c.boolean_operator),
        q: this.criteria.clauses.map((c: Clause) => c.query),
        f: this.criteria.clauses.map((c: Clause) => c.target_field),
        ff: this.criteria.filters.map((f: Filter) => f.field),
        fv: this.criteria.filters.map((f: Filter) => f.value),
        fl: this.criteria.filters.map((f: Filter) => f.label),
        sf: this.criteria.filters.filter((f: Filter) => f.isSticky).map((f: Filter) => f.field),
        type: Object.keys(this.criteria.recordTypes || []).filter(
          (recordType: string) => this.criteria.recordTypes && this.criteria.recordTypes[recordType]
        ),
        from: this.criteria.fromDate,
        to: this.criteria.toDate,
        open: this.isOpenRecordsOnly(),
        has_digital: this.hasDigitalObjects()
      },
      {
        arrayFormat: 'bracket'
      }
    );
    /* eslint-enable @typescript-eslint/camelcase */
  }

  toJSON(): string {
    /* eslint-disable @typescript-eslint/camelcase */
    return JSON.stringify({
      clauses: this.criteria.clauses.map((clause: Clause) => {
        return {
          field: clause.target_field,
          operator: clause.boolean_operator,
          query: clause.query
        };
      }),
      filters: this.criteria.filters,
      filter_types: Object.keys(this.criteria.recordTypes || []).filter(
        (recordType: string) => this.criteria.recordTypes && this.criteria.recordTypes[recordType]
      ),
      filter_start_date: this.criteria.fromDate,
      filter_end_date: this.criteria.toDate,
      filter_open_records_only: this.isOpenRecordsOnly(),
      filter_linked_digital_objects_only: this.hasDigitalObjects()
    });
    /* eslint-enable @typescript-eslint/camelcase */
  }

  static emptyQuery(): AdvancedSearchQuery {
    return new AdvancedSearchQuery({
      clauses: [],
      filters: []
    });
  }

  static fromQueryString(searchString: string): AdvancedSearchQuery {
    const raw: any = queryString.parse(searchString, {
      arrayFormat: 'bracket'
    });

    if (!raw.ff) {
      raw.ff = [];
    }
    if (!raw.fv) {
      raw.fv = [];
    }
    if (!raw.fl) {
      raw.fl = [];
    }
    if (!raw.sf) {
      raw.sf = [];
    }

    const result = AdvancedSearchQuery.emptyQuery();

    if (raw.q) {
      result.criteria.clauses = raw.q.map((queryString: string, idx: number) => {
        /* eslint-disable @typescript-eslint/camelcase */
        return {
          id: idx,
          query: queryString,
          boolean_operator: raw.op[idx] || 'AND',
          target_field: raw.f[idx] || 'keywords'
        };
        /* eslint-enable @typescript-eslint/camelcase */
      });
    }

    // ff = filter field; fv = filter value; fl = filter label
    if (raw.ff) {
      result.criteria.filters = raw.ff
        .map((filterField: string, idx: number) => {
          if (raw.fv[idx] && raw.fl[idx]) {
            return {
              field: filterField,
              value: raw.fv[idx],
              label: raw.fl[idx],
              isSticky: raw.sf.indexOf(filterField) >= 0
            };
          } else {
            return null;
          }
        })
        .filter((e: any) => e);
    }

    if (raw.type) {
      result.criteria.recordTypes = {};
      raw.type.forEach(
        (recordType: string) => result.criteria.recordTypes && (result.criteria.recordTypes[recordType] = true)
      );
    }

    if (raw.from) {
      result.criteria.fromDate = raw.from;
    }

    if (raw.to) {
      result.criteria.toDate = raw.to;
    }

    if (raw.open) {
      result.criteria.openRecordsOnly = raw.open === 'true';
    }

    if (raw.has_digital) {
      result.criteria.hasDigitalObjects = raw.has_digital === 'true';
    }

    return result;
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
