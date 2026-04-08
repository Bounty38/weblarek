import { IBuyer, TPayment, ValidationErrors } from '../../types';

export class BuyerModel {
    private payment: TPayment | null = null;
    private email: string = '';
    private phone: string = '';
    private address: string = '';

    setData(data: Partial<IBuyer>): void {
        if (data.payment !== undefined) this.payment = data.payment;
        if (data.email !== undefined) this.email = data.email;
        if (data.phone !== undefined) this.phone = data.phone;
        if (data.address !== undefined) this.address = data.address;
    }

    getData(): Partial<IBuyer> {
        return {
            payment: this.payment ?? undefined,
            email: this.email,
            phone: this.phone,
            address: this.address,
        };
    }

    clear(): void {
        this.payment = null;
        this.email = '';
        this.phone = '';
        this.address = '';
    }

    validate(): ValidationErrors {
        const errors: ValidationErrors = {};

        if (!this.payment) {
            errors.payment = 'Выберите способ оплаты';
        }

        if (!this.address.trim()) {
            errors.address = 'Введите адрес';
        }

        if (!this.email.trim()) {
            errors.email = 'Введите email';
        }

        if (!this.phone.trim()) {
            errors.phone = 'Введите телефон';
        }

        return errors;
    }
}
