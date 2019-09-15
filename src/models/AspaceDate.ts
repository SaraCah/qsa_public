import {AspaceNote} from "./AspaceNote";

export class AspaceDate {
  public start!: string;
  public end?: string;
  public label: string = '';
  public notes: AspaceDate[] = [];
  public startCertainty: string = '';
  public endCertainty?: string;

  constructor (date: any) {
    this.start = date.begin;
    this.end = date.end;
    this.label = date.label;
    if (!!date.notes && date.notes.length > 0) {
      this.notes = date.map((note: any) => new AspaceNote(note));
    }
    if (!!date.startCertainty) {
      this.startCertainty = date.startCertainty;
    }
    if (!!this.end && date.endCertainty) {
      this.endCertainty = date.endCertainty;
    }
  }
}