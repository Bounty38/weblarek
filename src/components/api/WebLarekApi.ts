import { IApi, IOrder, IOrderResult, IProduct, IProductsResponse } from '../../types';

export class WebLarekApi {
    constructor(private readonly api: IApi) {}

    getProducts(): Promise<IProduct[]> {
        return this.api.get<IProductsResponse>('/product').then((data) => data.items);
    }

    postOrder(order: IOrder): Promise<IOrderResult> {
        return this.api.post<IOrderResult>('/order', order);
    }
}
