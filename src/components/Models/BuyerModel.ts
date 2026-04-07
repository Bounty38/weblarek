import { IBuyer, TPayment } from '../../types';

type ValidationErrors = Partial<Record<keyof IBuyer, string>>;

export class BuyerModel {
    private _payment: TPayment | null = null;
    private _email: string = '';
    private _phone: string = '';
    private _address: string = '';

    setData(data: Partial<IBuyer>): void {
        if (data.payment !== undefined) this._payment = data.payment;
        if (data.email !== undefined) this._email = data.email;
        if (data.phone !== undefined) this._phone = data.phone;
        if (data.address !== undefined) this._address = data.address;
    }

    getData(): Partial<IBuyer> {
        return {
            payment: this._payment ?? undefined,
            email: this._email,
            phone: this._phone,
            address: this._address,
        };
    }

    clear(): void {
        this._payment = null;
        this._email = '';
        this._phone = '';
        this._address = '';
    }

    validate(): ValidationErrors {
        const errors: ValidationErrors = {};

        if (!this._payment) {
            errors.payment = 'Не выбран способ оплаты';
        }

        if (!this._address) {
            errors.address = 'Укажите адрес';
        }

        if (!this._email) {
            errors.email = 'Укажите email';
        }

        if (!this._phone) {
            errors.phone = 'Укажите телефон';
        }

        return errors;
    }
}
