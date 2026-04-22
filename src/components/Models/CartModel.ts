import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

export class CartModel {
  private items: IProduct[] = [];
  private readonly event: IEvents;

  constructor(event: IEvents) {
    this.event = event;
  }

  private emitUpdate(): void {
    this.event.emit('cart.update', { items: this.getItems() });
  }

  addItem(product: IProduct): void {
    if (this.hasItem(product.id)) {
      return;
    }
    this.items.push(product);
    this.emitUpdate();
  }

  removeItem(productId: string): void {
    this.items = this.items.filter((i) => i.id !== productId);
    this.emitUpdate();
  }

  clear(): void {
    this.items = [];
    this.emitUpdate();
  }

  cleanCart(): void {
    this.clear();
  }

  getQuantity(): number {
    return this.items.length;
  }

  getItems(): IProduct[] {
    return [...this.items];
  }

  getTotalPrice(): number {
    return this.items.reduce((total, item) => total + (item.price ?? 0), 0);
  }

  hasItem(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }
}
