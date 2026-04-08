import { Api } from './components/base/Api';
import './scss/styles.scss';
import { WebLarekApi } from './components/api/WebLarekApi';
import { BuyerModel } from './components/Models/BuyerModel';
import { CartModel } from './components/Models/CartModel';
import { ProductsModel } from './components/Models/ProductsModel';
import { API_URL } from './utils/constants';
import { apiProducts } from './utils/data';

const buyerModel = new BuyerModel();
const cartModel = new CartModel();
const productsModel = new ProductsModel();

const webLarekApi = new WebLarekApi(new Api(API_URL));

console.log('========== ProductsModel ==========');
// Проверяем `ProductsModel` на моковых товарах:
// - `setProducts` загружает список товаров
// - `getProducts` возвращает сохранённый массив
productsModel.setProducts(apiProducts.items);
console.log('Все товары (мок):', productsModel.getProducts());

const mockProducts = productsModel.getProducts();
const firstProduct = mockProducts[0];
const secondProduct = mockProducts[1];

if (firstProduct) {
    // Проверяем поведение методов выбора товара:
    // - `getProductById` ищет товар по id
    // - `setSelectedProduct` устанавливает/сбрасывает выбранный товар
    console.log('Товар по id:', productsModel.getProductById(firstProduct.id));
    productsModel.setSelectedProduct(firstProduct);
    console.log('Выбранный товар:', productsModel.getSelectedProduct());
    productsModel.setSelectedProduct(null);
    console.log('После сброса выбранного товара:', productsModel.getSelectedProduct());
}

console.log('\n========== CartModel ==========');

if (firstProduct && secondProduct) {
    // Тестируем `CartModel`:
    // - `addItem` добавляет товар
    // - `contains`, `getCount`, `getTotal` — служебные проверки состояния корзины
    cartModel.addItem(firstProduct);
    cartModel.addItem(secondProduct);

    console.log('Корзина после добавления:', cartModel.getItems());
    console.log('Есть ли первый товар:', cartModel.contains(firstProduct.id));
    console.log('Количество товаров:', cartModel.getCount());
    console.log('Сумма корзины:', cartModel.getTotal());

    cartModel.removeItem(firstProduct);
    console.log('Корзина после удаления первого товара:', cartModel.getItems());

    cartModel.clear();
    console.log('Корзина после очистки:', cartModel.getItems());
}

console.log('\n========== BuyerModel ==========');
// Тесты `BuyerModel`:
// 1) Проверка на пустые данные — ждем ошибки для всех обязательных полей
console.log('Ошибки (пустые данные):', buyerModel.validate());

// 2) Частичное заполнение (merge): `setData` обновляет только переданные поля,
//    поэтому можно вызывать его несколько раз, дополняя данные по шагам.
//    Здесь задаём `payment` и некорректный `address` (пробелы) — ждем ошибку по адресу.
buyerModel.setData({
    payment: 'card',
    address: '   ',
});
console.log('Ошибки (частично заполнено и некорректный адрес):', buyerModel.validate());

// 3) Дозаполняем оставшиеся поля — теперь валидация должна вернуть пустой объект ошибок.
buyerModel.setData({
    address: 'Москва',
    email: 'test@test.ru',
    phone: '+79990000000',
});
console.log('Ошибки (полностью заполнено):', buyerModel.validate());
console.log('Данные покупателя:', buyerModel.getData());

// 4) `clear` сбрасывает модель в начальное состояние
buyerModel.clear();
console.log('Данные после clear:', buyerModel.getData());
console.log('Ошибки после clear:', buyerModel.validate());

console.log('\n========== API ==========');

void webLarekApi
    .getProducts()
    .then((productsResponse) => {
        // Проверка интеграции с API:
        // - полученные с сервера данные кладём в модель через `setProducts`
        // - затем выводим текущее состояние каталога
        productsModel.setProducts(productsResponse.items);
        console.log('Каталог после запроса:', productsModel.getProducts());
    })
    .catch((error) => {
        console.error('Ошибка загрузки:', error);
    });
