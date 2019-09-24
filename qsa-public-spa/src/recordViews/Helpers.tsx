import React, {useState} from "react";
import {Note, RecordDisplay} from "../models/RecordDisplay";
import {iconForType, labelForRelator, uriFor} from "../utils/typeResolver";
import {Link} from "react-router-dom";
import {Http} from "../utils/http";
import Layout from "./Layout";
import {AdvancedSearchQuery} from "../models/AdvancedSearch";

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


interface Context {
    current_uri: string;
    path_to_root: any[];
    siblings: any[];
    children: any[];
    siblings_count: number;
    children_count: number;
}


const RecordContextSiblings: React.FC<{context: Context}> = ({ context }) => {
    let siblingsQuery: AdvancedSearchQuery|null = null;
    let childrenQuery: AdvancedSearchQuery|null = null;

    if (context.siblings_count > context.siblings.length) {
        const parent: any = context.path_to_root[context.path_to_root.length - 1];
        siblingsQuery = AdvancedSearchQuery.emptyQuery()
                                           .addFilter('parent_id', parent.id, parent.display_string)
    }

    if (context.children_count> context.children.length) {
        const current: any = context.siblings.find((record: any) => (record.uri === context.current_uri));
        childrenQuery = AdvancedSearchQuery.emptyQuery()
            .addFilter('parent_id', current.id, current.display_string);
    }

    return (
        <ul>
            {
                (context.siblings[0].position && context.siblings[0].position > 0) ?
                    <li>&hellip;</li> :
                    <></>
            }
            {
                context.siblings.map((sibling: any, idx: number) => {
                    const isCurrent = context.current_uri === sibling.uri;

                    return <li key={ sibling.id } className={ isCurrent ? 'current' : ''}>
                        {
                            (sibling.children_count > 0) ? <i className={ iconForType('resource') } aria-hidden="true"></i> :
                            <i className={ iconForType(sibling.jsonmodel_type) } aria-hidden="true"></i>
                        }&nbsp;
                        {
                            isCurrent ?
                                <span>{ sibling.display_string }</span> :
                                <Link to={ uriFor(sibling.qsa_id_prefixed, sibling.jsonmodel_type) }>{ sibling.display_string }</Link>
                        }
                        {
                            isCurrent && context.children.length > 0 &&
                            <ul>
                                {
                                    context.children.map((child: any, idx: number) => {
                                        return <li key={ child.id }>
                                            {
                                                (child.children_count > 0) ? <i className={ iconForType('resource') } aria-hidden="true"></i> :
                                                <i className={ iconForType(child.jsonmodel_type) } aria-hidden="true"></i>
                                            }&nbsp;
                                            <Link to={ uriFor(child.qsa_id_prefixed, child.jsonmodel_type) }>{ child.display_string }</Link>
                                        </li>
                                    })
                                }
                                {
                                    childrenQuery &&
                                    <li>
                                        <Link className="qg-btn btn-link btn-xs"
                                              to={{
                                                  pathname: '/search',
                                                  search: childrenQuery.toQueryString()
                                            }}>Browse all {context.children_count} child records</Link>
                                    </li>
                                }
                            </ul>
                        }
                    </li>
                })
            }
            {
                context.siblings[context.siblings.length - 1].position && context.siblings[context.siblings.length - 1].position < context.siblings_count - 1 &&
                <li>&hellip;</li>
            }
            {
                siblingsQuery &&
                <li>
                    <Link className="qg-btn btn-link btn-xs"
                          to={{
                              pathname: '/search',
                              search: siblingsQuery.toQueryString()
                          }}>Browse all {context.siblings_count} sibling records</Link>
                </li>
            }
        </ul>
    )
}

export const RecordContext: React.FC<{qsa_id: string, recordType: string}> = ({ qsa_id, recordType }) => {
    const [context, setContext] = useState<Context | null>(null);

    if (!context) {
        Http.fetchContextByQSAID(qsa_id, recordType)
            .then((json: any) => {
                setContext(json)
            })
            .catch((exception) => {
                console.error(exception);
                window.location.href = '/404';
            });
    }

    if (!context) {
        return <></>;
    } else {
        const series: any = context.path_to_root.length > 0 ? context.path_to_root[0] : context.siblings[0];
        const seriesQuery = AdvancedSearchQuery.emptyQuery()
                                               .addFilter('resource_id', series.id, series.display_string);

        return (<div className="record-context">
                {
                    context.path_to_root.length === 0 ?
                        <RecordContextSiblings context={ context }/> :

                        context.path_to_root.reduce((nested_lists, next_ancestor) => (
                            <ul>
                                <li key={ next_ancestor.id }>
                                    <i className={ iconForType(next_ancestor.jsonmodel_type) } aria-hidden="true"></i>&nbsp;
                                    <Link to={ uriFor(next_ancestor.qsa_id_prefixed, next_ancestor.jsonmodel_type) }>{ next_ancestor.display_string }</Link>
                                    { nested_lists }
                                </li>
                            </ul>
                        ), <RecordContextSiblings context={ context } />)
                }
                {
                    <p>
                        <Link className="qg-btn btn-primary btn-xs"
                              to={{
                                  pathname: '/search',
                                  search: seriesQuery.toQueryString()
                              }}>Browse all items in series</Link>
                    </p>
                }
            </div>
        )
    }
}
