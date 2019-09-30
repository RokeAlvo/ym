// import "reflect-metadata";
// import {createConnection} from "typeorm";
const {getDesiredProductsFromFile} = require( "./getDesiredProductsFromFile");
// import {getDesiredProductsFromFile} from "./getDesiredProductsFromFile";
const filename = 'input-conditioner';
const {mapSeries,filterSeries} = require( 'async');
const {getProductInfo} =require( "./getProductInfo");
const {Builder, By, Key, until} = require('selenium-webdriver');
const {addToCsv} = require('./addToCsv');
const fs = require('fs').promises;
const file='output.csv';




(async function main() {
    const desiredProducts = await getDesiredProductsFromFile(filename);
    // const db = await createConnection();
    const driver = await new Builder().forBrowser('chrome').build();
    const results = await mapSeries(desiredProducts, getProductInfo(driver));

})();


// createConnection().then(async connection => {
//
//     console.log("Inserting a new user into the database...");
//     const user = new User();
//     user.firstName = "Timber";
//     user.lastName = "Saw";
//     user.age = 25;
//     await connection.manager.save(user);
//     console.log("Saved a new user with id: " + user.id);
//
//     console.log("Loading users from the database...");
//     const users = await connection.manager.find(User);
//     console.log("Loaded users: ", users);
//
//     console.log("Here you can setup and run express/koa/any other framework.");
//
// }).catch(error => console.log(error));
