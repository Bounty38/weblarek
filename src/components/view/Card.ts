import { categoryMap, CDN_URL } from "../../utils/constants";
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";

interface CardData{
    id: string;
    title: string;
    price: number | null;
}

interface CardGalleryData extends CardData{
    category: string;
    image: string;
}

interface CardDetailsData extends CardGalleryData{
    description: string;
    isInCart: boolean;
    buttonDisabled: boolean;
    buttonText: string;
}

interface CardBasketData extends CardData{
    index: number;
}

interface cardActionsInterface {
    onClick: (event: MouseEvent) => void;
}

export class Card<T extends CardData> extends Component<T> {
    protected cardTitle: HTMLElement;
    protected cardPrice: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);

        this.cardTitle = ensureElement<HTMLElement>('.card__title', this.container)
        this.cardPrice = ensureElement<HTMLElement>('.card__price', this.container)
    }

    set title(value: string) {
        this.cardTitle.textContent = value;
    }

    set id(value: string) {
        this.container.dataset.productId = value;
    }

    set price(value: number | null) {
        this.cardPrice.textContent = value !== null ? `${value} синапсов` : 'Бесценно';
    }
}

export class CardGallery<CardData extends CardGalleryData> extends Card<CardData> {
    protected cardImage: HTMLImageElement;
    protected cardCategory: HTMLElement;
    protected actions?: cardActionsInterface;

    constructor(container: HTMLElement, actions?: cardActionsInterface) {
        super(container);

        this.cardImage = ensureElement<HTMLImageElement>('.card__image', this.container)
        this.cardCategory = ensureElement<HTMLElement>('.card__category', this.container)
        this.actions = actions;

        this.container.addEventListener('click', (event) => {
            this.actions?.onClick?.(event)
        })
    }

    set image(value: string) {
        this.setImage(this.cardImage, `${CDN_URL}${value}`);
    }

    set category(value: string) {
        this.cardCategory.textContent = value;
        this.cardCategory.classList.remove(...Object.values(categoryMap));
        const categoryClass = categoryMap[value as keyof typeof categoryMap];
        this.cardCategory.classList.add(categoryClass);
    }
}

export class CardDetails extends CardGallery<CardDetailsData> {
    protected cardDescription: HTMLElement;
    protected cardButton: HTMLButtonElement;
    protected readonly event: IEvents;
    protected isProductInCart = false;

    constructor(container: HTMLElement, event: IEvents) {
        super(container);

        this.cardDescription = ensureElement<HTMLElement>('.card__text', this.container)
        this.cardButton = ensureElement<HTMLButtonElement>('.card__button', this.container);
        this.event = event;

        this.cardButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            const productId = this.container.dataset.productId;
            if (!productId || this.cardButton.disabled) {
                return;
            }

            if (this.isProductInCart) {
                this.event.emit('basket.remove', { productId });
            } else {
                this.event.emit('basket.add', { productId });
            }
        })
    }

    set description(value: string) {
            this.cardDescription.textContent = value;
    }

    set buttonText(value: string) {
        this.cardButton.textContent = value;
    }

    set buttonDisabled(value: boolean) {
        this.cardButton.disabled = value;
    }

    set isInCart(value: boolean) {
        this.isProductInCart = value;
    }
}

export class CardBasket extends Card<CardBasketData> {
    protected cardButton: HTMLButtonElement;
    protected indexElement: HTMLElement;
    protected actions?: cardActionsInterface;

    constructor(container: HTMLElement, actions?: cardActionsInterface) {
        super(container);

        this.actions = actions;
        this.cardButton = ensureElement<HTMLButtonElement>('.basket__item-delete.card__button', this.container);
        this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);

        this.cardButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.actions?.onClick?.(evt);
        });
    }

    set index(value: number) {
        this.indexElement.textContent = `${value}.`;
    }
}