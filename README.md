# Веб-ларёк

Учебное frontend-приложение интернет-магазина на TypeScript и Vite. Пользователь может просматривать каталог, открывать карточку товара в модальном окне, добавлять и удалять товары из корзины и оформлять заказ в два шага.

## Стек

- TypeScript
- Vite
- SCSS (sass-embedded)

## Установка и запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

## Архитектура

Приложение реализовано по паттерну MVP.

- Model: хранит и изменяет данные (товары, корзина, покупатель), эмитит события об изменениях.
- View: рендерит интерфейс, не хранит бизнес-данные, генерирует пользовательские события.
- Presenter: связывает Model и View через EventEmitter, подписывается на события и оркестрирует сценарии.

В этом проекте роль Presenter выполняет файл src/main.ts.

## Структура проекта

- index.html: шаблоны карточек, форм, корзины, модалки.
- src/main.ts: инициализация приложения и логика Presenter.
- src/types/index.ts: типы и интерфейсы данных.
- src/components/base: базовые переиспользуемые классы.
- src/components/Models: классы моделей данных.
- src/components/view: классы представления.
- src/components/api/WebLarekApi.ts: слой коммуникации с сервером.
- src/utils/constants.ts: URL и вспомогательные константы.

## Базовый код

### Класс Component

Назначение: базовый абстрактный класс UI-компонента.

Конструктор:

- constructor(container: HTMLElement): принимает корневой DOM-элемент компонента.

Поля:

- container: HTMLElement: корневой элемент компонента.

Методы:

- render(data?: Partial[T]): HTMLElement: записывает переданные поля через сеттеры и возвращает корневой элемент.
- setImage(element: HTMLImageElement, src: string, alt?: string): устанавливает src и alt изображения.

### Класс Api

Назначение: базовый HTTP-клиент.

Конструктор:

- constructor(baseUrl: string, options: RequestInit = {}): принимает базовый URL и опции запроса.

Поля:

- baseUrl: string
- options: RequestInit

Методы:

- get[T extends object](uri: string): Promise[T]
- post[T extends object](uri: string, data: object, method?: ApiPostMethods): Promise[T]

### Класс EventEmitter

Назначение: брокер событий для связи слоев приложения.

Конструктор:

- constructor(): без параметров.

Поля:

- _events: Map[EventName, Set[Subscriber]]: хранилище подписчиков.

Методы:

- on[T](event: EventName, callback: (data: T) => void): подписка на событие.
- emit[T](event: string, data?: T): публикация события.
- off(event: EventName, callback: Subscriber): удаление подписки.
- onAll(callback): подписка на все события.
- offAll(): сброс всех подписок.
- trigger[T extends object](event: string, context?: Partial[T]): фабрика callback, публикующего событие.

## Типы данных

Типы расположены в src/types/index.ts.

### ApiPostMethods

- 'POST' | 'PUT' | 'DELETE'

### IApi

- get[T extends object](uri: string): Promise[T]
- post[T extends object](uri: string, data: object, method?: ApiPostMethods): Promise[T]

### TPayment

- 'card' | 'cash' | ''

### ValidationErrors

- Partial[Record[keyof IBuyer, string]]

### IProduct

- id: string
- description: string
- image: string
- title: string
- category: string
- price: number | null

### IBuyer

- payment: TPayment
- email: string
- phone: string
- address: string

### IProductsResponse

- total: number
- items: IProduct[]

### IOrder

Расширяет IBuyer:

- items: string[]
- total: number

### IOrderResult

- id: string
- total: number

## Модели данных

### Класс ProductsModel

Назначение: хранение каталога и выбранного товара.

Конструктор:

- constructor(event: IEvents)

Поля:

- products: IProduct[]
- selectedProduct: IProduct | null
- event: IEvents

Методы:

- getProducts(): IProduct[]: возвращает копию каталога.
- setProducts(products: IProduct[]): void: сохраняет каталог.
- getProductById(productId: string): IProduct | null: возвращает товар по id.
- setSelectedProduct(product: IProduct | null): void: сохраняет выбранный товар.
- selectProduct(product: IProduct): void: алиас выбора товара.
- getSelectedProduct(): IProduct | null: возвращает выбранный товар.

События:

- products.update, payload: { items: IProduct[] }
- product.current, payload: IProduct | null

### Класс CartModel

Назначение: хранение и изменение корзины.

Конструктор:

- constructor(event: IEvents)

Поля:

- items: IProduct[]
- event: IEvents

Методы:

- addItem(product: IProduct): void
- removeItem(productId: string): void
- clear(): void
- deleteItem(productId: string): void: совместимость, вызывает removeItem.
- cleanCart(): void: совместимость, вызывает clear.
- getQuantity(): number
- getItems(): IProduct[]
- getTotalPrice(): number
- hasItem(id: string): boolean

События:

- cart.update, payload: { items: IProduct[] }

### Класс BuyerModel

Назначение: хранение и валидация данных покупателя.

Конструктор:

- constructor(event: IEvents)

Поля:

- data: IBuyer
- event: IEvents

Методы:

- setData(data: Partial[IBuyer]): void: частичное обновление полей.
- getData(): IBuyer
- clear(): void
- validate(): ValidationErrors

События:

- buyer.changed, payload: Partial[IBuyer]

## Слой коммуникации

### Класс WebLarekApi

Назначение: получение каталога и отправка заказа через композицию с IApi.

Конструктор:

- constructor(api: IApi)

Поля:

- api: IApi

Методы:

- getProducts(): Promise[IProductsResponse]
- postOrder(order: IOrder): Promise[IOrderResult]

## Слой представления

Общие правила View-компонентов:

- DOM-элементы кэшируются в конструкторе.
- Слушатели подписываются один раз в конструкторе.
- Компоненты не хранят бизнес-данные и не обращаются к API/Model напрямую.
- render() без аргументов возвращает корневой HTMLElement.

### Класс Card

Назначение: базовая карточка товара с общими полями.

Конструктор:

- constructor(container: HTMLElement)

Кэшируемые DOM-поля:

- cardTitle: HTMLElement
- cardPrice: HTMLElement

Публичные сеттеры:

- id: string: записывает productId в dataset.
- title: string
- price: number | null

События: не эмитит напрямую.

### Класс CardGallery

Шаблон: #card-catalog.

Назначение: карточка товара в каталоге.

Конструктор:

- constructor(container: HTMLElement, actions?: { onClick: (event: MouseEvent) => void })

Кэшируемые DOM-поля:

- cardImage: HTMLImageElement
- cardCategory: HTMLElement

Публичные сеттеры:

- image: string
- category: string: применяет фон категории через categoryMap из src/utils/constants.ts.

События:

- card.select (через onClick callback), payload: { productId: string }

### Класс CardDetails

Шаблон: #card-preview.

Назначение: карточка превью внутри модального окна.

Конструктор:

- constructor(container: HTMLElement, event: IEvents)

Кэшируемые DOM-поля:

- cardDescription: HTMLElement
- cardButton: HTMLButtonElement

Публичные сеттеры:

- description: string
- isInCart: boolean
- buttonDisabled: boolean
- buttonText: string

События:

- basket.add, payload: { productId: string }
- basket.remove, payload: { productId: string }

Событие выбирается по текущему состоянию isInCart.

### Класс CardBasket

Шаблон: #card-basket.

Назначение: строка товара в корзине.

Конструктор:

- constructor(container: HTMLElement, actions?: { onClick: (event: MouseEvent) => void })

Кэшируемые DOM-поля:

- cardButton: HTMLButtonElement
- indexElement: HTMLElement

Публичные сеттеры:

- index: number

События:

- basket.remove (через onClick callback), payload: { productId: string }

### Класс Gallery

Назначение: контейнер каталога карточек.

Конструктор:

- constructor(container: HTMLElement)

Кэшируемые DOM-поля:

- galleryCatalog: HTMLElement

Публичные сеттеры:

- items: HTMLElement[]

События: не эмитит напрямую.

### Класс Header

Назначение: кнопка корзины и счетчик.

Конструктор:

- constructor(event: IEvents, container: HTMLElement)

Кэшируемые DOM-поля:

- headerCounter: HTMLElement
- basketButton: HTMLButtonElement

Публичные сеттеры:

- counter: number

События:

- basket.open, payload: отсутствует

### Класс Basket

Шаблон: #basket.

Назначение: модалка корзины с товарами, суммой и кнопкой оформления.

Конструктор:

- constructor(container: HTMLElement, events: IEvents)

Кэшируемые DOM-поля:

- cardList: HTMLElement
- cardTotal: HTMLElement
- cardButton: HTMLButtonElement

Публичные сеттеры:

- list: HTMLElement[]
- total: number
- buttonDisabled: boolean

События:

- basket.buy, payload: отсутствует

### Класс Form

Назначение: базовый класс форм (submit, valid, errors).

Конструктор:

- constructor(container: HTMLElement, event: IEvents)

Кэшируемые DOM-поля:

- formSubmit: HTMLButtonElement
- formErrors: HTMLElement

Публичные сеттеры:

- valid: boolean
- errors: string[]

События:

- [form-name].submit (например order.submit или contacts.submit)

### Класс OrderForm

Шаблон: #order.

Назначение: первый шаг оформления (оплата и адрес).

Конструктор:

- constructor(container: HTMLElement, event: IEvents)

Кэшируемые DOM-поля:

- cardButton: HTMLButtonElement
- cashButton: HTMLButtonElement
- formAdress: HTMLInputElement

Публичные сеттеры:

- payment: TPayment: переключает button_alt-active.
- address: string

События:

- order.change, payload: Partial[IBuyer]
- order.submit, payload: отсутствует

### Класс ContactForm

Шаблон: #contacts.

Назначение: второй шаг оформления (email и phone).

Конструктор:

- constructor(container: HTMLElement, event: IEvents)

Кэшируемые DOM-поля:

- formEmail: HTMLInputElement
- formPhone: HTMLInputElement

Публичные сеттеры:

- email: string
- phone: string

События:

- contacts.change, payload: { email?: string, phone?: string }
- contacts.submit, payload: отсутствует

### Класс Modal

Назначение: управление общим контейнером модального окна.

Важное требование: это отдельный компонент без наследования от карточек/форм; другие View рендерятся внутрь него.

Конструктор:

- constructor(event: IEvents, container: HTMLElement)

Кэшируемые DOM-поля:

- closeButton: HTMLButtonElement
- modalContent: HTMLElement

Публичные методы и сеттеры:

- content: HTMLElement
- open(): добавляет модификатор modal_active.
- close(): удаляет модификатор modal_active.

Поведение:

- Закрытие по клику на крестик.
- Закрытие по клику вне контента.

### Класс Success

Шаблон: #success.

Назначение: окно успешного заказа.

Конструктор:

- constructor(container: HTMLElement, event: IEvents)

Кэшируемые DOM-поля:

- successTotal: HTMLElement
- closeButton: HTMLButtonElement

Публичные сеттеры:

- total: number

События:

- success.close, payload: отсутствует

## Слой Presenter

Реализован в src/main.ts.

Ответственность:

- Инициализация API, моделей, View-компонентов и EventEmitter.
- Подписка на события View и Model.
- Рендер каталога, превью, корзины и форм.
- Валидация форм через BuyerModel.
- Формирование и отправка заказа через WebLarekApi.
- Очистка состояния после успешной оплаты.

Принцип ререндера:

- Presenter вызывает методы моделей.
- Обновление интерфейса выполняется в обработчиках событий моделей (products.update, product.current, cart.update, buyer.changed).

## Список событий приложения

| Событие | Payload | Источник | Назначение |
| --- | --- | --- | --- |
| products.update | { items: IProduct[] } | ProductsModel | Обновить каталог на главной странице |
| product.current | IProduct \| null | ProductsModel | Обновить превью выбранного товара в модалке |
| cart.update | { items: IProduct[] } | CartModel | Обновить список корзины, сумму и счетчик |
| buyer.changed | Partial[IBuyer] | BuyerModel | Синхронизировать значения форм и ошибки валидации |
| card.select | { productId: string } | CardGallery | Выбрать товар для просмотра |
| basket.add | { productId: string } | CardDetails | Добавить товар в корзину |
| basket.remove | { productId: string } | CardDetails или CardBasket | Удалить товар из корзины |
| basket.open | отсутствует | Header | Открыть модалку корзины |
| basket.buy | отсутствует | Basket | Перейти к шагу order |
| order.change | Partial[IBuyer] | OrderForm | Обновить payment/address в BuyerModel |
| order.submit | отсутствует | Form(order) | Перейти к форме contacts |
| contacts.change | { email?: string, phone?: string } | ContactForm | Обновить email/phone в BuyerModel |
| contacts.submit | отсутствует | Form(contacts) | Отправить заказ на сервер |
| success.close | отсутствует | Success | Закрыть модальное окно успеха |

## Соответствие TODO и REVIEW_CHECKLIST

- Каталог, модалки, корзина, двухшаговое оформление и отправка заказа реализованы.
- Модели эмитят события при изменении состояния с payload.
- View-компоненты кэшируют DOM в конструкторах и генерируют события через EventEmitter.
- Presenter связывает View и Model через события.
- Документация описывает архитектуру MVP, типы, классы и их публичный API.
