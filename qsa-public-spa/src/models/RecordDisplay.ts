interface TextNote {
    kind: 'text',
    text: string[];
}

interface OrderedListNote {
    kind: 'orderedlist',
    title: string,
    items: string[];
}

interface DefinedListNote {
    kind: 'definedlist',
    title: string,
    items: {label:string, value: string}[];
}

interface ChronologyNote {
    kind: 'chronology',
    title: string,
    items: {event_date:string, value: string[]}[];
}

export type Note = TextNote | OrderedListNote | DefinedListNote | ChronologyNote;


export class RecordDisplay {
    private readonly record: any;

    constructor (record: any) {
        this.record = record;
    }

    get(fieldName:string): string {
        return this.record[fieldName];
    }

    getMaybe(fieldName:string, callback: any): any {
        if (this.get(fieldName)) {
            return callback(this.get(fieldName));
        } else {
            return [];
        }
    }

    getArray(fieldName: string): any[] {
        if (this.record[fieldName]) {
            if (Array.isArray(this.record[fieldName])) {
                return this.record[fieldName];
            } else {
                return [this.record[fieldName]];
            }
        } else {
            return [];
        }
    }

    // const maybeValue = (field: any, callback: any): any => {
    //     if (field === 'foopants') {
    //         return callback('hooray!');
    //     } else {
    //         return [];
    //     }
    // };

    getFirst(fieldName: string, callback: any): any {
        const anArray = this.getArray(fieldName);
        if (anArray.length > 0) {
            return callback(anArray[0]);
        } else {
            return [];
        }
    }

    getNotes(noteType: string, noteLabel: string, callback: any): any {
        const notes: any = this.getArray('notes');
        const result: Note[] = [];

        notes.forEach((note:any) => {
            if (note.type != noteType) {
                return;
            }

            if (noteLabel && note.note_label != noteLabel) {
                return;
            }

            if (note.jsonmodel_type === 'note_singlepart') {
                result.push({
                    kind: 'text',
                    text: note.content,
                })
            } else if (note.jsonmodel_type === 'note_multipart') {
                
            }
        });

        if (result.length > 0) {
            return callback(result);
        } else {
            return [];
        }
    }
}