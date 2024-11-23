/*********************************************************************************

WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Lyndsey Rasco 
Student ID: 173670233
Date: November 22, 2024
Cyclic Web App URL: https://replit.com/@lyndseytrasco/web322-app
GitHub Repository URL: https://github.com/lynrasco/web322-app.git

********************************************************************************/ 
//REMEMBER TO DEPLOY TO REPLIT INSTEAD OF CYCLIC!!!!!!!!

/*//Instructions for Assignment 03:
Please use Replit instead of Cyclic for deployment.
My github username is markapptist
In this assignment we are using three new npm libraries 'multer', 'cloudinary' and 'stremifier'.
You can use this lecture to help you get started https://webprogrammingtoolsandframeworks.sdds.ca/Working-With-Forms/processing-multipart-form-data
*/
const storeService = require('./store-service');
const express = require('express');
const path = require("path");
//Added for AS3:
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const app = express();
const fs = require('fs');
//Added for AS4:
//const exphbs = require("express-handlebars");
//const { engine } = require("express-handlebars");
const itemData = require("./store-service");
const HTTP_PORT = process.env.PORT || 8080;
//const Handlebars = require("handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set("view engine", ".ejs");
app.set("views", path.join(__dirname, "views"));

function safeHTML(content) {
    // Using a basic HTML escape function, you can improve this for sanitizing HTML.
    return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
app.locals.safeHTML = safeHTML;

cloudinary.config({
    cloud_name: 'dg7zlopsv',
    api_key: '215189235166414',
    api_secret: 'IamOe7ox5NWhMfMAYbx-zynTN9Q',
    secure: true
}); 

/*
const fetchData = () => {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf-8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  };
*/

const fetchData = () => {
    const filePath = path.join(__dirname, 'data', 'items.json');
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          console.error(`Error reading ${filePath}:`, err);
          reject('Error reading items data');
        } else {
          try {
            const items = JSON.parse(data);
            resolve(items);
          } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            reject('Invalid items data');
          }
        }
      });
    });
  };
  

const upload = multer(); // no { storage: storage } since we are not using disk storage

app.post('/items/add', upload.single("featureImage"), (req, res) => {
    if (req.file) {
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            return result;
        }

        upload(req)
            .then((uploaded) => {
                processItem(uploaded.url);
            })
            .catch((error) => {
                console.error("Cloudinary upload error:", error);
                res.status(500).send("Error uploading image");
            });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;

        storeService
            .addItem(req.body)
            .then(() => {
                res.redirect('/shop');
            })
            .catch((error) => {
                console.error("ERROR: Failed to add item:", error);
                res.status(500).send("ERROR: Failed to add item");
            });
    }
});

app.get('/', (req, res) => {
    res.redirect('/shop');
});

app.get('/about', (req, res) => {
    //res.sendFile(path.join(__dirname, '/views/about.html'));
    res.render("about", { title: "About Us" });
});

storeService.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Express http server listening on port ${HTTP_PORT}`);
    });
}).catch(err => {
    console.log(`Error initializing data: ` + err);
});


app.get('/items', async (req, res) => {
    try {
        const data = await fetchData();
        const category = req.query.category; 

        let filteredItems = data;

        if (category) {
            filteredItems = data.filter(item => item.category == category);
        }

        const message = filteredItems && filteredItems.length > 0 
            ? null 
            : "ERROR: No results found for the selected category.";

       
        res.render("items", { items: filteredItems, message });
    } catch (error) {
        console.error("ERROR: in /items route:", error); 
        res.render("items", { items: [], message: "ERROR: Please try again." });
    }
});

app.get('/item/:id', (req, res) => {
    const { id } = req.params;
    storeService.getItemById(Number(id)).then(item => {
        res.json(item);
    }).catch(error => {
        res.status(404).send(error);
    });
})

app.get('/categories', (req, res) => {
   fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
     if (err) {
        return res.render('categories', {message: 'No results'});
     }
     try {
        const categories = JSON.parse(data);
        res.render('categories', { categories: categories, message: ''} );
     } catch (error) {
        res.render('categories', {message: 'Error loading categories'});
     }
   });
});

app.get('/items/category/:category', (req, res) => {
    const category = req.params.category;
    storeService.getPublishedItemsByCategory(category)
        .then(items => {
            if (items.length > 0) {
                res.render('items', { items });
            } else {
                res.render('items', { message: 'No items found in this category' });
            }
        })
        .catch(err => {
            res.status(500).send('Error loading items');
        });
});

app.get("/shop", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
  
    try {
      // declare empty array to hold "item" objects
      let items = [];
  
      // if there's a "category" query, filter the returned items by category
      if (req.query.category) {
        // Obtain the published "item" by category
        items = await itemData.getPublishedItemsByCategory(req.query.category);
        viewData.viewingCategory = req.query.category;
      } else {
        // Obtain the published "items"
        items = await itemData.getPublishedItems();
      }
  
      // sort the published items by itemDate
      items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
  
      // get the latest item from the front of the list (element 0)
      let item = items[0];
  
      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;
      viewData.item = item;
      //viewData.viewingCategory = viewingCategory;
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      // Obtain the full list of "categories"
      let categories = await itemData.getAllCategories();
  
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", { data: viewData, safeHTML});
  });

app.get('/items/add', (req, res) => {
    //res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
    res.render("addItem");
});


app.get('/shop/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};
  
    try{
  
        // declare empty array to hold "item" objects
        let items = [];
  
        // if there's a "category" query, filter the returned items by category
        if(req.query.category){
            // Obtain the published "items" by category
            items = await itemData.getPublishedItemsByCategory(req.query.category);
        }else{
            // Obtain the published "items"
            items = await itemData.getPublishedItems();
        }
  
        // sort the published items by itemDate
        items.sort((a,b) => new Date(b.postDateDate) - new Date(a.postDate));
  
        // store the "items" and "item" data in the viewData object (to be passed to the view)
        viewData.items = items;
  
    }catch(err){
        viewData.message = "no results";
    }
  
    try{
        // Obtain the item by "id"
        viewData.item = await itemData.getItemById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }
  
    try{
        // Obtain the full list of "categories"
        let categories = await itemData.getAllCategories();
  
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", {data: viewData})
  });

app.use((req, res) => {
    res.status(404).send("404: Page Not Found");
});

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
})


