export class DisplayResult {
  public displayFrom: number = 0;
  public displayTo: number = 10;
  public data: any[] = [];

  public displayResults (filterType?: string): any[] {
    let result = [];
    if (!this.data) { return []; }
    if (!!filterType) {
      result = this.data.filter(result => result.primary_type === filterType)
    }
    return result.slice(this.displayFrom, this.displayTo);
  };

  constructor (data: any[], displayFrom = 0, displayTo = 20) {
    data.forEach(result => {
      switch (result.primary_type) {
        case "agent_corporate_entity":
          this.data.push(result);
          break;
        case "resource":
          this.data.push(result);
          break;
        default:
          break;
      }
    });
  }
}
