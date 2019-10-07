import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import { AdvancedSearchQuery } from '../models/AdvancedSearch';
import { UserForm } from '../models/User';

const searchUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/advanced_search`;
const fetchUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/fetch`;
const contextUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/fetch_context`;
const loginUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/authenticate`;
const logoutUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/logout`;
const loggedInUserUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/logged_in_user`;
const registerUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/users`;
const updateContactDetailsUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/users/update`;
const updatePasswordUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/users/update_password`;
const userUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/admin/user`;
const usersUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/admin/users`;

export class Http {
  static config: AxiosRequestConfig = {
    headers: {
      Accept: 'application/json'
    }
  };

  private static instance: Http | null;
  private sessionId?: string;

  constructor(sessionId?: string) {
    this.sessionId = sessionId;
  }

  static login(sessionId: string | null): void {
    if (sessionId) {
      Http.instance = new Http(sessionId);
    } else {
      Http.logout();
    }
  }

  static logout(): void {
    Http.instance = null;
  }

  getConfig(): any {
    const result = { ...Http.config };
    result.headers = Object.assign(
      {},
      result.headers,
      this.sessionId ? { 'x-archivessearch-session': this.sessionId } : {}
    );

    return result;
  }

  static get(): any {
    if (!Http.instance) {
      Http.instance = new Http();
    }

    return Http.instance;
  }

  async fetchResults<T>(advancedSearchQuery: AdvancedSearchQuery, page = 0): Promise<T[]> {
    const query = advancedSearchQuery.toJSON();
    const response = await axios.post(`${searchUrl}?query=${query}&page=${page}`, this.getConfig()).catch(error => {
      console.log(error, error.status);
      return error;
    });
    return response.data || [];
  }

  async fetchByQSAID(qsaId: string, recordType: string): Promise<any> {
    const response = await axios
      .get(`${fetchUrl}?qsa_id=${qsaId}&type=${recordType}`, this.getConfig())
      .catch(error => {
        console.log(error, error.status);
        return error;
      });

    return response.data;
  }

  async fetchContextByQSAID(qsaId: string, recordType: string): Promise<any> {
    const response = await axios
      .get(`${contextUrl}?qsa_id=${qsaId}&type=${recordType}`, this.getConfig())
      .catch(error => {
        console.log(error, error.status);
        return error;
      });

    return response.data;
  }

  async login(email: string, password: string): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.set('email', email);
    bodyFormData.set('password', password);

    const response = await axios
      .post(loginUrl, bodyFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .catch(error => {
        console.log(error, error.status);
        return error;
      });

    return response.data || [];
  }

  async logout(): Promise<any> {
    const response = await axios.post(logoutUrl, this.getConfig()).catch(error => {
      console.log(error, error.status);
      return error;
    });

    return response.data || [];
  }

  async getCurrentUser(): Promise<AxiosResponse> {
    return await axios.get(`${loggedInUserUrl}`, this.getConfig());
  }

  async register(user: UserForm): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.set('user', JSON.stringify(user));

    const response = await axios
      .post(registerUrl, bodyFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .catch(error => {
        console.log(error, error.status);
        return error;
      });

    return response.data || [];
  }

  async updateUser(user: UserForm): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.set('user', JSON.stringify(user));

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(updateContactDetailsUrl, bodyFormData, config).catch(error => {
      console.log(error, error.status);
      return error;
    });

    return response.data || [];
  }

  async updatePassword(data: any): Promise<any> {
    const bodyFormData = new FormData();
    bodyFormData.set('current_password', data.current_password);
    bodyFormData.set('password', data.password);
    bodyFormData.set('confirm_password', data.confirm_password);

    const config = this.getConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(updatePasswordUrl, bodyFormData, config).catch(error => {
      console.log(error, error.status);
      return error;
    });

    return response.data || [];
  }

  async getUsers(page: number, filter: any): Promise<any> {
    const params = Object.assign({}, { page: page }, filter, {
      version: undefined
    });

    const response = await axios.get(`${usersUrl}`, Object.assign({}, this.getConfig(), { params: params }));

    return response.data || [];
  }

  async getUser(userId: number): Promise<any> {
    const params = { user_id: userId };

    const response = await axios.get(`${userUrl}`, Object.assign({}, this.getConfig(), { params: params }));

    return response.data || [];
  }
}
