const axios = require("axios");

// create order on Shiprocket
const createShiprocketOrder = async (orderData) => {
  const url = "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
  };
  try {
    console.log(
      "Sending payload to Shiprocket:",
      JSON.stringify(orderData, null, 2)
    );
    const response = await axios.post(url, orderData, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "Error while creating Shiprocket order:",
      error.response?.data || error.message
    );
    throw new Error("Error while creating Shiprocket order");
  }
}; 

// get all orders

// const getAllOrders = async (req, res) => {
//   const url = "https://apiv2.shiprocket.in/v1/external/orders";
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
//   };

//   try {
//     const response = await axios.get(url, { headers });
// // default status is  - status
//     res.status(200).json({
//       success: true,
//       message: "Shiprocket orders fetched successfully",
//       data: response.data,
//     });
//   } catch (error) {
//     const errorMessage = error.response
//       ? JSON.stringify(error.response.data)
//       : error.message;
//     console.error("Error while fetching Shiprocket orders:", errorMessage);
//     res.status(500).json({
//       success: false,
//       message: "Error while fetching Shiprocket orders",
//       error: errorMessage,
//     });
//   }
// };

const getAllOrders = async (req, res) => {

  const status = req.query.status;
  const url = "https://apiv2.shiprocket.in/v1/external/orders";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
  };

  try {
    const response = await axios.get(url, { headers });
    const newOrders = response.data.data.filter(
      (order) => order.status === status
    );
    res.status(200).json({
      success: true,
      message: "Shiprocket new orders fetched successfully",
      data: newOrders,
    });
  } catch (error) {
    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error("Error while fetching Shiprocket orders:", errorMessage);
    res.status(500).json({
      success: false,
      message: "Error while fetching Shiprocket orders",
      error: errorMessage,
    });
  }
};




const getOrderById = async (req, res) => {
  const orderId = req.params.id;
  const url = `https://apiv2.shiprocket.in/v1/external/orders/show/${orderId}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
  };
  try {
    const response = await axios.get(url, { headers });
    res.status(200).json({
      success: true,
      message: "Shiprocket order fetched successfully",
      data: response.data,
    });
  } catch (error) {
    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error("Error while fetching Shiprocket order:", errorMessage);
    res.status(500).json({
      success: false,
      message: "Error while fetching Shiprocket order",
      error: errorMessage,
    });
  }
};

const cancelOrderById = async (req, res) => { 
  const orderId = req.params.id;  // Get the order ID from the request parameters
  console.log('Canceling order with ID:', orderId);

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Order ID is missing",
    });
  }

  const url = 'https://apiv2.shiprocket.in/v1/external/orders/cancel';
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
  };

  // Format the body with the order IDs (as an array)
  const body = {
    ids: [parseInt(orderId)], 
  };

  try {
    // Send the POST request with the headers and body
    const response = await axios.post(url, body, { headers });
    return res.status(200).json({
      success: true,
      message: "Order canceled successfully",
      data: response.data,
    });
  } catch (error) {
    // Handle error responses properly
    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : error.message;

    console.error("Error while canceling order:", errorMessage);

    return res.status(500).json({
      success: false,
      message: "Error while canceling order",
      error: errorMessage,
    });
  }
};


const getOrdersByUserId = async (req, res) => {
  const userId = req.user.id; // Assuming userId is extracted from authenticated request
  const url = "https://apiv2.shiprocket.in/v1/external/orders";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
  };
  try {
    const response = await axios.get(url, { headers });
    // console.log(response.data.data.others.client_id);
    const userOrders = response.data.data.filter(
      // (order) => { console.log(order.others.client_id, "---", userId , order.others.client_id == userId),  order.others.client_id == userId}
      (order) => order.others.client_id == userId
    );

    res.status(200).json({
      success: true,
      message: "Orders for the logged-in user fetched successfully",
      data: userOrders,
    });
  } catch (error) {
    console.error("Error while fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Error while fetching user orders",
      error: error.message,
    });
  }
};



// Create Shipment for an order
const createShipment = async (req, res) => {
  const orderId = req.params.id;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Order ID is missing",
    });
  }

  const orderDetailsUrl = `https://apiv2.shiprocket.in/v1/external/orders/show/${orderId}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
  };

  try {
    const orderResponse = await axios.get(orderDetailsUrl, { headers });
    const orderData = orderResponse.data.data;
    console.log("Order Data:", orderData);

    // Validate required fields
    if (
      !orderData.customer_address ||
      !orderData.billing_address ||
      !Array.isArray(orderData.products) ||
      !orderData.pickup_address
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing order data",
      });
    }

    // Map orderData to shipmentPayload
    const shipmentPayload = {
      order_id: orderId,
      shipping_address: {
        name: orderData.customer_name,
        address: orderData.customer_address,
        city: orderData.customer_city,
        state: orderData.customer_state,
        country: orderData.customer_country,
        pin_code: orderData.customer_pincode,
        phone: orderData.customer_phone,
      },
      billing_address: {
        name: orderData.billing_name,
        address: orderData.billing_address,
        city: orderData.billing_city,
        state: orderData.billing_state,
        country: orderData.billing_country,
        pin_code: orderData.billing_pincode,
        phone: orderData.billing_phone,
      },
      order_items: orderData.products.map((product) => ({
        name: product.name,
        sku: product.sku,
        units: product.quantity,
        selling_price: product.selling_price,
      })),
      pickup_location: {
        name: orderData.pickup_address.name,
        address: orderData.pickup_address.address,
        city: orderData.pickup_address.city,
        state: orderData.pickup_address.state,
        country: orderData.pickup_address.country,
        pin_code: orderData.pickup_address.pin_code,
        phone: orderData.pickup_address.phone,
      },
      payment_method: "prepaid",
      shipment_type: "standard",
    };

    console.log("Shipment Payload:", shipmentPayload);

    const shipmentUrl = "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup";
    const response = await axios.post(shipmentUrl, shipmentPayload, { headers });

    return res.status(200).json({
      success: true,
      message: "Order shipped successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error while shipping order:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Error while shipping order",
      error: error.response?.data || error.message,
    });
  }
};


module.exports = {
  createShiprocketOrder,
  getAllOrders,
  getOrderById,
  cancelOrderById,
  getOrdersByUserId,
  createShipment
};
