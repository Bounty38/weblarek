import { ensureElement } from '../../utils/utils';

export class Modal {
    protected content: HTMLElement;
    protected closeButton: HTMLButtonElement;

    constructor(protected container: HTMLElement) {
        this.content = ensureElement<HTMLElement>('.modal__content', this.container);
        this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);

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
    }

    close(): void {
        this.container.classList.remove('modal_active');
        this.content.replaceChildren();
    }

    setContent(content: HTMLElement): void {
        this.content.replaceChildren(content);
    }
}
