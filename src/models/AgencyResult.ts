import {AspaceResult} from "./AspaceResult";
import {AspaceDate} from "./AspaceDate";
import {AspaceNote} from "./AspaceNote";
import {ExternalResource} from "./ExternalResource";
import {Relationship} from "./Relationship";
import {SeriesResult} from "./SeriesResult";

export class AgencyResult extends AspaceResult {
  public dates: AspaceDate[] = [];
  public informationSources: string[];
  public notes: AspaceNote[] = [];
  public externalResources: ExternalResource[];
  public agentRelationships: Relationship<AgencyResult>[] = [];
  public seriesRelationships: Relationship<SeriesResult>[] = [];
  public mandateRelationships: [];
  public functionRelationships: [];
  public abstract?: string;
  public primaryName?: string;
  public acronym?: string;
  public alternativeName?: string;
  public description?: string;
  public disposalClass?: string;

  constructor(result: any) {
    super(result);
    this.abstract = result.abstract;
    if (!!result.display_name) {
      this.acronym = result.display_name.acronym;
      this.alternativeName = result.display_name.alternative_name;
      this.primaryName = result.display_name.primary_name;
    }
    if (!!result.dates) {
      this.dates = result.dates;
    }
    this.informationSources = result.information_sources;
    this.description = result.description;
    this.disposalClass = result.disposal_class;
    this.notes = result.notes;
    this.externalResources = result.external_resources;
    if (!!result.agent_relationships && result.agent_relationships.length > 0 ) {
      this.agentRelationships = result.agent_relationships.map((agentRelationship: any) => new Relationship<AgencyResult>(agentRelationship));
    }
    if (!!result.series_relationships && result.series_relationships.length > 0 ) {
      this.seriesRelationships = result.series_relationships.map((seriesRelationship: any) => new Relationship<SeriesResult>(seriesRelationship));
    }
    this.mandateRelationships = result.mandate_relationships;
    this.functionRelationships = result.function_relationships;
  }
}
