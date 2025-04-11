const Product = require("../../model/Product/product");
const Include = require("../../model/Product/include");
const Nutrition = require("../../model/Product/nutrition");
const ProductSize = require("../../model/Product/productsize");


const Trycatch = require("../../middleware/Trycatch");
const ApiFeatures = require("../../utils/apifeature");

const CreateProduct = Trycatch(async (req, res, next) => {
  const { price, discountPercentage, productSizes,productNuturitions } = req.body;
  const { deliverables } = req.body;
  
  let product;
  if (discountPercentage) {
    const discountedPrice = (price - price * (discountPercentage / 100)).toFixed(2);
    product = await Product.create({
      ...req.body,
      PriceAfterDiscount: discountedPrice,
    });
  } else {
    product = await Product.create(req.body);
  }
  if (productSizes && productSizes.length > 0) {
    for (let size of productSizes) { 
      const productSize = await ProductSize.create({
        ...size,
        productId: product._id,
      }); 
      
    }
  }
  // Nutrition
  if (productNuturitions && productNuturitions.length > 0) {
    for (let nutrition of productNuturitions) {
      const productNutrition = await Nutrition.create({
        ...nutrition,
        productId: product._id,
        nutrition : nutrition.name,
        value : nutrition.value
      });
    }
  }
   // Add deliverables
   for (let deliverable of deliverables) {
    await Include.create({
      productId: product._id,
      include: deliverable,
    });
  }

  res.status(201).json({
    success: true,
    product,
  });
});

// const getAlltopsallerproducts = Trycatch(async (req, res, next) => {
//   const products = await Product.find({topsaller : true}).populate("category").populate("subcategory");

//     const productsWithSize = await Promise.all(
//       products.map(async (product) => {
//         const size = await ProductSize.find({ productId: product._id });
//         return { ...product._doc, size }; 
//       })
//     );
//     const totalProducts = products.length;
//   res.status(200).json({
//     success: true,
//     totalProducts,
//     products: productsWithSize,
//   });
// });
 
const getAlltopsallerproducts = Trycatch(async (req, res, next) => {
  const { categoryId } = req.query;
  
  // Build the query object
  const query = { topsaller: "true" }; // Note: In your schema, topsaller is a String
  
  // If categoryId is provided, add it to the query
  if (categoryId) {
    query.category = categoryId;
  }
  console.log(query);

  const products = await Product.find(query)
    .populate("category")
    .populate("subcategory");

  const productsWithSize = await Promise.all(
    products.map(async (product) => {
      const size = await ProductSize.find({ productId: product._id });
      return { ...product._doc, size }; 
    })
  );

  const totalProducts = products.length;
  
  res.status(200).json({
    success: true,
    totalProducts,
    products: productsWithSize,
  });
});

// get all products
const GetAllProductsForAdmin = Trycatch(async (req, res, next) => {
  const perPageData = req.query.perPage;
  let { minPrice, maxPrice } = req.query;
  let category = req.query.category;
  let IsOutOfStock = req.query.IsOutOfStock;
  let productType = req.query.productType;
  category = category ? category : "";
  IsOutOfStock = IsOutOfStock ? IsOutOfStock : "";


  // result per page
  const resultPerPage = perPageData ? perPageData : 10000;
  //   price
  minPrice = minPrice ? minPrice : 1;
  maxPrice = maxPrice ? maxPrice : 1000000000;
  
  const features = new ApiFeatures(Product.find(), req.query)
    .search()
    .paginate(resultPerPage)
    // .filterByPriceRange(minPrice, maxPrice)
    .filterByCategory(category)
    .filterByStock(IsOutOfStock);

  features.query.populate("category");

  const Allproducts = await features.query;

  const products = Allproducts.reverse();

  // count total products
  const totalProductsCount = await Product.countDocuments();
  // updateProductType()
  res.status(200).json({
    resultPerPage,
    success: true,
    totalProducts: totalProductsCount,
    products,
  });
});

// const GetAllProducts = Trycatch(async (req, res, next) => {
//   const perPageData = req.query.perPage;
//   let { minPrice, maxPrice } = req.query;
//   let category = req.query.category;
//   let subcategory = req.query.subcategory;
//   let IsOutOfStock = req.query.IsOutOfStock;
//   let productType = req.query.productType;
//   const nameSearch = req.query.name;

//   category = category ? category : "";
//   subcategory = subcategory ? subcategory : "";
//   IsOutOfStock = IsOutOfStock ? IsOutOfStock : "";

//   minPrice = minPrice ? Number(minPrice) : 0;
//   maxPrice = maxPrice ? Number(maxPrice) : 1000000000;

//   const resultPerPage = perPageData ? perPageData : 50;

//   let features = new ApiFeatures(Product.find(), req.query)
//     .search();

//   if (subcategory) {
//     features = features.filterBySubcategory(subcategory);
//   } else if (category) {
//     features = features.filterByCategory(category);
//   }

//   if (productType) {
//     features = features.filterByProductType(productType);
//   }

//   const productSizeFilter = await ProductSize.aggregate([
//     {
//       $match: {
//         FinalPrice: { $gte: minPrice, $lte: maxPrice },
//       },
//     },
//     {
//       $group: {
//         _id: "$productId",
//         firstSize: { $first: "$FinalPrice" },
//       },
//     },
//   ]).then(results => results.map(result => result._id));

//   features.query = features.query.where('_id').in(productSizeFilter);

//   // Calculate totalProductsCount correctly
//   // let totalProductsCount;
//   let filter = {};

//   if (nameSearch) {
//     // If nameSearch is provided, we filter based on product name
//     filter.name = { $regex: nameSearch, $options: 'i' };
//   } else {
//     // Apply category or subcategory filters
//     if (subcategory) {
//       filter.subcategory = subcategory;
//     } else if (category) {
//       filter.category = category;
//     }

//     // Apply price range filter
//     if (minPrice !== undefined || maxPrice !== undefined) {
//       filter.PriceAfterDiscount = {
//         ...(minPrice !== undefined && { $gte: minPrice }),
//         ...(maxPrice !== undefined && { $lte: maxPrice }),
//       };
//     }

//     // Apply out-of-stock filter if present
//     if (IsOutOfStock !== undefined) {
//       filter.IsOutOfStock = IsOutOfStock === 'true';
//     }
//   }

//   features = features.paginate(resultPerPage);

//     features.query
//       .select("name price PriceAfterDiscount discountPercentage quantity thumbnail category IsOutOfStock productType description")
//       .populate("category subcategory");

//   const Allproducts = await features.query;

//   // Get the sizes for each product
//   const products = await Promise.all(
//     Allproducts.map(async (product) => {
//       const size = await ProductSize.find({ productId: product._id });
//       return { ...product._doc, size };
//     })
//   );

//   res.status(200).json({
//     resultPerPage,
//     success: true,
//     totalProducts: products.length, // This should now be correct
//     products: products.reverse(),
//   });
// });

 
// get single product

const GetAllProducts = Trycatch(async (req, res, next) => {
  const perPageData = req.query.perPage;
  let { minPrice, maxPrice } = req.query;
  let category = req.query.category;
  let subcategory = req.query.subcategory;
  let IsOutOfStock = req.query.IsOutOfStock;
  let productType = req.query.productType;
  const nameSearch = req.query.name;

  // Ensure subcategory is either a valid ObjectId or undefined
  if (subcategory === "undefined") {
    subcategory = undefined;
  }

  category = category ? category : "";
  subcategory = subcategory ? subcategory : "";
  IsOutOfStock = IsOutOfStock ? IsOutOfStock : "";

  minPrice = minPrice ? Number(minPrice) : 0;
  maxPrice = maxPrice ? Number(maxPrice) : 1000000000;

  const resultPerPage = perPageData ? perPageData : 50;

  let features = new ApiFeatures(Product.find(), req.query)
    .search();

  if (subcategory) {
    features = features.filterBySubcategory(subcategory);
  } else if (category) {
    features = features.filterByCategory(category);
  }

  if (productType) {
    features = features.filterByProductType(productType);
  }

  const productSizeFilter = await ProductSize.aggregate([
    {
      $match: {
        FinalPrice: { $gte: minPrice, $lte: maxPrice },
      },
    },
    {
      $group: {
        _id: "$productId",
        firstSize: { $first: "$FinalPrice" },
      },
    },
  ]).then(results => results.map(result => result._id));

  features.query = features.query.where('_id').in(productSizeFilter);

  // Calculate totalProductsCount correctly
  let filter = {};

  if (nameSearch) {
    // If nameSearch is provided, we filter based on product name
    filter.name = { $regex: nameSearch, $options: 'i' };
  } else {
    // Apply category or subcategory filters
    if (subcategory) {
      filter.subcategory = subcategory;
    } else if (category) {
      filter.category = category;
    }

    // Apply price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.PriceAfterDiscount = {
        ...(minPrice !== undefined && { $gte: minPrice }),
        ...(maxPrice !== undefined && { $lte: maxPrice }),
      };
    }

    // Apply out-of-stock filter if present
    if (IsOutOfStock !== undefined) {
      filter.IsOutOfStock = IsOutOfStock === 'true';
    }
  }

  features = features.paginate(resultPerPage);

  features.query
    .select("name price PriceAfterDiscount image discountPercentage quantity thumbnail category IsOutOfStock productType description")
    .populate("category subcategory");

  const Allproducts = await features.query;

  // Get the sizes for each product
  const products = await Promise.all(
    Allproducts.map(async (product) => {
      const size = await ProductSize.find({ productId: product._id });
      return { ...product._doc, size };
    })
  );

  res.status(200).json({
    resultPerPage,
    success: true,
    totalProducts: products.length, // This should now be correct
    products: products.reverse(),
  });
});





const GetSingleProduct = Trycatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("category").populate("subcategory");
  
  if (!product) {
    return res.status(404).json({ 
      success: false,
      message: "Product not found",
    });
  }
  // send all Include
  const sizes = await ProductSize.find({ productId: product._id });
  const include = await Include.find({ productId: req.params.id })
  const productNuturitions = await Nutrition.find({ productId: req.params.id })
  res.status(200).json({
    success: true,
    include,
    product,
    sizes,
    productNuturitions
  });
});


const UpdateProduct = Trycatch(async (req, res, next) => {
  // Update the product
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  const productSizes = await ProductSize.find({ productId: updatedProduct._id });
  const allSizesOutOfStock = productSizes.every(size => size.IsOutOfStock === "true");
  updatedProduct.IsOutOfStock = allSizesOutOfStock ? "true" : "false";

  // Check if quantity is greater than 0
  // if (updatedProduct.quantity > 0) {
  //   updatedProduct.IsOutOfStock = "false";
  // } else {
  //   updatedProduct.IsOutOfStock = "true";
  // }

  // Save the updated product with IsOutOfStock updated
  const product = await updatedProduct.save();

  res.status(200).json({
    success: true,
    product,
  });
});


// const UpdateProduct = Trycatch(async (req, res, next) => {
//   // Update the product
//   const updatedProduct = await Product.findByIdAndUpdate(
//     req.params.id,
//     req.body,
//     {
//       new: true,
//       runValidators: true,
//       useFindAndModify: false,
//     }
//   );

//   // Check if quantity is greater than 0
//   if (updatedProduct.quantity > 0) {
//     updatedProduct.IsOutOfStock = "false";
//   } else {
//     updatedProduct.IsOutOfStock = "true";
//   }

//   // Save the updated product with IsOutOfStock updated
//   const product = await updatedProduct.save();

//   res.status(200).json({
//     success: true,
//     product,
//   });
// });

const updateProductType = async () => {
  try {
    // Find all products that don't have the productType field
    const productsToUpdate = await Product.find({
      productType: { $exists: false },
    });

    // Update each product with the default value for productType
    const updatedProducts = await Promise.all(
      productsToUpdate.map(async (product) => {
        product.productType = "Domestic"; // Set default value for productType
        return await product.save(); // Save the updated product
      })
    );

  } catch (error) {
    console.error("Error updating products:", error);
  }
};

// delete product
const DeleteProduct = Trycatch(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// exports
module.exports = {
  CreateProduct,
  GetAllProducts,
  GetSingleProduct,
  UpdateProduct,
  DeleteProduct,
  GetAllProductsForAdmin,
  getAlltopsallerproducts
};
