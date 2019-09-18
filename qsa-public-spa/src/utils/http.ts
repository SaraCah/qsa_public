import axios, {AxiosRequestConfig} from 'axios';
import {AspaceSearchParameters} from "../models/SearchParameters";

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

  static async fetchResults<T>(searchParameters: AspaceSearchParameters): Promise<T[]> {
    const query = JSON.stringify(searchParameters);
    const response = await axios
      .post(`${searchUrl}?query=${query}`, Http.config)
      .catch(error => {
        console.log(error, error.status);
        return error;
      });
    return !!response.data ? response.data.results : [];
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
