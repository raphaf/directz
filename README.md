
### Map your REST routes from your services folder and file structure.

Create a empty node project.

```bash
mkdir myapp && cd myapp
```

Install 

```bash
npm init
npm install express cookie-parser directz
```
Create the following folder and file structure inside your project folder:
```
services
|   products.js

```

In the products.js file past the following code:

```javascript
module.exports.find = function () {
  return [
    { name: "iPhone X" }, 
    { name: "Samsung S8" }, 
    { name: "Xiaomi MI 8" }
  ];
};
```

And finally, the index.js file:

```javascript 
const { connect } = require("directz");
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;
const dir = `${process.env.PWD}/services`;
const createRouter = express.Router; 

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// create REST routes from your directory and files
connect({ app, dir, createRouter });

app.listen(port, () => console.log(`listening on port ${port}!`));
```

Run your app
```bash
node index.js
```

Access your app

```bash
http://localhost:3000/products
```

#### Mapping actions to products.js, for instance:

```
GET /products >>> find
GET /products/ >>> find

GET /products/:id >>> findOne

POST /products >>> insert

PUT /products/:id >>> update
PATCH /products/:id >>> update

POST /products >>> save
PUT /products/:id >>> save
PATCH /products/:id >>> save

DELETE /products/:id >>> remove
```