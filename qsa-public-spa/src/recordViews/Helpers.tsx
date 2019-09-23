import React from "react";
import {Note} from "../models/RecordDisplay";
import {iconForType, labelForRelator, uriFor} from "../utils/typeResolver";
import {Link} from "react-router-dom";

export const NoteDisplay: React.FC<{note: Note}> = ({ note }) => {
    switch (note.kind) {
        case "text": return (<div> { note.text.map((content:string) => <p>{ content }</p>) }</div>);
        case "orderedlist": return (<div>
            <p>{ note.title }</p>
            <ol>
                {
                    note.items.map((item: string) => <li>{ item }</li>)
                }
            </ol>
        </div>);
        case "definedlist": return (<div>
            <p>{ note.title }</p>
            <dl>
                {
                    note.items.map(({label, value}) => {
                        return <>
                            <dt>{ label }</dt>
                            <dd>{ value }</dd>
                        </>
                    })
                }
            </dl>
        </div>);
        case "chronology": return (<div>
            <p>{ note.title }</p>
            <dl>
                {
                    note.items.map(({event_date, value}) => {
                        return <>
                            <dt>{ event_date }</dt>
                            {
                                value.map((v: string) => {
                                    return <dd>{ v }</dd>
                                })
                            }
                        </>
                    })
                }
            </dl>
        </div>);
    }
}


export const Relationship: React.FC<{relationship: any}> = ({ relationship }) => {
    return (<>
            <i className={ iconForType(relationship._resolved.jsonmodel_type) } aria-hidden="true"></i>&nbsp;
            <Link to={ uriFor(relationship._resolved.qsa_id_prefixed, relationship._resolved.jsonmodel_type) }>
                { relationship._resolved.display_string }
            </Link><br/>
            Relator: { labelForRelator(relationship.relator) }<br/>
            { relationship.start_date }&nbsp;-&nbsp;{ relationship.end_date }
        </>
    )
}

export const AccordionPanel: React.FC<{id: string, title: string, children: any}> = ({ id, title, children }) => {
    return (<article>
        <input id={ id } type="checkbox" name="tabs" aria-controls={ `${id}-content` } aria-expanded="false" role="checkbox"/>
        <h3 className="acc-heading">
            <label htmlFor={ id }>{ title } <span className="arrow"> <i></i></span></label>
        </h3>
        <div className="collapsing-section" aria-hidden="true" id={ `${id}-content` }>
            { children }
        </div>
    </article>
    )
}

export const MaybeLink: React.FC<{location: string, label: string}> = ({ location, label }) => {
    if (/^http/i.test(location)) {
        return <a href={ location } target="_blank">{ label }</a>
    } else if (label === location) {
        return <p>{ location }</p>;
    } else {
        return <p>{ label }: { location }</p>
    }
}