import React, { useEffect, useState} from "react";
import {Http} from "../utils/http";
import { Link } from 'react-router-dom';
import {errorMessageForCode} from "../utils/typeResolver";
import { AdvancedSearchQuery } from '../models/AdvancedSearch';

let previewTimer: any|undefined = undefined;

declare const window: any;
declare var AppConfig: any;

const ReCaptcha: React.FC<any> = ({ context }) => {
  const [script, setScript]: [any, any] = useState(undefined);
  const [elementId] = useState("grecaptcha_" + Math.floor((Math.random() * 100000000)));

  const recaptchaRequired =  context.captchaVerified !== null && !context.user && !context.captchaVerified;

  useEffect(() => {
    if (recaptchaRequired) {
      loadScript();
    }

    return () => {
      if (script) {
        document.body.removeChild(script);
      }
    }
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [recaptchaRequired]);

  const renderRecaptchaWidgets = () => {
    window.recaptchaRenderCallbacks.forEach((callback: any) => {
      callback();
    });

    window.recaptchaRenderCallbacks = [];
  };

  const loadScript = (): void => {
    if (window.grecaptcha !== undefined) {
      renderRecaptcha();
      return;
    }
    window.recaptchaRenderCallbacks = window.recaptchaRenderCallbacks || [];
    window.captchaOnLoad = renderRecaptchaWidgets;
    window.recaptchaRenderCallbacks.push(renderRecaptcha);

    const url = AppConfig.recaptcha_url;
    const queryString = AppConfig.recaptcha_params;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url + queryString;
    script.async = true;
    script.defer = true;

    setScript(document.body.appendChild(script));
  };

  const onVerified = (token: string) => {
    Http.get().verifyCaptcha(token).then(() => {
      context.setCaptchaVerified(true);
    }, () => {
      context.setCaptchaVerified(false);
    });
  };

  const renderRecaptcha = (): void => {
    window.grecaptcha.render(
      elementId,
      {
        'sitekey': AppConfig.recaptcha_site_key,
        'callback': onVerified,
      }
    );
  };

  if (!recaptchaRequired) {
    return <></>;
  }

  return (
      <>
        <div id={elementId} />
        <div>
          <small className="text-muted">Captcha required as not logged in</small>
        </div>
      </>
  );
};

export const Tagger: React.FC<any> = ({ recordId, context }) => {
  const [tags, setTags] = useState([]);
  const [tagToCreate, _setTagToCreate] = useState('');
  const [createError, setCreateError]: [any, any] = useState(null);
  const [needsRefresh, setNeedsRefresh] = useState(0);
  const [tagPreview, setTagPreview] = useState('');

  const recaptchaRequired = !context.user && !context.captchaVerified;

  useEffect(() => {
    Http.get().getTags(recordId).then((json: any) => {
      setTags(json);
    });
  }, [needsRefresh, recordId]);

  const setTagToCreate = (tag: string) => {
    if (!tag) {
      setTagPreview('');
    }

    clearTimeout(previewTimer);

    previewTimer = setTimeout(() => {
      Http.get().previewTag(tag).then((json: any) => {
        if (tagToCreate) {
          setTagPreview(json.tag_preview);
        }
      });
    }, 150);

    _setTagToCreate(tag);
  }

  const addTag = () => {
    if (recaptchaRequired) {
      return;
    }

    setCreateError(null);
    Http.get().addTag(tagToCreate, recordId).then((json: any) => {
      if (json.errors && json.errors.length > 0) {
        if (json.errors[0]['code'] === 'VALIDATION_FAILED') {
          setCreateError(json.errors[0]['validation_code'])
        } else {
          setCreateError([errorMessageForCode(json.errors[0]['code']), json.errors[0]['value'] || ''].join(' '))
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
      <form onSubmit={(e) => {e.preventDefault(); addTag()}}>
        {
          createError &&
          <div className="alert alert-danger">{createError}</div>
        }
        <ReCaptcha context={context} />
        <div className="form-inline">
          <input className="form-control form-control-sm" type="text" value={tagToCreate} onChange={(e) => setTagToCreate(e.target.value)} size={30} maxLength={60} />
          <button className="qg-btn btn-primary btn-sm" type="submit" disabled={recaptchaRequired}>Add Tag</button>
        </div>
      </form>
      {
        tagPreview &&
          <div className="text-muted mt-1">Preview: <span className="badge badge-info"><i aria-hidden="true" className="fa fa-tag" />&nbsp;{tagPreview}</span></div>
      }
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
              {
                !recaptchaRequired &&
                <>
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
                </>
              }
            </div>
          </span>
        ))}
      </div>
    </section>
  )
}
