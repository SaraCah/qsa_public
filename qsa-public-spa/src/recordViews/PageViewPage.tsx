import React, {useState, useEffect} from 'react';
import { Http } from '../utils/http';
import { Redirect } from 'react-router';
import Layout from './Layout';

export const PageSnippet: React.FC<any> = (props: any) => {
  const [content, setContent] = useState('');

  useEffect(() => {
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
  }, [props]);

  return <div dangerouslySetInnerHTML={{__html: content}} />
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
