import {AgencyResult} from "../models/AgencyResult";
import {SeriesResult} from "../models/SeriesResult";
import {AspaceResult} from "../models/AspaceResult";

enum AspaceResultTypes {
  Agency = "agent_corporate_entity",
  Series = "resource"
}


export const newAspaceResultFromJsonModelType = (jsonModelType: string, params: any): AspaceResult => {
  let constructor;
  switch (jsonModelType) {
    case AspaceResultTypes.Agency:
      constructor = AgencyResult;
      break;
    case AspaceResultTypes.Series:
      constructor = SeriesResult;
      break;
    default:
      throw new Error(`Something went wrong. Invalid type: ${jsonModelType}`);
  }
  return new constructor(params);
};