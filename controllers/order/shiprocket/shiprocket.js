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

const getAllOrders = async (req, res) => {
  const url = "https://apiv2.shiprocket.in/v1/external/orders";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
  };

  try {
    const response = await axios.get(url, { headers });

    res.status(200).json({
      success: true,
      message: "Shiprocket orders fetched successfully",
      data: response.data,
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
// Cancel an order on Shiprocket
const cancelOrderById = async (req, res) => {
  const orderId = req.params.id;
  const url = `https://apiv2.shiprocket.in/v1/external/orders/cancel/${orderId}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
  };

  try {
    const response = await axios.delete(url, { headers });
    res.status(200).json({
      success: true,
      message: "Order canceled successfully",
      data: response.data,
    });
  } catch (error) {
    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error("Error while canceling order:", errorMessage);
    res.status(500).json({
      success: false,
      message: "Error while canceling order",
      error: errorMessage,
    });
  }
};

module.exports = { createShiprocketOrder, getAllOrders, getOrderById, cancelOrderById };
 