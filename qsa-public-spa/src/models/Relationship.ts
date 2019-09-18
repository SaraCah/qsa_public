import {newAspaceResultFromJsonModelType} from "../utils/typeResolver";
import {AspaceResult} from "./AspaceResult";

export class Relationship<T extends AspaceResult> {
  public jsonModelType: string;
  public targetType: string;
  public ref: string;
  public relator: string;
  public startDate: string;
  public endDate: string;
  public resolved!: T; // Are these ever not resolved?

  constructor (relationship: any) {
    this.jsonModelType = relationship.jsonmodel_type;
    this.targetType = relationship.relationship_target_record_type;
    this.ref = relationship.ref;
    this.relator = relationship.relator;
    this.startDate = relationship.start_date;
    this.endDate = relationship.end_date;
    if (!!relationship._resolved) {
      this.resolved = newAspaceResultFromJsonModelType(
        relationship.relationship_target_record_type || relationship._resolved.jsonmodel_type,
        relationship._resolved
      ) as T;
    }
  }
}