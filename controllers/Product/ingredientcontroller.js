const Ingredient = require("../../model/Product/ingredient");
const Trycatch = require("../../middleware/Trycatch");

// create include
const Createingredient = Trycatch(async (req, res, next) => {
  const include = await Ingredient.create(req.body);
  res.status(201).json({
    success: true,
    include,
  });
});

// get all includes
const GetAllingredient = Trycatch(async (req, res, next) => {
  
  const includes = await Ingredient.find({ productId: req.params.productId });
  const totalIncludes = includes.length;
  res.status(200).json({
    success: true,
    totalIncludes,
    includes,
  });
});

// update include
const Updateingredient = Trycatch(async (req, res, next) => {
  
  const include = await Ingredient.findByIdAndUpdate(req.params.productId, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    include,
  });
});

// delete include 
const Deleteingredient = Trycatch(async (req, res, next) => {
  const include = await Ingredient.findByIdAndDelete(req.params.productId);
  if (!include) {
    return res.status(404).json({
      success: false,
      message: "Include not found",
    });
  }
  res.status(200).json({
    success: true,
    include,
  });
});

// exports
module.exports = {
  Createingredient,
  GetAllingredient,
  Updateingredient,
  Deleteingredient,
};
