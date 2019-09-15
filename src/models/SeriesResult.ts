import {AspaceResult} from "./AspaceResult";
import {AspaceNote} from "./AspaceNote";
import {AspaceDate} from "./AspaceDate";
import {ExternalResource} from "./ExternalResource";
import {AgencyResult} from "./AgencyResult";
import {Relationship} from "./Relationship";

export class SeriesResult extends AspaceResult {
  get externalResources(): ExternalResource[] {
    return this._externalResources;
  }
  set externalResources(value: ExternalResource[]) {
    this._externalResources = value;
  }
  get notes(): AspaceNote[] {
    return this._notes;
  }
  set notes(value: AspaceNote[]) {
    this._notes = value;
  }
  get dates(): AspaceDate[] {
    return this._dates;
  }
  set dates(value: AspaceDate[]) {
    this._dates = value;
  }

  public responsible_agency?: AgencyResult;
  public has_digital_representations: boolean = false;
  public has_physical_representations: boolean = false;
  public displayString: string;
  public abstract?: string;
  public disposalClass?: string;
  public sensitivityLabel?: string;
  public description?: string;
  public copyrightStatus?: string;
  public informationSources?: string;
  public previousSystemIdentifiers?: string;
  public accessNotifications?: string;
  public agentRelationships: Relationship<AgencyResult>[] = [];
  public seriesRelationships: Relationship<SeriesResult>[] = [];
  public mandateRelationships: number[] = [];
  public functionRelationships: number[] = [];
  private _dates: AspaceDate[] = [];
  private _notes: AspaceNote[] = [];
  private _externalResources: ExternalResource[] = [];

  constructor (result: any) {
    super(result);
    if (!!result.responsible_agency) {
      this.responsible_agency = new AgencyResult(result.responsible_agency);
    }
    this.has_digital_representations = result.has_digital_representations;
    this.has_physical_representations = result.has_physical_representations;
    this.abstract = result.abstract;
    this.disposalClass = result.disposal_class;
    this.sensitivityLabel = result.sensitivity_label;
    this.description = result.description;
    this.copyrightStatus = result.copyright_status;
    this.informationSources = result.information_sources;
    this.previousSystemIdentifiers = result.previous_system_identifiers;
    this.displayString = result.display_string;

    if (!!result.dates && result.dates.length > 0) {
      this.dates = result.dates.map((date: any) => new AspaceDate(date));
    }
    if (!!result.notes && result.notes.length > 0) {
      this.notes = result.notes.map((note: any) => new AspaceNote(note));
    }
    if (!!result.externalResources && result.external_resources.length > 0 ) {
      this.externalResources = result.external_resources.map((externalResource: any) => new ExternalResource(externalResource));
    }
    if (!!result.agent_relationships && result.agent_relationships.length > 0 ) {
      this.agentRelationships = result.agent_relationships.map((agentRelationship: any) => new Relationship<AgencyResult>(agentRelationship));
    }
    if (!!result.series_relationships && result.series_relationships.length > 0 ) {
      this.seriesRelationships = result.series_relationships.map((seriesRelationship: any) => new Relationship<SeriesResult>(seriesRelationship));
    }
    if (!!result.mandate_relationships && result.mandate_relationships.length > 0 ) {
      this.mandateRelationships = result.mandate_relationships;
    }
    if (!!result.function_relationships && result.function_relationships.length > 0 ) {
      this.functionRelationships = result.function_relationships;
    }

    this.accessNotifications = result.access_notifications;
  }
}
