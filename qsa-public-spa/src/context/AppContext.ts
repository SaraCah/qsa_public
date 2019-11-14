import React from 'react';

const AppContext = React.createContext({});

export const ClientState: any = {
    nonce: '' + Math.random(),
}

ClientState.refreshNonce = () => {
    ClientState.nonce = '' + Math.random();
}

export default AppContext;
