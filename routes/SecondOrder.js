const express = require("express");
const SecondOrder = express.Router();
const Data = require("../controllers/order/secondOrder");
const ShiprocketData = require("../controllers/order/shiprocket/shiprocket");
const Auth = require("../middleware/Auth");
const RazorpayData = require("../controllers/order/razorpay/razorpayController");


SecondOrder.route("/create-second-order").post(Auth.IsAuthenticateUser, Data.CreateSecondOrder)
SecondOrder.route("/create-razorpay-order").post(RazorpayData.CreateRazorpayOrder) 

SecondOrder.route("/get-my-second-order").get(Auth.IsAuthenticateUser,Data.GetMySecondOrder)
SecondOrder.route("/get-second-order-by-id/:id").get(Auth.IsAuthenticateUser,Data.GetSecondOrderById)
SecondOrder.route("/get-second-order-by-id-shiprocket-id/:id").get(Auth.IsAuthenticateUser,Data.GetSecondOrderByShiprocketId)
SecondOrder.route("/get-all-second-order").get(Auth.IsAuthenticateUser,Data.GetAllsecondOrders)
SecondOrder.route("/update-second-order-by-id/:id").put(Auth.IsAuthenticateUser,Data.UpdateSecondOrder)


// for admin
SecondOrder.route("/get-user-details-by-id/:id").get( Auth.IsAuthenticateUser,Data.getUserDetailsById)



// shiprocket
SecondOrder.route("/shiprocket/get-all-orders").get( ShiprocketData.getAllOrders);
SecondOrder.route("/shiprocket/get-order-by-id/:id").get(ShiprocketData.getOrderById);
SecondOrder.route("/shiprocket/cancel-order-by-id/:id").post(ShiprocketData.cancelOrderById);







// module.exports
module.exports = SecondOrder