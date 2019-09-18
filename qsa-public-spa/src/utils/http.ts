import axios, {AxiosRequestConfig} from 'axios';
import {AdvancedSearchQuery} from "../models/AdvancedSearch";

const searchUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/advanced_search`;
const fetchUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/fetch`;


interface ResultClass {
  forJSON(json: any): any;
}

export class Http {
  static config: AxiosRequestConfig = {
    headers: {
      'Accept': 'application/json'
    }
  };

  static async fetchResults<T>(advancedSearchQuery: AdvancedSearchQuery): Promise<T[]> {
    const query = advancedSearchQuery.toJSON();
    const response = await axios
      .post(`${searchUrl}?query=${query}`, Http.config)
      .catch(error => {
        console.log(error, error.status);
        return error;
      });
    return response.data || [];
  }

  static async fetchFromUri<T>(uri: string): Promise<T> {
    const response = await axios
      .get(`${fetchUrl}?uri=${uri}`, Http.config)
      .catch(error => {
        console.log(error, error.status);
        return error;
      });
    return response.data;
  }

  static async fetchByQSAID<T>(qsa_id: string, record_type: ResultClass): Promise<T> {
    const response = await axios
      .get(`${fetchUrl}?qsa_id=${qsa_id}`, Http.config)
      .catch(error => {
        console.log(error, error.status);
        return error;
      });
    return record_type.forJSON(response.data) as T;
  }

}
