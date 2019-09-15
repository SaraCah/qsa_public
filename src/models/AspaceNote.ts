export class AspaceNote {
  public id: number;
  public title: string;
  public description: string;
  public subNotes: AspaceNote[] = [];

  constructor (note: any) {
    this.id = note.id;
    this.title = note.title;
    this.description = note.description;
    if (!!this.subNotes && note.subnotes.length > 0) {
      this.subNotes = note.subnotes.map((subNote: any) => new AspaceNote(subNote));
    }
  }
}