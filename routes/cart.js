const Data = require("../controllers/order/cart");
const express = require("express");
const Cart = express.Router();
const auth = require("../middleware/Auth");

// get cart
Cart.route("/my-cart").get(auth.IsAuthenticateUser, Data.GetCart);
Cart.route("/apply-coupon").post(auth.IsAuthenticateUser,Data.ApplyCoupon);

// RemoveCoupon
Cart.route("/remove-coupon").post(auth.IsAuthenticateUser, Data.RemoveCoupon);

// add to cart
Cart.route("/add-to-cart").post(auth.IsAuthenticateUser, Data.addToCart);

// remove from cart
Cart.route("/remove-from-cart").post(
  auth.IsAuthenticateUser,
  Data.RemoveFromCart
);
// DeleteProductFromCart
Cart.route("/delete-product-from-cart").post(
  auth.IsAuthenticateUser,
  Data.DeleteProductFromCart
); 
 
// updateCartTotalPriceAndDeliveryCharges
Cart.route("/update-cart-data").put(auth.IsAuthenticateUser, Data.updateCartTotalPriceAndDeliveryCharges)

// exports
module.exports = Cart;
