const express = require("express");
const cors = require("cors");
const User = require("./routes/user"); 
const Product = require("./routes/product");
const Category = require("./routes/category");
const Address = require("./routes/address");
const Admin = require("./routes/admin");
const Coupan = require("./routes/Coupan");   
const Wishlist = require("./routes/Wishlist");   
const Message = require("./routes/usermessage");        
const Subscribe = require("./routes/subscribe");   
const Cart = require("./routes/cart");
const Pincode = require("./routes/pincode");
const SecondOrder = require("./routes/SecondOrder"); 
const cookieParser = require("cookie-parser");
const { checkAndUpdateToken } = require("./utils/tokenUtils");
const cron = require('node-cron');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(
  "/api",
  User,
  Product,
  Category,
  Address,
  Admin,
  Wishlist,
  Coupan,
  Message,
  Subscribe,
  Cart,
  Pincode,
  SecondOrder
);

// Scheduled token check every 6 hours
cron.schedule('0 */6 * * *', async () => {
    console.log('Running scheduled token check...');
    try {
        await checkAndUpdateToken();
        console.log('Token check completed successfully');
    } catch (error) {
        console.error('Error during scheduled token check:', error.message);
    }
});

// Default route
app.get("/", (req, res) => {
  res.send("Hello World!, Server is running");
});

module.exports = app;