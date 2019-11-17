import React, {useState, useEffect} from 'react';
import Quill from 'quill';
import {PageSnippet} from './PageViewPage';

export const RichText: React.FC<any> = (props: any) => {
  const [eltId] = useState('richtext_' + Math.floor(Math.random() * 1000000));
  const [html, setHTML] = useState(props.value);
  const [quill, setQuill]: [any, any] = useState(undefined);

  const [editMode, _setEditMode] = useState(true);

  const setEditMode = (value: boolean) => {
    _setEditMode(value);

    if (!quill) {
      return;
    }

    if (value) {
      quill.root.parentNode.previousSibling.style.display = 'block';
    } else {
      quill.root.parentNode.previousSibling.style.display = 'none';
    }
  };

  let onChange = props.onChange;
  if (!onChange) {
    onChange = () => {};
  }

  useEffect(() => {
    const quillInstance = new Quill('#' + eltId,
                                    {
                                      theme: 'snow',
                                      modules : {
                                        clipboard: {
                                          matchVisual: false
                                        },
                                        toolbar: {
                                          container: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline','strike', 'blockquote'],
                                            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                                            ['link'],
                                            ['clean'],
                                            ['code'],
                                          ],
                                        }
                                      }
                                    });

    quillInstance.clipboard.dangerouslyPasteHTML(0, props.value, 'api');

    quillInstance.on('text-change', function () {
      const html = quillInstance.root.innerHTML || '';
      setHTML(html);
      onChange(html);
    });

    setQuill(quillInstance);
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  []);

  return <div>
    <button className="btn-xs" onClick={(e: React.MouseEvent) => { e.preventDefault(); setEditMode(!editMode) }}>Toggle Preview</button>
    <div style={{display: editMode ? 'block' : 'none'}} id={eltId}></div>
    <div style={{display: editMode ? 'none' : 'block', border: "solid 1px #ccc", padding: '1em'}}>
      <PageSnippet content={html} />
    </div>
  </div>;
}

