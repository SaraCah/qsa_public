import React, {useEffect, useState} from "react";
import {Http} from "../utils/http";
import {errorMessageForCode} from "../utils/typeResolver";

export const Tagger: React.FC<any> = ({ recordId, context }) => {
  const [tags, setTags] = useState([]);
  const [tagToCreate, setTagToCreate] = useState('');
  const [createError, setCreateError]: [any, any] = useState(null);
  const [needsRefresh, setNeedsRefresh] = useState(0);

  useEffect(() => {
    Http.get().getTags(recordId).then((json: any) => {
      setTags(json);
    });
  }, [needsRefresh]);

  const addTag = () => {
    setCreateError(null);
    Http.get().addTag(tagToCreate, recordId).then((json: any) => {
      if (json.errors && json.errors.length > 0) {
        if (json.errors[0]['code'] == 'VALIDATION_FAILED') {
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

  const reportTag = (tagId: string) => {
    Http.get().reportTag(tagId).then(() => {
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
              <button type="button" className="qg-btn btn-info btn-xs" onClick={(e) => alert('TODO show all items that have this tag')}>
                <i aria-hidden="true" className="fa fa-tag" />&nbsp;{tag.tag}
              </button>
              <button type="button" className="qg-btn btn-info btn-xs dropdown-toggle"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false">
                <span className="caret"></span>
                <span className="sr-only">Toggle Dropdown</span>
              </button>
              <ul className="dropdown-menu">
                <li>
                  {
                    tag.flagged && <span className="text-danger" style={{padding: '0 10px'}}><i aria-hidden="true" className="fa fa-exclamation-circle" /> Reported</span>
                  }
                  {
                    !tag.flagged && <a href="#" onClick={(e) => {e.preventDefault(); reportTag(tag.id)}} className="text-danger" style={{textDecoration: 'none', whiteSpace: 'nowrap', padding: '0 10px'}}><i aria-hidden="true" className="fa fa-exclamation-circle" /> Report to Moderator</a>
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
