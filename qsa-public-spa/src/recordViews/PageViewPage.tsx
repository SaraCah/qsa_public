import React, {useState, useEffect} from 'react';
import { Http } from '../utils/http';
import { Redirect } from 'react-router';
import Layout from './Layout';

export const PageSnippet: React.FC<any> = (props: any) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (props.slug) {
      Http.get().getPageContent(props.slug)
          .then((content: string) => {
            setContent(content);
            if (props.successCallback) {
              props.successCallback();
            }
          })
          .catch((error: any) => {
            if (props.notFoundCallback) {
              props.notFoundCallback();
            }
          });
    }
  }, [props]);

  useEffect(() => {
    const maxIterations = 1000;

    for (let i = 0; i < maxIterations; i++) {
      const codeBlock = document.querySelector('.qsa-snippet-text p > code');

      if (!codeBlock) {
        break;
      }

      let combinedHTML = (codeBlock as HTMLElement).innerText;

      // If there are other adjacent <p><code> blocks following this one, combined them into one chunk.
      let adjacentBlock = codeBlock.parentNode && codeBlock.parentNode.nextSibling as HTMLElement;

      while (adjacentBlock &&
        adjacentBlock.childElementCount === 1 &&
        adjacentBlock.firstChild &&
        (adjacentBlock.firstChild as HTMLElement).tagName === 'CODE') {
        const nextAdjacentBlock = adjacentBlock.nextSibling;

        combinedHTML += (adjacentBlock.firstChild as HTMLElement).innerText;

        if (adjacentBlock.parentNode) {
          adjacentBlock.parentNode.removeChild(adjacentBlock);
        }

        adjacentBlock = nextAdjacentBlock as HTMLElement;
      }

      // Once we reach the end of our run, insert our code.
      if (codeBlock.parentNode) {
        (codeBlock.parentNode as HTMLElement).outerHTML = combinedHTML;
      }
    }
  });

  return <div className="qsa-snippet-text" dangerouslySetInnerHTML={{__html: (props.content || content)}} />
}

const PageViewPage: React.FC<any> = (route: any) => {
  const [notFound, setNotFound] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const firstChild = document.querySelector('.page-content h1');

    if (firstChild) {
      route.setPageTitle((firstChild as HTMLElement).innerText || '');
    }
  }, [loaded, route]);

  if (notFound) {
    return <Redirect to="/404" push={true} />;
  }

  return (
    <Layout>
      <div className="page-content">
        <PageSnippet
          slug={route.match.params.slug}
          successCallback={() => setLoaded(true)}
          notFoundCallback={() => setNotFound(true)}
        />
      </div>
    </Layout>
  );
};

export default PageViewPage;
