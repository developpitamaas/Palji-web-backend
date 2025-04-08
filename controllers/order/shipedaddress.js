const Shipedaddress = require("../../model/order/shipedaddress");
const TryCatch = require("../../middleware/Trycatch");
const User = require("../../model/User/users");

// create shiped address
const CreateShipedAddress = TryCatch(async (req, res, next) => {
    req.body.userId = req.user.id
    const shipedaddress = await Shipedaddress.create(req.body);
    res.status(201).json({
        success: true,
        message: "Shipping address added successfully",
        shipedaddress,
    }) 
})

// get my shiped address
const GetMyShipedAddress = TryCatch(async (req, res, next) => {
    const shipedaddress = await Shipedaddress.find({ userId: req.user.id , active : "true"});
    res.status(200).json({
        success: true,
        shipedaddress
    });
})

// update shiped address
const UpdateShipedAddress = TryCatch(async (req, res, next) => {
    const shipedaddress = await Shipedaddress.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(200).json({
        success: true,
        shipedaddress
    });
})

// delete shiped address
// const DeleteShipedAddress = TryCatch(async (req, res, next) => {
//     const shipedaddress = await Shipedaddress.findById(req.params.id);
//     if (!shipedaddress) {
//         return res.status(404).json({
//             success: false,
//             message: "Shiped address not found",
//         });
//     }
//     await shipedaddress.deleteOne();
//     res.status(200).json({
//         success: true,
//         message: "Shiped address deleted successfully",
//     });
// })
const DeleteShipedAddress = TryCatch(async (req, res, next) => {
    const shipedaddress = await Shipedaddress.findById(req.params.id);
    if (!shipedaddress) {
        return res.status(404).json({
            success: false,
            message: "Shiped address not found",
        });
    }

    // Deactivate the address instead of deleting it
    shipedaddress.active = "false";
    await shipedaddress.save();

    res.status(200).json({
        success: true,
        message: "Shiped address deactivated successfully",
    });
});

// get shiped address by id
const GetShipedAddressById = TryCatch(async (req, res, next) => {
    const shipedaddress = await Shipedaddress.findById(req.params.id);
    res.status(200).json({
        success: true,
        shipedaddress
    });
})


// exports
module.exports = {
    CreateShipedAddress,
    GetMyShipedAddress,
    UpdateShipedAddress,
    DeleteShipedAddress,
    GetShipedAddressById
}