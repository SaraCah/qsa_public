import React from 'react'

const AppContext = React.createContext({
  cart: null,
  user: null,
  setUser: (user: any) => {},
  setSessionId: (sessionId: string) => {},
});

export default AppContext;
