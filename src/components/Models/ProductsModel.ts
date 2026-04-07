import { IProduct } from '../../types';

export class ProductsModel {
    private _products: IProduct[] = [];
    private _selectedProduct: IProduct | null = null;

    setProducts(products: IProduct[]): void {
        this._products = [...products];
    }

    getProducts(): IProduct[] {
        return [...this._products];
    }

    getProductById(id: string): IProduct | undefined {
        return this._products.find((product) => product.id === id);
    }

    setSelectedProduct(product: IProduct | null): void {
        this._selectedProduct = product;
    }

    getSelectedProduct(): IProduct | null {
        return this._selectedProduct;
    }
}
