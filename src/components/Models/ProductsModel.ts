import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

export class ProductsModel {
  private products: IProduct[] = [];
  private selectedProduct: IProduct | null = null;
  private readonly event: IEvents;

  constructor(event: IEvents) {
    this.event = event;
  }

  getProducts(): IProduct[] {
    return [...this.products];
  }

  setProducts(products: IProduct[]): void {
    this.products = [...products];
    this.event.emit('products.update', { items: this.getProducts() });
  }

  setSelectedProduct(product: IProduct | null): void {
    this.selectedProduct = product;
    this.event.emit('product.current', this.selectedProduct);
  }

  selectProduct(product: IProduct): void {
    this.setSelectedProduct(product);
  }

  getSelectedProduct(): IProduct | null {
    return this.selectedProduct;
  }

  getProductById(productId: string): IProduct | null {
    return this.products.find((p) => p.id === productId) ?? null;
  }
}
