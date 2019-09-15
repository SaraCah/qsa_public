export class ExternalResource {
  public title: string;
  public location: string;

  constructor (externalResource: any) {
    this.title = externalResource.title;
    this.location = externalResource.location;
  }
}