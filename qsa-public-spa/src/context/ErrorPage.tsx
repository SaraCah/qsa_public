import React from 'react';
import Layout from '../recordViews/Layout';

declare var window: any;

export default class ErrorPage extends React.Component {
  public state: any;

  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      error: undefined,
    };

    (window as any).handleFatalError = (errorMessage: any, error?: any) => {
      if (error) {
        console.error(error);
      }

      this.setState(() => {
        return {
          hasError: true,
          errorMessage: errorMessage,
          error: error,
        }
      });
    };
  }


  static getDerivedStateFromError(error: any) {
    /* Skip handling errors automatically */
    return {
      hasError: true,
      errorMessage: error.message,
      error: error,
    };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <Layout noindex={true}>
        <h1>System error</h1>

        <p>Your request could not be completed at this time.  The error reported was:</p>

        <blockquote>
          {this.state.errorMessage}
        </blockquote>

        <p>If this problem persists, please <a href="https://www.qld.gov.au/recreation/arts/heritage/archives/contacts">contact Queensland State Archives</a></p>
      </Layout>
    }

    return this.props.children;
  }
}
