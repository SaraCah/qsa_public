import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import queryString from 'query-string';

import Layout from './Layout';

const GenericErrorPage: React.FC<RouteComponentProps<any>> = (route: RouteComponentProps<any>) => {
  const props = queryString.parse(route.location.search)  

  console.error("GENERIC ERROR: " + props.msg);

  return <Layout noindex={true}>Sorry!  An error occurred while processing your request.</Layout>;
};

export default GenericErrorPage;
