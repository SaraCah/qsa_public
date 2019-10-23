import React, { useState, useEffect } from 'react';
import { Http } from '../utils/http';
import AppContext from './AppContext';

class SessionCookie {
  static loadSessionFromCookie(cookieName: string): string | null {
    for (const cookie of document.cookie.split(';')) {
      if (cookie.trim().startsWith(`${cookieName}=`)) {
        return cookie.trim().split('=')[1];
      }
    }

    return null;
  }

  static clearSessionCookie(cookieName: string): void {
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  static setCookie(name: string, value: string): void {
    const isSecure = window.location.protocol === 'https:' ? ';secure' : '';
    document.cookie = `${name}=${value};samesite=strict${isSecure};path=/`;
  }
}

const SESSION_COOKIE_NAME = 'archives_search_session';
const MASTER_SESSION_COOKIE_NAME = 'archives_search_master_session';

const AppContextProvider: React.FC<any> = (props: any) => {
  const [appContext, setAppContext]: [any, any] = useState({});

  /* Configure our initial state */
  useEffect(() => {
    const existingSession = SessionCookie.loadSessionFromCookie(SESSION_COOKIE_NAME);
    const masterSession = SessionCookie.loadSessionFromCookie(MASTER_SESSION_COOKIE_NAME);

    setAppContext(
      Object.assign(
        {},
        {
          initialised: true,
          sessionLoaded: !existingSession,
          cart: null,
          user: null,
          sessionId: existingSession,
          masterSessionId: masterSession,

          /* Update the currently logged in user */
          setUser: (user: any) => {
            setAppContext((oldState: any) => Object.assign({}, oldState, { user: user }));
          },


          setMasterSessionId: (sessionId: string) => {
            SessionCookie.setCookie(MASTER_SESSION_COOKIE_NAME, sessionId);
            setAppContext((oldState: any) => Object.assign({}, oldState, { masterSessionId: sessionId }));
          },

          /* Record the current user session token */
          setSessionId: (sessionId: string) => {
            SessionCookie.setCookie(SESSION_COOKIE_NAME, sessionId);

            Http.login(sessionId);

            setAppContext((oldState: any) => {
              return Object.assign({}, oldState, { sessionId: sessionId });
            });
          },

          /* Mark the session loading process as complete or not */
          setSessionLoaded: (value: boolean) => {
            setAppContext((oldState: any) => {
              return Object.assign({}, oldState, { sessionLoaded: value });
            });
          },

          refreshCart: (): Promise<any> => {
            return new Promise((resolve, reject) => {
              Http.get()
                  .getCart()
                  .then(
                    (data: any) => {
                      setAppContext((oldState: any) => Object.assign({}, oldState, { cart: data }));
                      resolve();
                    },
                    () => {
                      reject();
                    }
                  )
              });
          },

          /* Log out the current user */
          clearSession: (showLogout?: boolean) => {
            Http.logout();
            SessionCookie.clearSessionCookie(SESSION_COOKIE_NAME);
            SessionCookie.clearSessionCookie(MASTER_SESSION_COOKIE_NAME);

            setAppContext((oldState: any) => {
              return Object.assign({}, oldState, {
                sessionId: null,
                sessionLoaded: true,
                user: null,
                cart: null,
                masterSessionId: null,
              });
            });
          }
        }
      )
    );
  }, []);

  /* If a child component sets a new session ID, fetch the current user */

  useEffect(() => {
    if (!appContext.initialised) {
      /* Wait for our initial state to turn up. */
      return;
    }

    if (appContext.sessionId) {
      Http.login(appContext.sessionId);

      Http.get()
        .getCurrentUser()
        .then(
          (response: any) => {
            appContext.setUser(response.data);
            appContext.setSessionLoaded(true);
            appContext.refreshCart();
          },
          () => {
            appContext.clearSession();
          }
        );
    } else {
      appContext.clearSession();
    }
  },
  // Adding appContext to the deps array here (as suggested by jslint) creates a loop.
  //
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  [appContext.initialised, appContext.sessionId]);

  if (appContext.initialised) {
    return <AppContext.Provider value={appContext}>{props.children}</AppContext.Provider>;
  } else {
    return <></>;
  }
};

export default AppContextProvider;
