import { Component } from "../base/Component";

interface GalleryData {
    items: HTMLElement[];
}

export class Gallery extends Component<GalleryData> {
    protected galleryCatalog: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);
        this.galleryCatalog = this.container;
    }

    set items(items: HTMLElement[]) {
        this.galleryCatalog.replaceChildren(...items);
    }
}