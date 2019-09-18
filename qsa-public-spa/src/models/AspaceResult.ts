export abstract class AspaceResult {
  public types: Array<string> = [];
  public json: object = {};
  public id!: string;
  public title!: string;
  public displayString?: string;
  public uri!: string;
  public jsonModelType: string;
  public qsaId!: string;
  public qsaIdPrefixed!: string;
  public startDate: string;
  public endDate: string;

  protected constructor (result: any) {
    this.id = result.id;
    this.title = result.title;
    this.displayString = result.display_string;
    this.uri = result.uri;
    this.jsonModelType = result.jsonmodel_type;
    this.types = result.types;
    this.qsaId = result.qsa_id;
    this.qsaIdPrefixed = result.qsa_id_prefixed;
    if (!!result.json) {
      this.json = result.json;
    }
    this.startDate = result.start_date;
    this.endDate = result.end_date;
  }
}
