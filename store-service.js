const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, './data/items.json'), 'utf8', (err, data) => {
            if (err) {
                reject("Unable to read file items.json");
                return;
            }
            try {
                items =JSON.parse(data);
            }
            catch (err) {
                reject("Error parsing items.json data");
                return;
            }

            fs.readFile(path.join(__dirname, './data/categories.json'), 'utf8', (err, data) => {
                if (err) {
                    reject("Unable to read file categories.json");
                    return;
                }

                try {
                    categories = JSON.parse(data);
                }
                catch (err) {
                    reject("Error parsing categories.json data");
                    return;
                }
                resolve();
            });
        });
    });
}

//Old getAllItems() function
/*
function getAllItems() {
    return items;
}
*/

function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items);
        }
        else {
            reject("No results returned");
        }
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        }
        else {
            reject("No results returned");
        }
    });
}

//Old getAllCategories() function
/*
function getAllCategories() {
    return categories;
}
*/

function getAllCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        }
        else {
            reject("No results returned");
        }
    });
}

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getAllCategories
    //getCategories
};