const Pincode = require("../../model/selfdelivery/pincode");
const TryCatch = require("../../middleware/Trycatch");

const CreatePincode = TryCatch(async (req, res, next) => {
    const pincode = await Pincode.create(req.body);
    res.status(201).json({
        success: true,
        pincode,
    });
});

const GetAllPincode = TryCatch(async (req, res, next) => {
    const pincode = await Pincode.find();
    res.status(200).json({
        success: true,
        pincode,
    });
});

const getallavailablepincode = TryCatch(async (req, res, next) => {
    const pincode = await Pincode.find({ available: true });
    res.status(200).json({
        success: true,
        pincode,
    });
}) 

const editpincode = TryCatch(async (req, res, next) => {
    const pincode = await Pincode.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        pincode,
    })
})

const deletepincode = TryCatch(async (req, res, next) => {
    const pincode = await Pincode.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success: true,
        pincode,
    });
})

module.exports = {
    CreatePincode,
    GetAllPincode,
    getallavailablepincode,
    editpincode,
    deletepincode
}