import { Api } from './components/base/Api';
import './scss/styles.scss';
import { WebLarekApi } from './components/api/WebLarekApi';
import { BuyerModel } from './components/Models/BuyerModel';
import { CartModel } from './components/Models/CartModel';
import { ProductsModel } from './components/Models/ProductsModel';
import { API_URL } from './utils/constants';
import { EventEmitter } from './components/base/Events';
import { Basket } from './components/view/Basket';
import { ContactForm, OrderForm } from './components/view/Form';
import { Gallery } from './components/view/Gallery';
import { Modal } from './components/view/Modal';
import { Success } from './components/view/Success';
import { Header } from './components/view/Header';
import { CardBasket, CardDetails, CardGallery } from './components/view/Card';
import { cloneTemplate } from './utils/utils';
import { IBuyer, ValidationErrors, IProduct } from './types';


const baseApi = new Api(API_URL);
const appApi = new WebLarekApi(baseApi);

const event = new EventEmitter();
const catalog = new ProductsModel(event);
const basket = new Basket( cloneTemplate<HTMLElement>("#basket"), event);
const contactForm = new ContactForm( cloneTemplate<HTMLElement>("#contacts"), event);
const orderForm = new OrderForm(cloneTemplate<HTMLElement>("#order"), event);
const gallery = new Gallery(document.querySelector('.gallery') as HTMLElement);
const modal = new Modal(event,document.querySelector('#modal-container') as HTMLElement);
const successModal = new Success(cloneTemplate<HTMLElement>("#success"), event);
const cart = new CartModel(event);
const buyer = new BuyerModel(event);
const header = new Header(event, document.querySelector(".header") as HTMLElement);
const cardDetail = new CardDetails(cloneTemplate<HTMLElement>("#card-preview"), event);

const getErrors = (errors: ValidationErrors, fields: (keyof ValidationErrors)[]): string[] => {
    return fields.map((field) => errors[field]).filter((error): error is string => !!error);
}

event.on<{ items: IProduct[] }>('products.update', ({ items }) => {
    const cards = items.map((item) => {
        const card = new CardGallery(
            cloneTemplate<HTMLElement>("#card-catalog"),
            {
                onClick: () => event.emit('card.select', { productId: item.id }),
            }
        );

        return card.render({
            title: item.title,
            price: item.price,
            category: item.category,
            image: item.image,
        });
    });

    gallery.items = cards;
});

event.on<{ productId: string }>('card.select', ({ productId }) => {
    catalog.setSelectedProduct(catalog.getProductById(productId));
});

event.on<IProduct | null>('product.current', (product) => {
    if (!product) return;

    const unavailable = product.price === null;
    const inCart = cart.hasItem(product.id);

    modal.content = cardDetail.render({
        title: product.title,
        price: product.price,
        category: product.category,
        image: product.image,
        description: product.description,
        buttonDisabled: unavailable,
        buttonText: unavailable ? 'Недоступно' : inCart ? 'Удалить из корзины' : 'Купить',
    });
    modal.open();
});

event.on<{ items: IProduct[] }>('cart.update', ({ items }) => {
    const cartItems = items.map((item, index) => {
        const cartItem = new CardBasket(cloneTemplate<HTMLElement>("#card-basket"), {
            onClick: () => event.emit('basket.remove', { productId: item.id })
        });
        return cartItem.render({
            title: item.title,
            price: item.price,
            index: index + 1,
        });
    });

    const total = items.reduce((sum, item) => sum + (item.price ?? 0), 0);
    const quantity = items.length;

    basket.list = cartItems;
    basket.total = total;
    basket.buttonDisabled = quantity === 0;
    header.counter = quantity;
})

event.on<Partial<IBuyer>>('order.change', (data) => {
  buyer.setData(data);
});

event.on<{ email?: string; phone?: string }>('contacts.change', (data) => {
  buyer.setData(data);
});

event.on<Partial<IBuyer>>('buyer.changed', (data) => {
    const currentBuyer = {
        payment: data.payment ?? '',
        address: data.address ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
    };

    orderForm.address = currentBuyer.address;
    orderForm.payment = currentBuyer.payment;
    contactForm.phone = currentBuyer.phone;
    contactForm.email = currentBuyer.email;

    const errors = buyer.validate();
    
    orderForm.valid = !errors.payment && !errors.address;
    orderForm.errors = getErrors(errors, ['payment', 'address']);

    contactForm.valid = !errors.email && !errors.phone;
    contactForm.errors = getErrors(errors, ['email', 'phone']);
});

event.on('preview.toggle', () => {
    const product = catalog.getSelectedProduct();
    if (!product || product.price === null) {
        return;
    }

    if (cart.hasItem(product.id)) {
        cart.removeItem(product.id);
    } else {
        cart.addItem(product);
    }

    modal.close();
});

event.on<{ productId: string }>('basket.add', ({ productId }) => {
    const product = catalog.getProductById(productId);
    if (!product || cart.hasItem(product.id)) {
        return;
    }

    cart.addItem(product);

    modal.close();
});

event.on<{ productId: string }>('basket.remove', ({ productId }) => {
    if (cart.hasItem(productId)) {
        cart.removeItem(productId);
    }
});

event.on('basket.open', () => {
    modal.content = basket.render();
    modal.open();
});

event.on('basket.buy', () => {
    modal.content = orderForm.render();
    modal.open();
});

event.on('order.submit', () => {
    modal.content = contactForm.render();
    modal.open();
});

event.on('contacts.submit', async () => {
    const orderData: IBuyer = buyer.getData();
    const order = {
        ...orderData,
        items: cart.getItems().map((item) => item.id),
        total: cart.getTotalPrice(),
    };

    try {
        const result = await appApi.postOrder(order);

        modal.content = successModal.render({
            total: result.total
        });
        modal.open();
        cart.cleanCart();
        buyer.clear();
    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : 'Неизвестная ошибка сервера';
        contactForm.errors = [`Не удалось отправить заказ: ${message}`];
    }
});

event.on('success.close', () => {
    modal.close();
});

basket.buttonDisabled = cart.getQuantity() === 0;


async function loadProducts(): Promise<void> {
    try {
        const data = await appApi.getProducts();
        catalog.setProducts(data.items);
    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : 'Неизвестная ошибка сервера';
        gallery.items = [];
        modal.content = contactForm.render({
            valid: false,
            errors: [`Не удалось загрузить каталог: ${message}`],
        });
        modal.open();
    }
}

void loadProducts();
