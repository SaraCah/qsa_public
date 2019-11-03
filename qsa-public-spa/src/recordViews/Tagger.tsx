import React, {useEffect, useState} from "react";
import {Http} from "../utils/http";
import { Link } from 'react-router-dom';
import {errorMessageForCode} from "../utils/typeResolver";
import { AdvancedSearchQuery } from '../models/AdvancedSearch';

export const Tagger: React.FC<any> = ({ recordId, context }) => {
  const [tags, setTags] = useState([]);
  const [tagToCreate, setTagToCreate] = useState('');
  const [createError, setCreateError]: [any, any] = useState(null);
  const [needsRefresh, setNeedsRefresh] = useState(0);

  useEffect(() => {
    Http.get().getTags(recordId).then((json: any) => {
      setTags(json);
    });
  }, [needsRefresh, recordId]);

  const addTag = () => {
    setCreateError(null);
    Http.get().addTag(tagToCreate, recordId).then((json: any) => {
      if (json.errors && json.errors.length > 0) {
        if (json.errors[0]['code'] === 'VALIDATION_FAILED') {
          setCreateError(json.errors[0]['validation_code'])
        } else {
          setCreateError(errorMessageForCode(json.errors[0]['code']))
        }
      } else {
        setTagToCreate('');
        setNeedsRefresh(needsRefresh + 1);
      }
    })
  };

  const flagTag = (tagId: string) => {
    Http.get().flagTag(tagId).then(() => {
      setNeedsRefresh(needsRefresh + 1);
    });
  };

  return (
    <section>
      <h3>Tags</h3>
      <form onSubmit={(e) => {e.preventDefault(); addTag()}} className="form-inline">
        {
          createError &&
          <div className="alert alert-danger">{createError}</div>
        }
        <input className="form-control form-control-sm" type="text" value={tagToCreate} onChange={(e) => setTagToCreate(e.target.value)} size={30} maxLength={60} />
        <button className="qg-btn btn-primary btn-sm" type="submit">Add Tag</button>
      </form>

      <div>
        {tags.map((tag: any) => (
          <span key={tag.id} className="record-tag">
            <div className="btn-group">
              <Link
                className="qg-btn tag-btn btn-info btn-xs"
                to={{
                  pathname: '/search',
                  search: AdvancedSearchQuery.emptyQuery().addStickyFilter('tags', tag.tag, tag.tag).toQueryString(),
                }}
              >
                <i aria-hidden="true" className="fa fa-tag" />&nbsp;{tag.tag}
              </Link>
              <button type="button" className="qg-btn btn-info btn-xs dropdown-toggle"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false">
                <span className="caret"/>
                <span className="sr-only">Toggle Dropdown</span>
              </button>
              <ul className="dropdown-menu">
                <li>
                  {
                    tag.flagged && <span className="text-danger" style={{padding: '0 10px'}}><i aria-hidden="true" className="fa fa-exclamation-circle" /> Flagged</span>
                  }
                  {
                    !tag.flagged && <button onClick={(e) => {e.preventDefault(); flagTag(tag.id)}} className="qg-btn btn-link text-danger" style={{textDecoration: 'none', whiteSpace: 'nowrap', padding: '0 10px'}}><i aria-hidden="true" className="fa fa-exclamation-circle" /> Flag with Moderator</button>
                  }
                </li>
              </ul>
            </div>
          </span>
        ))}
      </div>
    </section>
  )
}
