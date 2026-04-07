import { IApi, IOrder, IOrderResult, IProductsResponse } from '../../types';

export class WebLarekApi {
    constructor(private readonly api: IApi) {}

    getProducts(): Promise<IProductsResponse> {
        return this.api.get<IProductsResponse>('/product/');
    }

    postOrder(order: IOrder): Promise<IOrderResult> {
        return this.api.post<IOrderResult>('/order/', order);
    }
}
