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
// const createShipment = async (req, res) => {
//   const orderId = req.params.id;

//   if (!orderId) {
//     return res.status(400).json({
//       success: false,
//       message: "Order ID is missing",
//     });
//   }

//   const orderDetailsUrl = `https://apiv2.shiprocket.in/v1/external/orders/show/${orderId}`;
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
//   };

//   try {
//     // Step 1: Fetch Order Details
//     const orderResponse = await axios.get(orderDetailsUrl, { headers });
//     const orderData = orderResponse.data.data;

//     // Step 2: Assign AWB to the Shipment
//     const awbAssignUrl = "https://apiv2.shiprocket.in/v1/external/courier/assign/awb";
//     const awbPayload = {
//       shipment_id: orderData.shipments.id, // Use the shipment ID from the order data
//       courier_id: 58, // Replace with the desired courier ID (optional)
//     }; 

//     const awbResponse = await axios.post(awbAssignUrl, awbPayload, { headers });
//     console.log("AWB Assign Response:", awbResponse.data);
//     console.log("--------2",awbResponse.data.response.data.shipment_id);

//     // Check if AWB assignment was successful
//     if (awbResponse.data.awb_assign_status === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Failed to assign AWB",
//         error: awbResponse.data.response.data.awb_assign_error || "Insufficient funds or other error",
//       });
//     }

//     const shipmentId = awbResponse.data.response.data.shipment_id; // Extract shipment ID from the response
// console.log("--------3-------",shipmentId);
//     // Step 3: Generate Pickup Request
//     const pickupUrl = "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup";
//     const pickupPayload = {
//       shipment_id: shipmentId, // Use the shipment ID from the AWB assign response
//     };

//     const pickupResponse = await axios.post(pickupUrl, pickupPayload, { headers });
//     console.log("Pickup Response:", pickupResponse.data);

//     return res.status(200).json({
//       success: true,
//       message: "Shipment created and pickup requested successfully",
//       data: {
//         awbAssignResponse: awbResponse.data,
//         pickupResponse: pickupResponse.data,
//       },
//     });
//   } catch (error) {
//     console.error("Error while creating shipment:", error.response?.data || error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Error while creating shipment",
//       error: error.response?.data || error.message,
//     });
//   }
// };

const checkServiceability = async (req, res) => {
  // Extract parameters from the query string
  const { pickup_postcode, delivery_postcode, weight, cod, order_id } = req.query; 
  console.log(req.query);

  // Validation to check if required parameters are missing
  if (!pickup_postcode || !delivery_postcode || !weight) {
    return res.status(400).json({
      success: false,
      message: "Missing required parameters: pickup_postcode, delivery_postcode, or weight",
    });
  }

  const serviceabilityUrl = "https://apiv2.shiprocket.in/v1/external/courier/serviceability";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
  };

  // Parameters to be sent to ShipRocket API
  const payload = {
    pickup_postcode,
    delivery_postcode,
    weight,
    cod: cod || "0", // Default to "0" if cod is not provided
    order_id: order_id || "", // Optional order ID
  };

  try {
    // Sending a GET request to ShipRocket API with query params
    const response = await axios.get(serviceabilityUrl, {
      headers,
      params: payload, // This will send data as query parameters
    });

    return res.status(200).json({
      success: true,
      message: "Serviceability check successful",
      data: response.data,
    });
  } catch (error) {
    console.error("Error checking serviceability:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Error checking serviceability",
      error: error.response?.data || error.message,
    });
  }
};


const createShipment = async (req, res) => {
  const orderId = req.params.id;
  const courierId = req.params.courierId;

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
    // Step 1: Fetch Order Details
    const orderResponse = await axios.get(orderDetailsUrl, { headers });
    const orderData = orderResponse.data.data;

    // Step 2: Assign AWB to the Shipment
    const awbAssignUrl = "https://apiv2.shiprocket.in/v1/external/courier/assign/awb";
    const awbPayload = {
      shipment_id: orderData.shipments.id, // Use the shipment ID from the order data
      courier_id: 58, // Replace with the desired courier ID (optional)
    };

    const awbResponse = await axios.post(awbAssignUrl, awbPayload, { headers });
    console.log("AWB Assign Response:", awbResponse.data);
    console.log("--------2", awbResponse.data.response.data.shipment_id);

    // Check if AWB assignment was successful
    if (awbResponse.data.awb_assign_status === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to assign AWB",
        error: awbResponse.data.response.data.awb_assign_error || "Insufficient funds or other error",
      });
    }

    const shipmentId = awbResponse.data.response.data.shipment_id; // Extract shipment ID from the response
    console.log("--------3-------", shipmentId);

    // Step 3: Generate Pickup Request
    const pickupUrl = "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup";
    const pickupPayload = {
      shipment_id: shipmentId, // Use the shipment ID from the AWB assign response
    };

    const pickupResponse = await axios.post(pickupUrl, pickupPayload, { headers });
    console.log("Pickup Response:", pickupResponse.data);

    return res.status(200).json({
      success: true,
      message: "Shipment created and pickup requested successfully",
      data: {
        awbAssignResponse: awbResponse.data,
        pickupResponse: pickupResponse.data,
      },
    });
  } catch (error) {
    console.error("Error while creating shipment:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Error while creating shipment",
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
  createShipment,
  checkServiceability
};
