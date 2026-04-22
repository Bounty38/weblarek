import { TPayment } from "../../types";
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";

interface FormData {
    valid: boolean;
    errors: string[];
}

interface OrderFormData extends FormData {
    payment: TPayment;
    address: string;
}

interface ContactFormData extends FormData {
    email: string;
    phone: string;
}

export class Form<T extends FormData> extends Component<T> {
    protected formSubmit: HTMLButtonElement;
    protected formErrors: HTMLElement;

    constructor(container: HTMLElement, protected event: IEvents) {
        super(container);

        this.formSubmit = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
        this.formErrors = ensureElement<HTMLElement>('.form__errors', this.container);

        this.container.addEventListener('submit', (evt) => {
            evt.preventDefault();
            this.event.emit(`${(this.container as HTMLFormElement).name}.submit`);
        });
    }

    set valid(value: boolean) {
        this.formSubmit.disabled = !value;
    }

    set errors(value: string[]) {
        this.formErrors.textContent = value.join(', ');
    }
}

export class OrderForm<FormData extends OrderFormData> extends Form<FormData> {
    protected cardButton: HTMLButtonElement;
    protected cashButton: HTMLButtonElement;
    protected formAdress: HTMLInputElement;

    constructor(container: HTMLElement, event: IEvents) {
        super(container, event);

        this.cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
        this.cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
        this.formAdress = ensureElement<HTMLInputElement>('input[name="address"]', this.container);

        this.cardButton.addEventListener('click', () => {
            this.event.emit('order.change', { payment: 'card' });
        });

        this.cashButton.addEventListener('click', () => {
            this.event.emit('order.change', { payment: 'cash' });
        });

        this.formAdress.addEventListener('input', () => {
            this.event.emit('order.change', { address: this.formAdress.value });
        });
    }

    set payment(value: TPayment) {
        this.cardButton.classList.toggle('button_alt-active', value === 'card');
        this.cashButton.classList.toggle('button_alt-active', value === 'cash');
    }

    set address(value: string) {
        this.formAdress.value = value;
    }
}

export class ContactForm<FormData extends ContactFormData> extends Form<FormData> {
    protected formEmail: HTMLInputElement;
    protected formPhone: HTMLInputElement;

    constructor(container: HTMLElement, event: IEvents) {
        super(container, event);

        this.formEmail = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        this.formPhone = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);

        this.formEmail.addEventListener('input', () => {
            this.event.emit('contacts.change', { email: this.formEmail.value });
        });

        this.formPhone.addEventListener('input', () => {
            this.event.emit('contacts.change', { phone: this.formPhone.value });
        });
    }

    set email(value: string) {
        this.formEmail.value = value;
    }

    set phone(value: string) {
        this.formPhone.value = value;
    }
}