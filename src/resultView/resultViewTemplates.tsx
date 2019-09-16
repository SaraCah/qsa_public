import {AspaceDate} from "../models/AspaceDate";
import React from "react";
import {AspaceNote} from "../models/AspaceNote";
import {ExternalResource} from "../models/ExternalResource";

export const basiclistElement = (name: string, value?: string) => {
  if (!value) {
    return ''
  }
  return (
    <li className="list-group-item list-group-item-action">
      <div className="d-flex w-100 justify-content-between">
        <h4 className="mb-1">{name}</h4>
      </div>
      <p className="mb-1">{value}</p>
    </li>
  )
};

export const noteArticleElement = (value: AspaceNote) => {
  console.log(value);
  if (!value || !value.subNotes || value.subNotes.filter(subNote => subNote.publish).length === 0) {
    return '';
  }
  return (
    <article key={value.id}>
      <input id={`panel-note-${value.id}`} type="checkbox" name="tabs" aria-controls={`panel-content-note-${value.id}`}/>
      <h3 className="acc-heading">
        <label htmlFor={`panel-note-${value.id}`}>
          Note type: {value.label}
          <span className="arrow"><i/></span>
        </label>
      </h3>
      <div className="collapsing-section" aria-hidden="true" id={`panel-content-note-${value.id}`}>
        <ul>
          <span className="small">{value.label}</span><br/>
          {value.subNotes
            .filter(subNote => subNote.publish)
            .map((subNote, index) => <p key={index}>{subNote.content}</p>)}
        </ul>
      </div>
    </article>
  )
};

export const externalResourceArticleElement = (id: string, value: ExternalResource) => {
  return (
    <article>
      <input id={`panel-note-${id}`} type="checkbox" name="tabs" aria-controls={`panel-content-note-${id}`}/>
      <h3 className="acc-heading">
        <label htmlFor={`panel-note-${id}`}>
          {`External resources: ${value.title}`}
          <span className="arrow"><i/></span>
        </label>
      </h3>
      <div className="collapsing-section" aria-hidden="true" id={`panel-content-note-${id}`}>
        <p>
          {value.title}<br/>
          {value.location}
        </p>
      </div>
    </article>
  )
};

export const dateArticleElement = (idPrefix: string, values: AspaceDate[]) => {
  if (values.length === 0) {
    return '';
  }
  return (
    <article>
      <input id={`panel-date-${idPrefix}`} type="checkbox" name="tabs" aria-controls={`panel-content-date-${idPrefix}`}/>
      <h3 className="acc-heading">
        <label htmlFor={`panel-date-${idPrefix}`}>Dates<span className="arrow"><i/></span></label>
      </h3>
      <div className="collapsing-section" aria-hidden="true" id={`panel-content-date-${idPrefix}`}>
        <ul>
          {values.map((date: AspaceDate, index) => (
            <li key={index}>
              <span className="small">{date.label}</span><br/>
              {date.start}{date.end ? ` - ${date.end}` : ''} {date.startCertainty || date.endCertainty}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
};