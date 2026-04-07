import { IEvents } from '../base/Events';

export class Modal {
    protected content: HTMLElement;
    protected closeButton: HTMLButtonElement;

    constructor(
        protected container: HTMLElement,
        protected events: IEvents,
    ) {
        const content = this.container.querySelector<HTMLElement>('.modal__content');
        const closeButton = this.container.querySelector<HTMLButtonElement>('.modal__close');

        if (!content || !closeButton) {
            throw new Error('Modal markup is invalid: required elements are missing');
        }

        this.content = content;
        this.closeButton = closeButton;

        this.content.addEventListener('click', (evt) => {
            evt.stopPropagation();
        });

        this.closeButton.addEventListener('click', () => {
            this.close();
        });

        this.container.addEventListener('click', (evt) => {
            if (evt.target === this.container) {
                this.close();
            }
        });
    }

    open(content: HTMLElement): void {
        this.setContent(content);
        this.container.classList.add('modal_active');
        this.events.emit('modal:open');
    }

    close(): void {
        this.container.classList.remove('modal_active');
        this.clearContent();
        this.events.emit('modal:close');
    }

    setContent(content: HTMLElement): void {
        this.content.replaceChildren(content);
    }

    clearContent(): void {
        this.content.innerHTML = '';
    }
}
