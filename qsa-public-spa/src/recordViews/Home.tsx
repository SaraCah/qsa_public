import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Layout from './Layout';
import AspaceAdvancedSearch from '../advancedSearch/AdvancedSearch';
import { AdvancedSearchQuery } from '../models/AdvancedSearch';
import {PageSnippet} from './PageViewPage';

const HomePage: React.FC<RouteComponentProps<any>> = (route: RouteComponentProps<any>) => {
  return (
    <Layout>
      <h1>Archives Search</h1>
      <PageSnippet slug="welcome" />
      <div className="qg-call-out-box">
        <AspaceAdvancedSearch advancedSearchQuery={AdvancedSearchQuery.emptyQuery()} />
      </div>
    </Layout>
  );
};

export default HomePage;
