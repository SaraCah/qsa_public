import React, {useState, useEffect} from 'react';
import Quill from 'quill';

const RichText: React.FC<any> = (props: any) => {
  const [eltId, _] = useState('richtext_' + Math.floor(Math.random() * 1000000));
  const [quill, setQuill] = useState();
  const [htmlPreview, setHTMLPreview] = useState('');


  useEffect(() => {
    const quillInstance = new Quill('#' + eltId,
                                    {
                                      theme: 'snow',
                                      modules : {
                                        toolbar: {
                                          container: [
                                            [{ 'header': [1, 2, false] }],
                                            ['bold', 'italic', 'underline','strike', 'blockquote'],
                                            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                                            ['link'],
                                            ['clean'],
                                            ['invented'],
                                          ],
                                          handlers: {
                                            invented: () => {
                                              quillInstance.clipboard.dangerouslyPasteHTML(0, '<p><img width="800px" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Common_Snapping_Turtle.jpg/2560px-Common_Snapping_Turtle.jpg"></p>', 'api');
                                            },
                                          },
                                        }
                                      }
                                    });

    quillInstance.on('text-change', function () {
      setHTMLPreview(quillInstance.root.innerHTML || '');
    });

    setQuill(quillInstance);
  }, []);

  useEffect(() => {
    document.querySelectorAll('.ql-invented').forEach((elt) => {
      const htmlElt = elt as HTMLElement;

      if (htmlElt.innerText == '') {
        htmlElt.innerText = 'Turtle';
      }
    });
  }, [quill])

  return <div>
    <div id={eltId}></div>
    <div><pre>{htmlPreview}</pre></div>
  </div>;
}

export default RichText;
