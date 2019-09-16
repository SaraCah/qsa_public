import {AspaceResultTypes} from "../utils/typeResolver";
import moment from "moment";

class AspaceClause {
  field!: string;
  operator!: string;
  query!: string;

  constructor (data: any) {
    this.field = data.field;
    this.operator = data.operator;
    this.query = data.query;
  }
}

export class AspaceSearchParameters {
  filter_start_date?: string;
  filter_end_date?: string;
  filter_types?: AspaceResultTypes[];
  filter_open_records_only?: boolean;
  filter_linked_digital_objects_only?: boolean;
  clauses: AspaceClause[] = [];

  constructor (data: any = {}) {
    this.mergeParameters(data);
  }

  mergeParameters (data: any) {
    if (Array.isArray(data.clauses)) {
      this.clauses = data.clauses.map((clause: any) => new AspaceClause(clause));
    }
    if (!!data.filterStartDate) {
      this.filter_start_date = `${moment(data.filterStartDate).get('year')}-01-01`;
    }
    if (!!data.filterEndDate) {
      const currentYear = moment(data.filterEndDate).get('year') + 1;
      this.filter_end_date = `${currentYear + 1}-12-31`;
    }
    if (!!data.filterTypes) {
      this.filter_types = data.filterTypes;
    }
    if (!!data.filter_open_records_only) {
      this.filter_open_records_only = data.filterOpenRecordsOnly;
    }
    if (!!data.filter_linked_digital_objects_only) {
      this.filter_linked_digital_objects_only = data.filterLinkedDigitalObjectsOnly;
    }
    return this;
  }
}