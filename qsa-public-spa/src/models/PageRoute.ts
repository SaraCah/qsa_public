import { RouteComponentProps } from 'react-router-dom';
import { IAppContext } from '../context/AppContext';

export interface PageRoute extends RouteComponentProps<any> {
    context: IAppContext;
    setPageTitle: (title: string) => void;
}
