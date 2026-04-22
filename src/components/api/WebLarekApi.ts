import { IApi, IOrder, IOrderResult, IProductsResponse } from '../../types';

export class WebLarekApi {
    private api: IApi;

    constructor(api: IApi) {
      this.api = api;
    }

    getProducts(): Promise<IProductsResponse> {
        return this.api.get<IProductsResponse>('/product/');
    }

    postOrder(order: IOrder): Promise<IOrderResult> {
        return this.api.post<IOrderResult>('/order/', order);
    }
}
