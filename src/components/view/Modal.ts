import { ensureElement } from '../../utils/utils';
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";

interface ModalData {
    content: HTMLElement;
}

export class Modal extends Component<ModalData> {
    protected closeButton: HTMLButtonElement;
    protected modalContent: HTMLElement;

    constructor(protected event: IEvents, container: HTMLElement) {
        super(container);

        this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);
        this.modalContent = ensureElement<HTMLElement>('.modal__content', this.container);

        this.closeButton.addEventListener('click', () => {
            this.close();
        })

        this.container.addEventListener('click', (event) => {
            if (event.target === event.currentTarget) {
                this.close();
            }
        });
    }

    set content(value: HTMLElement) {
        this.modalContent.replaceChildren(value);
    }

    open() {
        this.container.classList.add('modal_active')
    }

    close() {
        this.container.classList.remove('modal_active')
    }
}