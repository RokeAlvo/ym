const {addRowToCsv} = require('./addToCsv');
const {mapSeries, filterSeries} = require('async');
const {Builder, By, Key, until} = require('selenium-webdriver');

const URL = 'https://market.yandex.ru/?pcr=65&contentRegion=213';


exports.getProductInfo = function (driver) {
    // helper init
    const selectAll = findAll(driver);
    const select = find(driver);
    // const getAttribute = getAttr(driver);
    // const getText = getTxt(driver);

    return async (productName) => {
        await driver.get(URL);
        const title = await driver.getTitle();
        if (title !== 'Яндекс.Маркет — выбор и покупка товаров из проверенных интернет-магазинов') {
            throw Error('Не удалось загрузить страницу Яндекс.Маркет')
        }

        //выборка из карточек с товаром
        const searchInput = await driver.wait(until.elementLocated(By.css('#header-search')), 20000);
        searchInput.sendKeys(productName + Key.ENTER);
        await driver.wait(until.elementLocated(By.css('.n-snippet-list')), 20000);
        const productCardsSnippet = await selectAll('.n-snippet-card2 .n-snippet-card2__title a');
        const productCardsCell = await selectAll('.n-snippet-cell2 .n-snippet-cell2__title a');
        const productCards = productCardsSnippet.concat(productCardsCell);
        const filteredCards = await filterSeries(productCards, async card => {
            const name = await card.getText();

            return ~name.toLowerCase().indexOf(productName.toLowerCase());
        });
        if (filteredCards.length === 0) {
            addRowToCsv(productName);
            return []
        }
        const productLink = await filteredCards[0].getAttribute('href');

        //Получение ссылки на страницу товара
        let allProductHref;
        await driver.get(productLink);
        try {
            const allProductLink = await select('.n-product-tabs__item_name_offers a');
             allProductHref = await allProductLink.getAttribute('href');
        } catch (e) {
            addRowToCsv(productName + ';;' + 'не удалось получить ссылку на товар ' + productLink + ' err: ' + e);
            return []
        }

        // Получение данных о товаре
        let cardElements;
        await driver.get(allProductHref + '&how=aprice');
        // const linkToSort = await driver.findElement(By.css('.n-filter-sorter a'));
        // await linkToSort.click();
        try {
           cardElements = await selectAll('.n-snippet-card');
        } catch (e) {
            addRowToCsv(productName + ';;' + 'не удалось получить карточки продавцов ' + ' err: ' + e)
        }
        const productsInfo = await mapSeries(cardElements, async card => {
            let data;
            try {
                const dataString = await card.getAttribute('data-bem');
                data = parseData(dataString);
            } catch (e) {
                data.price = null;
                data.description = 'не удалось получить цену ' + ' err: ' + e
            }
            try {
                const offerElement = await card.findElement(By.css('.n-snippet-card__shop-primary-info  a'));
                data.url = await offerElement.getAttribute('href');
            } catch (e) {
                data.url = ''
                data.description = description + '   не удалось получить ссылку на магазин err: ' + e
            }
            // const elemWithTitle = await offerElement.findElement(By.css(''))
            // data.offerName = await offerElement.getAttribute('title');
            return data
        });
        productsInfo.forEach(data => {
            addRowToCsv(productName + ';' + data.price + ';' + data.url)
        });
        return productsInfo
    }
};
//FIXME
// (async function () {
//     const driver = await new Builder().forBrowser('chrome').build();
//     try{
//         const getProductPage = await getProductInfo(driver);
//         const res =await getProductPage('Haier AS12CB3HRA')
//     }finally {
//         driver.quit()
//     }
//     // const data = '{"shop-history":{"offer-id":"sur-FpZwIOEIWCFmqaqA5w","currency":"RUR","gate":"","isRecommended":"","clickParams":{"event":"clickout","goodid":"sur-FpZwIOEIWCFmqaqA5w","goodbrand":240936,"productid":"","store":37896,"price":"77300","categoryId":90578}},"n-snippet-card":{"type":"offer","clickActionType":"details"},"b-zone":{"name":"snippet-card","data":{"isCpa20":false,"id":"sur-FpZwIOEIWCFmqaqA5w","isAutoCalculatedDelivery":false}}}\n'
//     // const parse = parseData(data);
//     console.log('ok')
//
// })();
/**
 * return function for search all elements from css-selector on page
 * @param driver
 * @returns {function(*=)}
 */
function findAll(driver) {
    return async (selector) =>
        await driver.findElements(By.css(selector));
}

function find(driver) {
    return async (selector) => await driver.findElement(By.css(selector))
}

function getAttr(driver) {
    return async function ({selector, attrName}) {
        const elem = await driver.select(selector);
        return elem.getAttribute(attrName)
    }
}

function getTxt(driver) {
    return async function (selector) {
        const elem = await driver.select(selector);
        return elem.getText()
    }
}

function parseData(data) {
    const dataJson = JSON.parse(data);
    return {
        price: +dataJson['shop-history'].clickParams.price,
        currency: dataJson['shop-history'].currency,
        offerName: '',
        url: '',
        description: ''
    }
}
