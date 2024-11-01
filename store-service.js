const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, './data/items.json'), 'utf8', (err, data) => {
            if (err) {
                reject("ERROR: Unable to read file items.json");
                return;
            }
            try {
                items =JSON.parse(data);
            }
            catch (err) {
                reject("ERROR: Cannot parse items.json data");
                return;
            }

            fs.readFile(path.join(__dirname, './data/categories.json'), 'utf8', (err, data) => {
                if (err) {
                    reject("ERROR: Unable to read file categories.json");
                    return;
                }

                try {
                    categories = JSON.parse(data);
                }
                catch (err) {
                    reject("ERROR: Cannot parse categories.json data");
                    return;
                }
                resolve();
            });
        });
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items);
        }
        else {
            reject("ERROR: No results returned");
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
            reject("ERROR: No results returned");
        }
    });
}

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

function addItem(itemData) {
    return new Promise((resolve, reject) => {
        try {
            itemData.published = itemData.published === undefined ? false : true;
            itemData.id = items.length + 1; 
            items.push(itemData);
            resolve(itemData);
        } catch (err) {
            reject(err);
        }
    });
}

function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(items => items.category === category);
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        }
        else {
            reject("No results returned");
        }
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        }
        else {
            reject("No results returned");
        }
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        const foundItem = items.find(item => item.id === Number(id));
        if (foundItem) {
            resolve(foundItem);
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
    getAllCategories,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById
};