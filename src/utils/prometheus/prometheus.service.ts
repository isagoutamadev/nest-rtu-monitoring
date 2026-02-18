
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Axios } from 'axios';
type BaseMetric = {
    __name__: string,
}
type PrometheusQueryResult<T> = {
    metric: BaseMetric & T,
    value: [
        number,
        string
    ]
}[];

type PrometheusQueryResponse<T> = {
    status: 'success',
    data: {
        result: PrometheusQueryResult<T>
    }
};

@Injectable()
export class PrometheusService {
    private readonly axios: Axios;
    constructor(
        private readonly httpService: HttpService,
    ) {
        const BASE_URL = 'http://192.168.10.12:8000/api/v1';
        this.axios = this.httpService.axiosRef;
        this.axios.defaults.baseURL = BASE_URL;
    }

    async query<T>(query: string): Promise<PrometheusQueryResult<T>> {
        try {
            const {data} = await this.axios.get<PrometheusQueryResponse<T>>('query', {
                params: {query}
            });
            return data.data.result;
        } catch (error) {
            // console.error(error);
            throw error;
        }
    }
}
