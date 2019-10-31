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

  return (
    <section>
      <h3>Tags</h3>
      <div className="form-inline">
        {
          createError &&
          <div className="alert alert-danger">{createError}</div>
        }
        <input className="form-control form-control-sm" type="text" value={tagToCreate} onChange={(e) => setTagToCreate(e.target.value)} size={30} maxLength={60} />
        <button className="qg-btn btn-primary btn-sm" onClick={(e) => addTag()}>Add Tag</button>
      </div>

      <div>
        {tags.map((tag: any) => (
          <span key={tag.id} style={{fontSize: '1.4em'}}>
            <span className="badge badge-info">
              <i aria-hidden="true" className="fa fa-tag" />&nbsp;
              {tag.tag}
            </span>
            &nbsp;
          </span>
        ))}
      </div>
    </section>
  )
}