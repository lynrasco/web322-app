const fs = require('fs');
const path = require('path');
const itemsFilePath = path.join(__dirname, 'data', 'items.json');

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
                items = JSON.parse(data);
                
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
        if (items.length > 0) {
            const publishedItems = items.filter(item => item.published === true);
            if (publishedItems.length > 0) {
                resolve(publishedItems);
            } else {
                reject("ERROR: No results returned");
            }
        } else {
            reject("ERROR: Items not initialized");
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
        // Create a new item object
        const newItem = {
            ...itemData,  // Merge the incoming item data
            id: items.length + 1,  // Generate a new ID (or use another method to generate unique IDs)
            published: false,  // Default to false, update if needed
            postDate: new Date().toISOString().split('T')[0]  // Set postDate in YYYY-MM-DD format
        };

        // Add the new item to the items array
        items.push(newItem);

        // Save the updated items array back to the items.json file
        fs.writeFile(itemsFilePath, JSON.stringify(items, null, 2), (err) => {
            if (err) {
                reject('ERROR: Failed to save new item');
            } else {
                resolve(newItem);  // Return the newly added item
            }
        });
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
    if (items.length > 0) {
        const item = items.find((item) => item.id === parseInt(id));
        if (item) {
            resolve(item);
        } else {
            reject(`No item found with id: ${id}`);
        }
    } else {
        reject("ERROR: Items not initialized");
    }
   });
}

function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category == category); // Compare as strings or numbers based on your data
        resolve(filteredItems);
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
    getItemById,
    getPublishedItemsByCategory
};