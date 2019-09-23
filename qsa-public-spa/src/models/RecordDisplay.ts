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
        const notes = this.getArray('notes');
        notes.filter((note:any) => {
        })
    }
}