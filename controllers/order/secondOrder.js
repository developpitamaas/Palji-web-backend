const SecondorderSchema = require("../../model/order/orders");
const Productsize = require("../../model/Product/productsize");
const ShipAddress = require("../../model/order/shipedaddress");
const ShiprocketData = require("../order/shiprocket/shiprocket");
const TryCatch = require("../../middleware/Trycatch");
const Mail = require("../../utils/sendmail");
const Cart = require("../../model/order/cart");
const Product = require("../../model/Product/product");
const ApiFeatures = require("../../utils/apifeature");
const RazorpayData = require("../order/razorpay/razorpayController");
const User = require("../../model/User/users");
const Trycatch = require("../../middleware/Trycatch");

// get user all details by id
const getUserDetailsById = Trycatch(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  const data = await SecondorderSchema.find({ userId: req.params.id })
    // .populate("CartId")
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.productId",
        model: "product",
      },
    })
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.size",
        select: "size sizetype",
      },
    })
    .populate("shippingAddress")
    .populate("billingAddress")
    .populate("userId");

  const secondorders = data.reverse();

  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    total: secondorders.length,
    secondorders,
    user,
  });
});

const CreateSecondOrder = TryCatch(async (req, res, next) => {
  const userId = req.user.id;

  const {
    CartId,
    paymentMethod,
    paymentId,
    paymentorderCratedAt,
    currency,
    paymentDoneAt,
    DeviceType,
  } = req.body;

  // Create the second order
  const secondorder = await SecondorderSchema.create({
    ...req.body,
    userId,
    CartId: CartId,
    isPaid: paymentMethod === "Razorpay",
    paymentId: paymentId || null,
    paymentorderCratedAt: paymentorderCratedAt,
    currency: currency,
    paymentDoneAt,
    DeviceType,
  });

  const userAddress = await ShipAddress.findById(secondorder.shippingAddress);

  // Extract order items from the cart
  const cart = await Cart.findById(CartId)
    .populate("orderItems.productId")
    .populate("orderItems.size")
    .populate("orderItems.productId.category");

  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  // Clear the complete cart
  await Cart.findByIdAndUpdate(CartId, { activecart: "false" });

  // Send mail
  const userEmail = req.user.email;
  const orderDetails = generateOrderDetails(cart, secondorder, userAddress);
  const orderTotal = calculateOrderTotal(cart);

  Mail(
    req.user.email,
    "Order Placed Successfully",
    `${orderDetails}`,
    (isHTML = true)
  );

  const calculateTotalDimensions = (orderItems) => {
    let totalHeight = 0;
    let totalWidth = 0;
    let totalLength = 0;

    orderItems.forEach((item) => {
      const size = item.size;
      const itemHeight = parseFloat(size.height) || 0;
      const itemWidth = parseFloat(size.width) || 0;
      const itemLength = parseFloat(size.length) || 0;

      totalHeight += itemHeight * item.quantity;
      totalWidth += itemWidth * item.quantity;
      totalLength += itemLength * item.quantity;
    });

    return {
      totalHeight,
      totalWidth,
      totalLength,
    };
  };

  const { totalHeight, totalWidth, totalLength } = calculateTotalDimensions(
    cart.orderItems
  );

  // Function to convert size to kilograms
  const convertToKg = (size, sizeType) => {
    // Convert sizeType to lowercase for case-insensitive comparison
    sizeType = sizeType.toLowerCase();

    if (sizeType === "kg") {
      return parseFloat(size); // Already in kilograms
    } else if (sizeType === "gram") {
      return parseFloat(size) / 1000; // Convert grams to kilograms
    } else if (sizeType === "liter") {
      return parseFloat(size); // Assume 1 liter = 1 kg (for water-like substances)
    } else if (sizeType === "ml") {
      return parseFloat(size) / 1000; // Convert milliliters to liters, then to kilograms
    } else if (sizeType === "pound") {
      return parseFloat(size) * 0.453592; // Convert pounds to kilograms
    } else if (sizeType === "meter") {
      return parseFloat(size); // Assume 1 meter = 1 kg (for simplicity, adjust as needed)
    } else {
      return parseFloat(size); // Default to size if no conversion is needed
    }
  };

  // Function to calculate total weight dynamically
  const calculateTotalWeight = (orderItems) => {
    let totalWeight = 0;

    orderItems.forEach((item) => {
      const size = item.size;
      const sizeType = size.sizetype; // Ensure this is the correct property name
      const itemWeight = parseFloat(size.size) || 0; // Ensure weight is a number

      if (isNaN(itemWeight)) {
        console.error("Invalid weight for item:", item);
        return; // Skip this item if weight is invalid
      }

      // Convert weight to kilograms if necessary
      totalWeight += convertToKg(itemWeight, sizeType) * item.quantity;
    });

    console.log("Total Weight Calculated:", totalWeight);
    return totalWeight;
  };

  const totalWeight = calculateTotalWeight(cart.orderItems) || 0.1; // Default to 0.1 kg if weight is missing

  // Prepare payload for Shiprocket
  const shiprocketPayload = {
    order_id: secondorder._id.toString(),
    order_date: new Date().toISOString(),
    pickup_location: "Primary",
    channel_id: "4903096",
    billing_customer_name: req.user.firstName,
    billing_last_name: req.user.lastName,
    client_id: req.user._id.toString(),
    user_id: req.user._id.toString(),
    billing_email: req.user.email,
    billing_address: userAddress.address,
    billing_city: userAddress.city,
    billing_pincode: userAddress.pincode,
    billing_state: userAddress.state,
    billing_country: userAddress.country,
    billing_phone: userAddress.phonenumber,
    shipping_is_billing: true,
    shipping_customer_name: req.user.firstName,
    shipping_last_name: req.user.lastName,
    shipping_address: userAddress.address,
    shipping_city: userAddress.city,
    shipping_pincode: userAddress.pincode,
    shipping_state: userAddress.state,
    shipping_country: userAddress.country,
    transaction_id: secondorder.paymentId,
    shipping_phone: userAddress.phonenumber,
    order_items: cart.orderItems.map((item, index) => ({
      sku: `SKU_${item.productId._id}_${index}`,
      name: item.productId.name,
      category: item.productId.category.toString(),
      units: item.quantity,
      selling_price: item.singleProductPrice,
      discount: 0,
      tax: 0,
      product_id: item.productId._id.toString(),
      product_image: item.productId.thumbnail,
      size: item.size.size, // Use the actual size value (e.g., "100")
      height: item.size.height,
      width: item.size.width,
      length: item.size.length,
      weight: item.size.weight, // Include weight here
    })),
    payment_method: paymentMethod === "Razorpay" ? "Prepaid" : "COD",
    sub_total: cart.totalPrice,
    shipping_charges: 0,
    length: totalLength,
    breadth: totalWidth,
    height: totalHeight,
    weight: totalWeight, // Ensure this is a valid number
  };

  console.log("shiprocketPayload", shiprocketPayload);

  // Send payload to Shiprocket
  const shiprocketResponse = await ShiprocketData.createShiprocketOrder(
    shiprocketPayload
  );

  if (shiprocketResponse.error) {
    throw new Error(
      shiprocketResponse.message || "Failed to create order on Shiprocket"
    );
  }

  // Update second order with Shiprocket details
  secondorder.shiprocketOrderId = shiprocketResponse.order_id;
  secondorder.shiprocketshipmentId = shiprocketResponse.shipment_id;
  secondorder.shiprocketchannelOrderId = shiprocketResponse.channel_order_id;
  await secondorder.save();

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    secondorder,
    paymentMethod,
    paymentId,
  });
});
const CreateSecondOrderforselfDelivery = TryCatch(async (req, res, next) => {
  const userId = req.user.id;
  const {
    CartId,
    paymentMethod,
    paymentId,
    paymentorderCratedAt,
    currency,
    paymentDoneAt,
    DeviceType,
  } = req.body;

  // Create the second order
  const secondorder = await SecondorderSchema.create({
    ...req.body,
    userId,
    CartId: CartId,
    // payment details
    isPaid: paymentMethod === "Razorpay",
    paymentId: paymentId || null,
    paymentorderCratedAt: paymentorderCratedAt,
    currency: currency,
    paymentDoneAt,
    DeviceType,
  });

  const userAddress = await ShipAddress.findById(secondorder.shippingAddress);

  // Extract order items from the cart
  const cart = await Cart.findById(CartId)
    .populate("orderItems.productId")
    .populate("orderItems.size")
    .populate("orderItems.productId.category");

  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  // Clear the complete cart
  await Cart.findByIdAndUpdate(CartId, { activecart: "false" });

  // Send mail
  const userEmail = req.user.email;
  const orderDetails = generateOrderDetails(cart, secondorder, userAddress);
  const orderTotal = calculateOrderTotal(cart);

  Mail(
    req.user.email,
    "Order Placed Successfully",
    `${orderDetails}`,
    (isHTML = true)
  );

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    secondorder,
    paymentMethod,
    paymentId,
  });
});

function generateOrderDetails(cart, secondorder, UserAdress) {
  const logoUrl =
    "https://paliji-admin.vercel.app/static/media/logo.749613bd9100ee0b9f00.png";
  const shopName = "Palji Bakery";
  const primaryColor = "#d92587";
  const backgroundColor = "#f6f6f6";
  const textColor = "#333";
  const totalQuantity = cart.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalDiscount = cart.totalPriceWithoutDiscount - cart.totalPrice;

  let orderItemsHtml = cart.orderItems
    .map(
      (item) => `
        <div style="display: flex; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 20px;">
          <div style="flex: 1; text-align: center;">
            <img src="${item.productId.thumbnail}" alt="${item.productId.name}" style="max-width: 80px; border-radius: 8px;">
          </div>
          <div style="flex: 3; padding-left: 20px;">
            <h3 style="margin: 0; color: ${textColor};">${item.productId.name}</h3>
            <p style="margin: 5px 0; color: #777;">Quantity: ${item.quantity}</p>
            <p style="margin: 5px 0; color: #777;">Price: ₹${item.singleProductPrice}</p>
            <p style="margin: 5px 0; color: #777;">A delightful treat from Palji Bakery.</p>
          </div>
        </div>
      `
    )
    .join("");

  let couponHtml = cart.coupancode
    ? `
      <div style="background-color: #f9f9f9; padding: 10px; border-radius: 8px;">
        <h3 style="color: ${textColor};">Coupon Code Applied:</h3>
        <p style="color: #777;">${cart.coupancode} - Discount: ₹${cart.couponDiscount}</p>
      </div>`
    : "";

  let totalHtml = `
    <div style="background-color: #f9f9f9; padding: 10px; border-radius: 8px;">
      <h3 style="color: ${textColor};">Order Summary</h3>
      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding:0px 10px; width: 100%; ">
          <div style="color: #777; width: 100%; ">Subtotal:</div>
          <div style="color: #777; width: 30%; ">₹${
            cart.totalPriceWithoutDiscount
          }</div>
        </div>

        ${
          totalDiscount > 0
            ? `<div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 0px 10px; width: 100%;">
                <div style="color: #777; width: 100%; ">Total Discount:</div>
                <div style="color: #777; width: 30%; ">₹${totalDiscount}</div>
              </div>`
            : ""
        }
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 0px 10px; width: 100%;  ">
          <div style="font-weight: bold; color: ${textColor}; width: 100%; ">Total:</div>
          <div style="font-weight: bold; color: ${textColor}; width: 30%; ">₹${
    cart.totalPrice
  }</div>
        </div>
      </div>
    </div>`;

  let shippingAddressHtml = `
    <div style="margin-top: 20px;">
      <h3 style="color: ${textColor};">Shipping Address</h3>
      <p style="color: #777;">${UserAdress.firstname} ${UserAdress.lastname}</p>
<p style="color: #777;">${UserAdress.address}</p>
<p style="color: #777;">${UserAdress.city} ${UserAdress.state}  </p>
<p style="color: #777;">${UserAdress.pincode}</p>

    </div>`;

  let paymentMethodHtml = `
    <div style="margin-top: 20px;">
      <h3 style="color: ${textColor};">Payment Method</h3>
      <p style="color: #777;">${secondorder.paymentMethod}</p>
    </div>`;

  let detailsHtml = `
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: ${backgroundColor};">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="${shopName}" style="max-width: 180px; margin-bottom: 15px;">
          <h1 style="color: ${primaryColor};">${shopName}</h1>
          <p style="color: #666;">Collection of Best Taste</p>
        </div>
        <hr style="border: none; height: 2px; background-color: ${primaryColor};">
        <h2 style="color: #666;">Order Confirmation</h2>
        <p>Thank you for your order! We're excited to bake some delicious treats for you.</p>
        
        ${orderItemsHtml}
        
        ${couponHtml}
        
        ${totalHtml}

        ${shippingAddressHtml}

        ${paymentMethodHtml}

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: ${primaryColor};">Thank you for shopping with us!</p>
          <a href="#" style="display: inline-block; background-color: ${primaryColor}; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Track Your Order</a>
        </div>
      </div>
    </body>
  `;

  return detailsHtml;
}

function calculateOrderTotal(cart) {
  return cart.orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

function calculateOrderTotal(cart) {
  let total = 0;
  cart.orderItems.forEach((item) => {
    total += item.totalPrice;
  });
  return total;
}

// get my second order
const GetMySecondOrder = TryCatch(async (req, res, next) => {
  const data = await SecondorderSchema.find({ userId: req.user.id })
    // .populate("CartId")
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.productId",
        model: "product",
      },
    })
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.size",
        select: "size sizetype",
      },
    })
    .populate("shippingAddress")
    .populate("billingAddress")
    .populate("userId");

  const secondorders = data.reverse();

  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    total: secondorders.length,
    secondorders,
  });
});

// get second order by id
const GetSecondOrderById = TryCatch(async (req, res, next) => {


  const secondorder = await SecondorderSchema.findById(req.params.id)
    .populate("CartId")
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.productId",
        model: "product",
      },
    })
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.size",
        select: "size sizetype",
      },
    })
    .populate("shippingAddress")
    .populate("billingAddress")
    .populate("userId");


  res.status(200).json({
    success: true,
    message: "Order fetched successfully vaibhaknknknknk",
    secondorder,
  });
});
const GetSecondOrderByShiprocketId = TryCatch(async (req, res, next) => {
  const secondorder = await SecondorderSchema.findOne({
    shiprocketOrderId: req.params.id,
  })
    .populate("CartId")
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.productId",
        model: "product",
      },
    })
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.size",
        select: "size sizetype",
      },
    })
    .populate("shippingAddress")
    .populate("billingAddress")
    .populate("userId");

  res.status(200).json({
    success: true,
    message: "Order fetched successfully vaibhaknknknknk",
    secondorder,
  });
});

// get all orders
const GetAllsecondOrders = TryCatch(async (req, res, next) => {
  const status = req.query.status || "Pending";
  const resultperpage = req.query.resultperpage || 10000;
  // Initialize ApiFeatures with the Order model query and the query string from the request
  const features = new ApiFeatures(SecondorderSchema.find(), req.query)
    // Apply search functionality if 'name' is provided in the query string
    .search()
    .filterByStatus(status)
    // Apply pagination with default limit of 10 items per page
    .paginate(resultperpage);

  // Execute the query with applied features
  const ALlOrders = await features.query
    // Populate necessary fields
    .populate("CartId")
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.productId",
        model: "product",
      },
    })
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.size",
        select: "size sizetype",
      },
    })
    .populate("shippingAddress")
    .populate("billingAddress")
    .populate("userId");

  const Orders = ALlOrders.reverse();

  // Send response
  res.status(200).json({
    success: true,
    count: Orders.length,
    Orders,
  });
});

// update order
const UpdateSecondOrder = TryCatch(async (req, res, next) => {
  // req.body.UpdateAt = Date.now();
  const secondorder = await SecondorderSchema.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  // UpdateAt
  res.status(200).json({
    success: true,
    message: "Order updated successfully",
    secondorder,
  });
});

// exports
module.exports = {
  CreateSecondOrder,
  GetMySecondOrder,
  GetSecondOrderById,
  GetAllsecondOrders,
  UpdateSecondOrder,
  GetSecondOrderByShiprocketId,
  getUserDetailsById,
  CreateSecondOrderforselfDelivery
  // CreateRazorpayOrder: RazorpayData.CreateRazorpayOrder,
  // Getpaymentdetailsbyorderid: RazorpayData.Getpaymentdetailsbyorderid,
};
