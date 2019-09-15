import {AspaceDate} from "../models/AspaceDate";
import React from "react";

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

export const noteArticleElement = (id: string, name: string, value?: string | JSX.Element) => {
  if (!value) {
    return '';
  }
  return (
    <article>
      <input id={`panel-note-${id}`} type="checkbox" name="tabs" aria-controls={`panel-content-note-${id}`}/>
      <h3 className="acc-heading">
        <label htmlFor={`panel-note-${id}`}>
          Note type: {name}
          <span className="arrow"><i/></span>
        </label>
      </h3>
      <div className="collapsing-section" aria-hidden="true" id={`panel-content-note-${id}`}>
        <p>{value}</p>
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
          {values.map((date: AspaceDate) => (
            <li>
              <span className="small">{date.label}</span><br/>
              {date.start}{date.end ? ` - ${date.end}` : ''} {date.startCertainty || date.endCertainty}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
};