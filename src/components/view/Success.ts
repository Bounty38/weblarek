import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";

interface SuccessData {
    total: number;
}

export class Success extends Component<SuccessData> {
    protected successTotal: HTMLElement;
    protected closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, protected event: IEvents) {
        super(container);

        this.successTotal = ensureElement<HTMLElement>('.order-success__description', this.container);
        this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container);

        this.closeButton.addEventListener('click', () => {
            this.event.emit('success.close');
        });
    }

    set total(value: number) {
        this.successTotal.textContent = `Списано ${value} синапсов`;
    }
}