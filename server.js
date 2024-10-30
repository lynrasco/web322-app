/*********************************************************************************

WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Lyndsey Rasco 
Student ID: 173670233
Date: October 28, 2024
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

const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dg7zlopsv',
    api_key: '215189235166414',
    api_secret: 'IamOe7ox5NWhMfMAYbx-zynTN9Q',
    secure: true
});

const upload = multer(); // no { storage: storage } since we are not using disk storage

app.post('/items/add', upload.single("featureImage"), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
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
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processItem(uploaded.url);
        });
    }else{
        processItem("");
    }
     
    function processItem(imageUrl){
        req.body.featureImage = imageUrl;
    
        // TODO: Process the req.body and add it as a new Item before redirecting to /items
        storeService.addItem(req.body).then(() => {
            res.redirect('/items');
        }).catch((error) => {
            console.error('ERROR: Failed to add item:', error);
            res.status(500).send('ERROR: Failed to add item:');
        });
    }     
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

storeService.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Express http server listening on port ${HTTP_PORT}`);
    });
}).catch(err => {
    console.log(`Error initializing data: ` + err);
});


app.get('/items', (req, res) => {
    const { category, minDate } = req.query;
    if (category) {
        storeService.getItemsByCategory(Number(category)).then(items => {
            res.json(items);
        }).catch(error => {
            res.status(404).send(error);
        });
    }
    else if (minDate) {
        storeService.getItemsByMinDate(minDate).then(items => {
            res.json(items)
        }).catch(error => {
            res.status(404).send(error);
        });
    }
    else {
        res.json(storeService.getAllItems());
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
    storeService.getAllCategories()
        .then((data) => {
            res.json(data);
        })
        .catch(error => {
            res.status(404).send(error);
        });
});

app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.status(500).json(`${err.message}`);
        });
});

app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
});

app.use((req, res) => {
    res.status(404).send("404: Page Not Found");
});