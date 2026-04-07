import './scss/styles.scss';

import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { WebLarekApi } from './components/api/WebLarekApi';
import { BuyerModel } from './components/Models/BuyerModel';
import { CartModel } from './components/Models/CartModel';
import { ProductsModel } from './components/Models/ProductsModel';
import { Modal } from './components/view/Modal';
import { API_URL, CDN_URL, categoryMap } from './utils/constants';
import { apiProducts } from './utils/data';
import { IOrder, IProduct, TPayment } from './types';

const events = new EventEmitter();

const gallery = getRequiredElement<HTMLElement>('.gallery');
const basketButton = getRequiredElement<HTMLButtonElement>('.header__basket');
const basketCounter = getRequiredElement<HTMLSpanElement>('.header__basket-counter');
const modalContainer = getRequiredElement<HTMLElement>('#modal-container');
const modal = new Modal(modalContainer, events);

const productsModel = new ProductsModel();
const cartModel = new CartModel();
const buyerModel = new BuyerModel();
const webLarekApi = new WebLarekApi(new Api(API_URL));

const demoProducts = apiProducts.items as IProduct[];

runModelChecks();
updateBasketCounter();

basketButton.addEventListener('click', () => {
	modal.open(createBasketContent());
});

void loadProducts();

function getRequiredElement<T extends Element>(selector: string, parent: ParentNode = document): T {
	const element = parent.querySelector<T>(selector);

	if (!element) {
		throw new Error(`Required element not found: ${selector}`);
	}

	return element;
}

function getTemplateRoot<T extends Element>(templateId: string): T {
	const template = getRequiredElement<HTMLTemplateElement>(`#${templateId}`);
	const root = template.content.firstElementChild;

	if (!root) {
		throw new Error(`Template ${templateId} has no root element`);
	}

	return root.cloneNode(true) as T;
}

function getCategoryClass(category: string): string {
	return categoryMap[category as keyof typeof categoryMap] ?? categoryMap['другое'];
}

function formatPrice(price: number | null): string {
	return price === null ? 'Бесценно' : `${price} синапсов`;
}

function setCardCategory(categoryElement: HTMLElement, category: string): void {
	categoryElement.textContent = category;
	categoryElement.className = `card__category ${getCategoryClass(category)}`;
}

function setCardImage(imageElement: HTMLImageElement, imagePath: string, title: string): void {
	imageElement.src = `${CDN_URL}${imagePath}`;
	imageElement.alt = title;
}

function updateBasketCounter(): void {
	basketCounter.textContent = String(cartModel.getCount());
}

function renderCatalog(): void {
	const cards = productsModel.getProducts().map((product) => createCatalogCard(product));
	gallery.replaceChildren(...cards);
}

function createCatalogCard(product: IProduct): HTMLButtonElement {
	const card = getTemplateRoot<HTMLButtonElement>('card-catalog');

	const categoryElement = getRequiredElement<HTMLElement>('.card__category', card);
	const titleElement = getRequiredElement<HTMLElement>('.card__title', card);
	const imageElement = getRequiredElement<HTMLImageElement>('.card__image', card);
	const priceElement = getRequiredElement<HTMLElement>('.card__price', card);

	setCardCategory(categoryElement, product.category);
	titleElement.textContent = product.title;
	setCardImage(imageElement, product.image, product.title);
	priceElement.textContent = formatPrice(product.price);

	card.addEventListener('click', () => {
		productsModel.setSelectedProduct(product);
		modal.open(createPreviewCard(product));
	});

	return card;
}

function createPreviewCard(product: IProduct): HTMLElement {
	const preview = getTemplateRoot<HTMLElement>('card-preview');

	const categoryElement = getRequiredElement<HTMLElement>('.card__category', preview);
	const titleElement = getRequiredElement<HTMLElement>('.card__title', preview);
	const descriptionElement = getRequiredElement<HTMLElement>('.card__text', preview);
	const imageElement = getRequiredElement<HTMLImageElement>('.card__image', preview);
	const priceElement = getRequiredElement<HTMLElement>('.card__price', preview);
	const actionButton = getRequiredElement<HTMLButtonElement>('.card__button', preview);

	setCardCategory(categoryElement, product.category);
	titleElement.textContent = product.title;
	descriptionElement.textContent = product.description;
	setCardImage(imageElement, product.image, product.title);
	priceElement.textContent = formatPrice(product.price);

	if (product.price === null) {
		actionButton.textContent = 'Недоступно';
		actionButton.disabled = true;
		return preview;
	}

	actionButton.textContent = cartModel.contains(product.id) ? 'Удалить из корзины' : 'Купить';

	actionButton.addEventListener('click', () => {
		if (cartModel.contains(product.id)) {
			cartModel.removeItem(product);
		} else {
			cartModel.addItem(product);
		}

		updateBasketCounter();
		modal.close();
	});

	return preview;
}

function createBasketItem(product: IProduct, index: number): HTMLElement {
	const basketItem = getTemplateRoot<HTMLElement>('card-basket');

	const indexElement = getRequiredElement<HTMLElement>('.basket__item-index', basketItem);
	const titleElement = getRequiredElement<HTMLElement>('.card__title', basketItem);
	const priceElement = getRequiredElement<HTMLElement>('.card__price', basketItem);
	const deleteButton = getRequiredElement<HTMLButtonElement>('.basket__item-delete', basketItem);

	indexElement.textContent = String(index);
	titleElement.textContent = product.title;
	priceElement.textContent = formatPrice(product.price);

	deleteButton.addEventListener('click', () => {
		cartModel.removeItem(product);
		updateBasketCounter();
		modal.open(createBasketContent());
	});

	return basketItem;
}

function createBasketContent(): HTMLElement {
	const basket = getTemplateRoot<HTMLElement>('basket');

	const list = getRequiredElement<HTMLElement>('.basket__list', basket);
	const priceElement = getRequiredElement<HTMLElement>('.basket__price', basket);
	const checkoutButton = getRequiredElement<HTMLButtonElement>('.basket__button', basket);

	const items = cartModel.getItems();
	const basketItems = items.map((item, index) => createBasketItem(item, index + 1));

	list.replaceChildren(...basketItems);
	priceElement.textContent = `${cartModel.getTotal()} синапсов`;
	checkoutButton.disabled = items.length === 0;

	checkoutButton.addEventListener('click', () => {
		modal.open(createOrderStepOne());
	});

	return basket;
}

function getOrderStepOneErrors(): string[] {
	const validation = buyerModel.validate();
	const errors: string[] = [];

	if (validation.payment) {
		errors.push(validation.payment);
	}

	if (validation.address) {
		errors.push(validation.address);
	}

	return errors;
}

function createOrderStepOne(): HTMLFormElement {
	const orderForm = getTemplateRoot<HTMLFormElement>('order');

	const cardButton = getRequiredElement<HTMLButtonElement>('button[name="card"]', orderForm);
	const cashButton = getRequiredElement<HTMLButtonElement>('button[name="cash"]', orderForm);
	const addressInput = getRequiredElement<HTMLInputElement>('input[name="address"]', orderForm);
	const submitButton = getRequiredElement<HTMLButtonElement>('button[type="submit"]', orderForm);
	const errorsElement = getRequiredElement<HTMLElement>('.form__errors', orderForm);

	const buyerData = buyerModel.getData();

	if (buyerData.address) {
		addressInput.value = buyerData.address;
	}

	const setPayment = (payment: TPayment): void => {
		buyerModel.setData({ payment });
		updateStepState();
	};

	const updatePaymentButtons = (): void => {
		const currentPayment = buyerModel.getData().payment;
		cardButton.classList.toggle('button_alt-active', currentPayment === 'card');
		cashButton.classList.toggle('button_alt-active', currentPayment === 'cash');
	};

	const updateStepState = (): void => {
		updatePaymentButtons();

		const errors = getOrderStepOneErrors();
		errorsElement.textContent = errors.join('; ');
		submitButton.disabled = errors.length > 0;
	};

	cardButton.addEventListener('click', () => setPayment('card'));
	cashButton.addEventListener('click', () => setPayment('cash'));

	addressInput.addEventListener('input', () => {
		buyerModel.setData({ address: addressInput.value.trim() });
		updateStepState();
	});

	orderForm.addEventListener('submit', (evt) => {
		evt.preventDefault();
		updateStepState();

		if (submitButton.disabled) {
			return;
		}

		modal.open(createOrderStepTwo());
	});

	updateStepState();
	return orderForm;
}

function getOrderStepTwoErrors(): string[] {
	const validation = buyerModel.validate();
	const errors: string[] = [];

	if (validation.email) {
		errors.push(validation.email);
	}

	if (validation.phone) {
		errors.push(validation.phone);
	}

	return errors;
}

function createOrderStepTwo(): HTMLFormElement {
	const contactsForm = getTemplateRoot<HTMLFormElement>('contacts');

	const emailInput = getRequiredElement<HTMLInputElement>('input[name="email"]', contactsForm);
	const phoneInput = getRequiredElement<HTMLInputElement>('input[name="phone"]', contactsForm);
	const submitButton = getRequiredElement<HTMLButtonElement>('button[type="submit"]', contactsForm);
	const errorsElement = getRequiredElement<HTMLElement>('.form__errors', contactsForm);

	const buyerData = buyerModel.getData();

	if (buyerData.email) {
		emailInput.value = buyerData.email;
	}

	if (buyerData.phone) {
		phoneInput.value = buyerData.phone;
	}

	const updateStepState = (): void => {
		const errors = getOrderStepTwoErrors();
		errorsElement.textContent = errors.join('; ');
		submitButton.disabled = errors.length > 0;
	};

	emailInput.addEventListener('input', () => {
		buyerModel.setData({ email: emailInput.value.trim() });
		updateStepState();
	});

	phoneInput.addEventListener('input', () => {
		buyerModel.setData({ phone: phoneInput.value.trim() });
		updateStepState();
	});

	contactsForm.addEventListener('submit', (evt) => {
		evt.preventDefault();
		updateStepState();

		if (submitButton.disabled) {
			return;
		}

		const freshBuyerData = buyerModel.getData();

		if (!freshBuyerData.payment || !freshBuyerData.address || !freshBuyerData.email || !freshBuyerData.phone) {
			errorsElement.textContent = 'Заполните все поля заказа';
			return;
		}

		const order: IOrder = {
			payment: freshBuyerData.payment,
			address: freshBuyerData.address,
			email: freshBuyerData.email,
			phone: freshBuyerData.phone,
			items: cartModel.getItems().map((item) => item.id),
			total: cartModel.getTotal(),
		};

		submitButton.disabled = true;
		submitButton.textContent = 'Оплата...';

		void webLarekApi
			.postOrder(order)
			.then((result) => {
				cartModel.clear();
				buyerModel.clear();
				updateBasketCounter();
				modal.open(createSuccessContent(result.total));
			})
			.catch((error: unknown) => {
				const message = error instanceof Error ? error.message : 'Не удалось оформить заказ';
				errorsElement.textContent = message;
				submitButton.disabled = false;
				submitButton.textContent = 'Оплатить';
			});
	});

	updateStepState();
	return contactsForm;
}

function createSuccessContent(total: number): HTMLElement {
	const success = getTemplateRoot<HTMLElement>('success');
	const description = getRequiredElement<HTMLElement>('.order-success__description', success);
	const closeButton = getRequiredElement<HTMLButtonElement>('.order-success__close', success);

	description.textContent = `Списано ${total} синапсов`;

	closeButton.addEventListener('click', () => {
		modal.close();
	});

	return success;
}

async function loadProducts(): Promise<void> {
	try {
		const products = await webLarekApi.getProducts();
		productsModel.setProducts(products);
	} catch {
		productsModel.setProducts(demoProducts);
	}

	renderCatalog();
}

function runModelChecks(): void {
	console.log('========== ProductsModel ==========');

	productsModel.setProducts(demoProducts);
	console.log('Все товары:', productsModel.getProducts());

	const firstProduct = productsModel.getProducts()[0];
	if (firstProduct) {
		console.log('Товар по id:', productsModel.getProductById(firstProduct.id));
		productsModel.setSelectedProduct(firstProduct);
		console.log('Выбранный товар:', productsModel.getSelectedProduct());
	}

	console.log('\n========== CartModel ==========');

	if (firstProduct) {
		cartModel.addItem(firstProduct);
		console.log('Товары в корзине:', cartModel.getItems());
		console.log('Есть ли товар:', cartModel.contains(firstProduct.id));
		console.log('Количество:', cartModel.getCount());
		console.log('Сумма:', cartModel.getTotal());

		cartModel.removeItem(firstProduct);
		console.log('После удаления:', cartModel.getItems());
	}

	cartModel.clear();
	console.log('После очистки:', cartModel.getItems());

	console.log('\n========== BuyerModel ==========');

	console.log('Ошибки (пустые данные):', buyerModel.validate());

	buyerModel.setData({
		payment: 'card',
		address: 'Москва, ул. Пушкина, д. 1',
	});
	console.log('Ошибки (частично заполнено):', buyerModel.validate());

	buyerModel.setData({
		email: 'test@example.com',
		phone: '+79990000000',
	});
	console.log('Ошибки (все данные заполнены):', buyerModel.validate());
	console.log('Данные покупателя:', buyerModel.getData());

	buyerModel.clear();
	console.log('После очистки:', buyerModel.getData());
}
