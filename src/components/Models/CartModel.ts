import { IProduct } from '../../types';

export class CartModel {
    private _items: IProduct[] = [];

    getItems(): IProduct[] {
        return [...this._items];
    }

    addItem(product: IProduct): void {
        if (product.price === null) {
            return;
        }

        if (!this.contains(product.id)) {
            this._items.push(product);
        }
    }

    removeItem(product: IProduct): void {
        this._items = this._items.filter((item) => item.id !== product.id);
    }

    clear(): void {
        this._items = [];
    }

    getTotal(): number {
        return this._items.reduce((sum, item) => sum + (item.price ?? 0), 0);
    }

    getCount(): number {
        return this._items.length;
    }

    contains(id: string): boolean {
        return this._items.some((item) => item.id === id);
    }
}
