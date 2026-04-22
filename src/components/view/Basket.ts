import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";

interface BasketData {
    total: number;
    buttonDisabled: boolean;
    items: HTMLElement[];
}

export class Basket extends Component<BasketData> {
    protected cardList: HTMLElement;
    protected cardTotal: HTMLElement;
    protected cardButton: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.cardList = ensureElement<HTMLElement>('.basket__list', this.container);
        this.cardTotal = ensureElement<HTMLElement>('.basket__price', this.container);
        this.cardButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        this.cardButton.addEventListener('click', () => {
            this.events.emit('basket.buy');
        });
    }

    set list(value: HTMLElement[]) {
        this.cardList.replaceChildren(...value);
    }

    set total(value: number) {
        this.cardTotal.textContent = `${value} синапсов`;
    }

    set buttonDisabled(value: boolean) {
        this.cardButton.disabled = value;
    }
}