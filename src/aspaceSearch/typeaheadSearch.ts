import {Http} from "../utils/http";
import moment from "moment";
import {DisplayResult} from "../models/DisplayResult";

export class TypeaheadSearch {
  public searchText: string = '';
  private readonly setResults: Function;
  private lastRun: number = moment.now();

  constructor (setResults: Function) {
    this.setResults = setResults;
  }

  updateSearchText (newText: string): any {
    const newTime = moment.now();
    if (newText.length !== this.searchText.length && newText.length > 2) {
      if (moment(newTime).isAfter(moment(this.lastRun).add(1, 'second'))) {
        this.fetchSearchResults(newText, newTime);
      } else {
        window.setTimeout(() => {
          this.fetchSearchResults(newText, moment.now());
        }, 1000);
      }
    }
  }

  private fetchSearchResults = (searchText: string, newTime: number) => {
    this.searchText = searchText;
    Http.fetchResults(this.searchText)
      .then(results => {
        this.lastRun = newTime;
        this.setResults(new DisplayResult(results || []));
      });
  }
}