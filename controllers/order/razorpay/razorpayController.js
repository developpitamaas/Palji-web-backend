const Razorpay = require("razorpay");

const keyId = "rzp_test_kjFdwJ1hDcx7Mk";
const keySecret = "RXHspiZCl7e22PXcXk60DfUu";
const CreateRazorpayOrder = async (req, res) => {
  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const options = {
    amount: req.body.amount * 100, 
    currency: "INR",
    receipt: "receipt#1",
    payment_capture: 1,
  };

  try {
    const response = await razorpay.orders.create(options);
    console.log(response);
    res.json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount,
      created_at: response.created_at,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
};
const Getpaymentdetailsbyorderid = async (req, res) => {
  const { paymentId } = req.params;
  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  try {
    const response = await razorpay.payments.fetch(paymentId);
    res.json({ 
      status: response.status,
      method: response.method,
      amount: response.amount,
      currency: response.currency,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
};

module.exports = { CreateRazorpayOrder, Getpaymentdetailsbyorderid };