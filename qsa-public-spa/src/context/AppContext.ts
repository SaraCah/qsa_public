import React from 'react';

const AppContext = React.createContext({});

export const ClientState = {
    lastSnippetRefresh: '' + Math.random(),
}

export default AppContext;
