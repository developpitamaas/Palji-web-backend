const mongoose = require("mongoose");

const SecondorderSchema = new mongoose.Schema(
  {
    // Personal Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      unique: true,
    },
    CartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    pincode: {
      type: String,
    },
    // Address Information
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shipedaddress",
    },
    billingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "billingaddress",
    },

    // Order Status
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      default: "Pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },

    // shiprocket Details
    shiprocketOrderId: {
      type: String,
    },
    shiprocketshipmentId: {
      type: String,
    },
    shiprocketchannelOrderId: {
      type: String,
    },

    // Payment Details
    transactionId: {
      type: String,
    },
    paymentGatewayResponse: {
      type: Object,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentIntent: {
      type: String,
    },
    paymentMethod: {
      type: String,
      required: true,
      default: "Cash On Delivery",
      enum: ["Cash On Delivery", "Razorpay"],
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },

    UserContact: {
      type: String,
    },
    paymentId: {
      type: String,
      default: null,
    },
    paymentConfirmation: {
      type: Boolean,
      default: false,
    },
    paymentorderCratedAt: {
      type: String,
    },
    paymentDoneAt: {
      type: Date,
    },
    orderfromURL: {
      type: String,
    },
    priceaftertax: {
      type: String,
    },
    taxprice:{
      type: String,
    },
    // Other Information
    trackingNumber: {
      type: String,
    },
     orderNotes: {
      type: String,
    },
    // Timestamps
    UpdateAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

SecondorderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const lastOrder = await this.constructor.findOne(
      {},
      {},
      { sort: { createdAt: -1 } }
    );
    const lastOrderId = lastOrder ? parseInt(lastOrder.orderId) : 4999;
    this.orderId = (lastOrderId + 1).toString();
  }
  next();
});

// Export order model
module.exports = mongoose.model("Secondorder", SecondorderSchema);
