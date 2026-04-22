import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";

interface HeaderData {
    counter: number;
}

export class Header extends Component<HeaderData> {
    protected headerCounter: HTMLElement;
    protected basketButton: HTMLButtonElement;

    constructor(protected event: IEvents, container: HTMLElement) {
        super(container);
        this.headerCounter = ensureElement<HTMLElement>('.header__basket-counter', this.container);
        this.basketButton = ensureElement<HTMLButtonElement>('.header__basket', this.container);

        this.basketButton.addEventListener('click', () => {
            this.event.emit('basket.open');
        })
    }

    set counter(value: number) {
        this.headerCounter.textContent = String(value);
    }
}