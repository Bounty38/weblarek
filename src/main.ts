import { Api } from './components/base/Api';
import './scss/styles.scss';
import { WebLarekApi } from './components/api/WebLarekApi';
import { BuyerModel } from './components/Models/BuyerModel';
import { CartModel } from './components/Models/CartModel';
import { ProductsModel } from './components/Models/ProductsModel';
import { API_URL } from './utils/constants';

const buyerModel = new BuyerModel();
const cartModel = new CartModel();
const productsModel = new ProductsModel();

const webLarekApi = new WebLarekApi(new Api(API_URL));

buyerModel.setData({
    payment: 'card',
    address: 'Москва',
    email: 'test@test.ru',
    phone: '+79990000000',
});

console.log('Покупатель:', buyerModel.getData());
console.log('Валидация покупателя:', buyerModel.validate());

async function init(): Promise<void> {
    try {
        const productsResponse = await webLarekApi.getProducts();

        productsModel.setProducts(productsResponse.items);
        console.log('Массив товаров из каталога:', productsModel.getProducts());

        const products = productsModel.getProducts();

        if (products.length > 1) {
            cartModel.clear();

            cartModel.addItem(products[0]);
            cartModel.addItem(products[1]);

            console.log('Корзина: товары после добавления', cartModel.getItems());
            console.log('Корзина: количество', cartModel.getCount());
            console.log('Корзина: сумма', cartModel.getTotal());
            console.log('Корзина: есть первый товар', cartModel.contains(products[0].id));

            cartModel.removeItem(products[0]);
            console.log('Корзина: после удаления первого товара', cartModel.getItems());

            cartModel.clear();
            console.log('Корзина: после очистки', cartModel.getItems());
        } else {
            console.log('Недостаточно товаров для теста корзины');
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

init();
