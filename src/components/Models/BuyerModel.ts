import { IBuyer, ValidationErrors } from '../../types';
import { IEvents } from '../base/Events';

export class BuyerModel {
  private data: IBuyer = {
    payment: '',
    address: '',
    email: '',
    phone: '',
  };
  protected readonly event: IEvents;

  constructor(event: IEvents) {
    this.event = event;
  }

  setData(data: Partial<IBuyer>): void {
    this.data = { ...this.data, ...data };
    this.event.emit('buyer.changed', { ...this.data });
  }

  getData(): IBuyer {
    return { ...this.data };
  }

  clear(): void {
    this.data = {
      payment: '',
      address: '',
      email: '',
      phone: '',
    };
    this.event.emit('buyer.changed', { ...this.data });
  }

  validate(): ValidationErrors {
    const fields = {
      payment: this.data.payment.trim() !== '',
      address: this.data.address.trim() !== '',
      email: this.data.email.trim() !== '',
      phone: this.data.phone.trim() !== '',
    };

    const errors: ValidationErrors = {};

    if (!fields.payment) errors.payment = 'Выберите способ оплаты';
    if (!fields.address) errors.address = 'Введите адрес';
    if (!fields.email) errors.email = 'Введите email';
    if (!fields.phone) errors.phone = 'Введите телефон';

    return errors;
  }
}
