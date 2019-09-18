import {AspaceNote} from "./AspaceNote";

export class AspaceDate {
  get expression(): string {
    return !!this._expression ?
      this._expression :
      `${this.start} ${!!this.end ? ' - ' + this.end : '' }`;
  }

  set expression(value: string) {
    this._expression = value;
  }
  public start!: string;
  public end?: string;
  public label: string = '';
  public notes: string[] = [];
  public startCertainty: string = '';
  public endCertainty?: string;
  private _expression?: string;

  constructor (date: any) {
    this.start = date.begin;
    this.end = date.end;
    this.label = date.label;
    this.expression = date.expression;
    if (!!date.notes && date.notes.length > 0) {
      this.notes = date.map((note: any) => note);
    }
    this.startCertainty = date.certainty;
    if (!!this.end && date.endCertainty) {
      this.endCertainty = date.certainty_end;
    }
  }
}