import {AspaceResult} from "./AspaceResult";
import {Dispatch, SetStateAction} from "react";

export interface AppState {
  selectedResult: [AspaceResult | undefined, Dispatch<SetStateAction<AspaceResult | undefined>>]
}