import React from "react";
import {AgencyResult} from "../models/AgencyResult";
import {SeriesResult} from "../models/SeriesResult";
import {
  dateArticleElement,
  noteArticleElement,
  basiclistElement, externalResourceArticleElement
} from "./resultViewTemplates";

export const agencyResultView = (agency: AgencyResult) => {
  const hasAgentRelationships = agency.agentRelationships.length > 0,
    hasSeriesRelationships = agency.seriesRelationships.length > 0,
    hasNotes = agency.notes.length > 0,
    hasDates = agency.dates.length > 0;
  return (
    <>
      <h1>{agency.displayString}</h1>
      <h2 className="sr-only">Basic information</h2>
      <section className="core-information">
        <p className="lead">{agency.abstract}</p>
        <ul className="list-group list-group-horizontal">
          <li className="list-group-item">
            <span className="small">ID</span><br/>
            {agency.qsaIdPrefixed}
          </li>
          <li className="list-group-item">
            <span className="small">Primary name</span><br/>
            {agency.primaryName}
          </li>
          <li className="list-group-item">
            <span className="small">Alternative name</span><br/>
            {agency.alternativeName}
          </li>
          <li className="list-group-item">
            <span className="small">Acronym</span><br/>
            {agency.acronym}
          </li>
        </ul>
      </section>

      <h2 id="accordion-details" className="sr-only">Detailed information</h2>
      {hasNotes && hasDates &&
      <section className="qg-accordion qg-dark-accordion" aria-label="Accordion Label">
        <input type="radio" name="control" id="collapse" className="controls collapse" value="collapse" role="radio"/>
        <label htmlFor="collapse" className="controls">Collapse details</label>
        <span className="controls">&#124;</span>
        <input name="control" id="expand-series-details" className="controls expand" value="expand" role="radio"/>
        <label htmlFor="expand-series-details" className="controls">Show details</label>
        {dateArticleElement('agency', agency.dates)}
        {agency.notes.map(note => noteArticleElement(note))}
      </section>
      }
      {(hasAgentRelationships || hasSeriesRelationships) &&
      <section className="qg-accordion qg-dark-accordion">
          <h2>Agency relationships</h2>
        {hasAgentRelationships &&
        <>
            <h3>Related agencies</h3>
            <ul className="list-group list-group-flush">
              {agency.agentRelationships.map(agentRelationship => (
                <li className="list-group-item">
                  <span className="small">{agentRelationship.relator}</span><br/>
                  {agentRelationship.resolved.qsaIdPrefixed} - {agentRelationship.resolved.displayString}:&nbsp;
                  {agentRelationship.startDate}{!!agentRelationship.endDate ? ` - ${agentRelationship.endDate}` : ''}
                </li>
              ))}
            </ul>
        </>
        }
        {hasSeriesRelationships &&
        <>
            <h3>Related series</h3>
            <ul className="list-group list-group-flush">
              {agency.seriesRelationships.map(seriesRelationship => (
                <li className="list-group-item">
                  <h4>{seriesRelationship.resolved.qsaIdPrefixed} - {seriesRelationship.resolved.title}</h4>
                  <span>{seriesRelationship.relator}</span>
                  {seriesRelationship.startDate}{!!seriesRelationship.endDate ? ` - ${seriesRelationship.endDate}` : ''}
                </li>
              ))}
            </ul>
        </>
        }
      </section>
      }
    </>
  )
};

export const seriesResultView = (series: SeriesResult) => {
  const hasAgentRelationships = series.agentRelationships.length > 0,
    hasSeriesRelationships = series.seriesRelationships.length > 0,
    hasNotes = series.notes.length > 0,
    hasDates = series.dates.length > 0,
    hasExternalResources = series.externalResources.length > 0;
  return (
    <>
      <h1>{series.displayString}</h1>
      <h2 className="sr-only">Basic information</h2>
      <section className="core-information">
        <p className="lead">{series.abstract}</p>
        <ul className="list-group list-group-horizontal-md">
          <li className="list-group-item">
            <span className="small">ID</span><br/>
            {series.qsaIdPrefixed}
          </li>
        </ul>
        <h3 className="sr-only">Series descriptive metadata</h3>
        <ul className="list-group list-group-flush">
          {basiclistElement('Disposal class', series.disposalClass)}
          {basiclistElement('Sensitivity label', series.sensitivityLabel)}
          {basiclistElement('Copyright status', series.copyrightStatus)}
          {basiclistElement('Information sources', series.informationSources)}
          {basiclistElement('Previous identifiers', series.previousSystemIdentifiers)}
          {basiclistElement('Access notifications', series.accessNotifications)}
        </ul>
      </section>
      {(hasNotes || hasExternalResources || hasDates) &&
      <>
        <h2 id="accordion">Detailed information</h2>
        <section className="qg-accordion qg-dark-accordion">
          <input type="radio" name="control" id="collapse" className="controls collapse" value="collapse"/>
          <label htmlFor="collapse" className="controls">Collapse details</label>
          <span className="controls">&#124;</span>
          <input type="radio" name="control" id="expand" className="controls expand" value="expand" role="radio"/>
          <label htmlFor="expand" className="controls">Show details</label>
          {dateArticleElement('series', series.dates)}
          {series.notes.map(note => noteArticleElement(note))}
          {series.externalResources.map((externalResource, index) =>
            externalResourceArticleElement(
              index.toString(),
              externalResource
            ))
          }
        </section>
      </>
      }
      {(hasAgentRelationships || hasSeriesRelationships) &&
        <section className="qg-accordion qg-dark-accordion">
          <h2>Series relationships</h2>
          {hasAgentRelationships &&
          <>
            <h3>Related agencies</h3>
            <ul className="list-group list-group-flush">
              {series.agentRelationships.map(agentRelationship => (
                <li key={agentRelationship.resolved.id} className="list-group-item">
                  <span className="small">{agentRelationship.relator}</span><br/>
                  {agentRelationship.resolved.qsaIdPrefixed} - {agentRelationship.resolved.displayString}:&nbsp;
                  {agentRelationship.startDate}{!!agentRelationship.endDate ? ` - ${agentRelationship.endDate}` : ''}
                </li>
              ))}
            </ul>
          </>
          }
          {hasSeriesRelationships &&
          <>
            <h3>Related series</h3>
            <ul className="list-group list-group-flush">
              {series.seriesRelationships.map(seriesRelationship => (
                <li className="list-group-item">
                  <h4>{seriesRelationship.resolved.title} {seriesRelationship.resolved.qsaIdPrefixed}</h4>
                  <span>{seriesRelationship.relator}</span>
                  {seriesRelationship.startDate}{!!seriesRelationship.endDate ? ` - ${seriesRelationship.endDate}` : ''}
                </li>
              ))}
            </ul>
          </>
          }
          {!!series.responsibleAgency &&
          <>
            <h3>Responsible agency</h3>
            <p>
                <span>{series.responsibleAgency.resolved.qsaIdPrefixed} - {series.responsibleAgency.resolved.displayString}</span><br/>
                <span>{series.responsibleAgency.relator}</span>
              {series.responsibleAgency.startDate}{!!series.responsibleAgency.endDate ? ` - ${series.responsibleAgency.endDate}` : ''}
            </p>
          </>
          }
          {!!series.creatingAgency &&
          <>
            <h3>Responsible agency</h3>
            <p>
                <span>{series.creatingAgency.resolved.qsaIdPrefixed} - {series.creatingAgency.resolved.displayString}</span><br/>
                <span>{series.creatingAgency.relator}</span>
              {series.creatingAgency.startDate}{!!series.creatingAgency.endDate ? ` - ${series.creatingAgency.endDate}` : ''}
            </p>
          </>
          }
        </section>
      }
    </>
  );
};