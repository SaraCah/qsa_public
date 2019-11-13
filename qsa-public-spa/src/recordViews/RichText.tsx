import React, {useState, useEffect} from 'react';
import Quill from 'quill';

export const RichText: React.FC<any> = (props: any) => {
  const [eltId] = useState('richtext_' + Math.floor(Math.random() * 1000000));

  let onChange = props.onChange;
  if (!onChange) {
    onChange = () => {};
  }

  useEffect(() => {
    const quillInstance = new Quill('#' + eltId,
                                    {
                                      theme: 'snow',
                                      modules : {
                                        toolbar: {
                                          container: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline','strike', 'blockquote'],
                                            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                                            ['link'],
                                            ['clean'],
                                          ],
                                        }
                                      }
                                    });

    quillInstance.clipboard.dangerouslyPasteHTML(0, props.value, 'api');

    quillInstance.on('text-change', function () {
      onChange(quillInstance.root.innerHTML || '');
    });
  }, [eltId, onChange, props.value]);

  return <div>
    <div id={eltId}></div>
  </div>;
}
