/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Lyndsey Rasco 
Student ID: 173670233
Date: October 6, 2024
Cyclic Web App URL: https://replit.com/@lyndseytrasco/web322-app
GitHub Repository URL: https://github.com/lynrasco/web322-app.git

********************************************************************************/ 
//REMEMBER TO DEPLOY TO REPLIT INSTEAD OF CYCLIC!!!!!!!!1
const storeService = require('./store-service');
const express = require('express');
const path = require("path");
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

/*
app.listen(HTTP_PORT, () => {
    console.log(`Express http server listening on port ${HTTP_PORT}`);
})
*/

storeService.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Express http server listening on port ${HTTP_PORT}`);
    });
}).catch(err => {
    console.log(`Error initializing data: ` + err);
});

app.get('/items', (req, res) => {
    //res.json(storeService.getAllItems());
    storeService.getAllItems()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

app.get('/categories', (req, res) => {
    //res.json(storeService.getAllCategories());
    storeService.getAllCategories()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

app.get('/shop', (req, res) => {
    //const publishedItems = storeService.getAllItems().filter(item => item.published === true);
    //res.json(publishedItems);
    storeService.getPublishedItems()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.status(500).json({ message: err});
        });
});

app.use((req, res) => {
    res.status(404).send("404: Page Not Found");
})