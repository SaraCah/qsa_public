export class AspaceNote {
  public id: number;
  public label: string;
  public subNotes: AspaceSubNote[] = [];
  public publish: boolean;
  public jsonModelType: string;

  constructor (note: any) {
    this.id = note.persistent_id;
    this.jsonModelType = note.jsonmodel_type;
    this.publish = note.publish;
    this.label = note.label;
    if (!!this.subNotes && note.subnotes.length > 0) {
      this.subNotes = note.subnotes.map((subNote: any) => new AspaceSubNote(subNote));
    }
  }
}

export class AspaceSubNote {
  public jsonModelType: string;
  public content: string = '';
  public publish: boolean;

  constructor (subNote: any) {
    this.jsonModelType = subNote.jsonmodel_type;
    this.content = subNote.content;
    this.publish = subNote.publish;
  }

}