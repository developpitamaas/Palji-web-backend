const Category = require("../../model/Product/Categories");
const Subcategory = require("../../model/Product/subcategories");
const Trycatch = require("../../middleware/Trycatch");
const Product = require("../../model/Product/product");
const productsize = require("../../model/Product/productsize");

// create product category
const CreateCategory = Trycatch(async (req, res, next) => {
  const { name, description,subcategorieslist,availablePinCodes  } = req.body;
  const category = await Category.create({ name, description,availablePinCodes });

  if (subcategorieslist && subcategorieslist.length > 0) {
    for (let subcategory of subcategorieslist) {
    const subcategorydata =  await Subcategory.create({
        category: category._id,
        name: subcategory.name,
        description: subcategory.description,
      });
    }
  }

  res.status(201).json({
    success: true,
    category,
  });
});

 
const CreateSubcategory = Trycatch(async (req, res, next) => {
  const subcategory = await Subcategory.create(req.body);
  res.status(201).json({
    success: true,
    subcategory,
  });
});


const GetAllCategories = Trycatch(async (req, res, next) => {
  // Fetch all categories
  const categories = await Category.find();

  // Fetch subcategories for the retrieved categories
  const subcategories = await Subcategory.find({
      category: { $in: categories.map(cat => cat._id) } // Find subcategories for these categories
  });

  // Organize subcategories by category ID
  const subcategoriesByCategory = subcategories.reduce((acc, sub) => {
      (acc[sub.category] = acc[sub.category] || []).push(sub);
      return acc;
  }, {});

  // Attach subcategories to their respective categories
  const categoriesWithSubcategories = categories.map(category => ({
      ...category.toObject(),
      subcategories: subcategoriesByCategory[category._id] || []
  }));

  const totalCategories = categoriesWithSubcategories.length;
  res.status(200).json({
      success: true,
      totalCategories,
      categories: categoriesWithSubcategories,
  });
});

// get single product category
const GetSingleCategory = Trycatch(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  const subcategory = await Subcategory.find({ category: req.params.id });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }
  res.status(200).json({
    success: true,
    category,
    subcategory
  });
});

// update product category
const UpdateCategory = Trycatch(async (req, res, next) => {
  const { availablePinCodes } = req.body; // Extract pin codes from request body

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { ...req.body, availablePinCodes }, // Ensure pin codes are updated
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  if (!category) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  res.status(200).json({
    success: true,
    category,
  });
});

const UpdateSubcategory = Trycatch(async (req, res, next) => {
  const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    subcategory,
  });
});


// delete product category
const DeleteCategory = Trycatch(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

const DeleteSubCategory = Trycatch(async (req, res, next) => {
  const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
  if (!subcategory) {
    return res.status(404).json({
      success: false,
      message: "Subcategory not found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Subcategory deleted successfully",
  });
});

// get all products by category
// const GetAllProductsByCategory = Trycatch(async (req, res, next) => {
//   const products = await Product.find({ category: req.params.id })
    
//   const totalProducts = products.length;
//   res.status(200).json({
//     success: true,
//     totalProducts,
//     products,
//   });
// });
const GetAllProductsByCategory = Trycatch(async (req, res, next) => {
  // Fetch products based on category ID
  const products = await Product.find({ category: req.params.id });

  // For each product, fetch its sizes and return the product along with size data
  const productsWithSize = await Promise.all(
    products.map(async (product) => {
      // Find sizes for the current product
      const size = await productsize.find({ productId: product._id });
      return { ...product._doc, size }; // Return product with size data
    })
  );

  const totalProducts = products.length;

  // Send the response with the total count and products with size info
  res.status(200).json({
    success: true,
    totalProducts,
    products: productsWithSize,
  });
});


// exports
module.exports = {
  CreateCategory,
  GetAllCategories,
  GetSingleCategory,
  UpdateCategory,
  DeleteCategory,
  GetAllProductsByCategory,
  CreateSubcategory,
  DeleteSubCategory,
  UpdateSubcategory
};
