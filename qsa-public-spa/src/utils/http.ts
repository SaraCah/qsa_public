import axios, {AxiosRequestConfig} from 'axios';
import {AdvancedSearchQuery} from "../models/AdvancedSearch";

const searchUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/advanced_search`;
const fetchUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/fetch`;
const contextUrl = `${process.env.REACT_APP_QSA_PUBLIC_URL}/api/fetch_context`;


interface ResultClass {
  forJSON(json: any): any;
}

export class Http {
    static config: AxiosRequestConfig = {
        headers: {
            'Accept': 'application/json'
        }
    };

    static async fetchResults<T>(advancedSearchQuery: AdvancedSearchQuery, page: number = 0): Promise<T[]> {
        const query = advancedSearchQuery.toJSON();
        const response = await axios
            .post(`${searchUrl}?query=${query}&page=${page}`, Http.config)
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

    static async fetchByQSAID(qsa_id: string, record_type: string): Promise<any> {
        const response = await axios
            .get(`${fetchUrl}?qsa_id=${qsa_id}&type=${record_type}`, Http.config)
            .catch(error => {
                console.log(error, error.status);
                return error;
            });

        return response.data;
    }

    static async fetchContextByQSAID(qsa_id: string, record_type: string): Promise<any> {
        const response = await axios
            .get(`${contextUrl}?qsa_id=${qsa_id}&type=${record_type}`, Http.config)
            .catch(error => {
                console.log(error, error.status);
                return error;
            });

        return response.data;
    }
}
