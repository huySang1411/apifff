const User = require("../models/User");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const Size = require("../models/Size");
const DiscountProduct = require("../models/DiscountProduct");

const PAGE_SIZE = 12;

const productController = {
  // Tạo sản phẩm
  createProduct: async (req, res) => {
    const newProduct = new Product(req.body);
    try {
      const savedProduct = await newProduct.save();
      res.status(200).json(savedProduct);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //  Cập nhật sản phẩm
  updateProduct: async (req, res) => {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedProduct);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Xoá sản phẩm
  deleteProduct: async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.status(200).json("Product has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Lấy ra 1 sản phẩm theo id
  getOneProduct: async (req, res) => {
    try {
      // const product = await Product.findById(req.params.id).populate({
      //   path: "discountProduct_id",
      // })

      // .select("title img price discountProduct_id inStock");

      const product = await Product.findById(req.params.id)
        .populate("discountProduct_id", "discount_amount")
        .populate("sizes", "size inStock")
        .select("title img categories color price discountProduct_id sizes");
      console.log(product);
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // test model size
  createSize: async (req, res) => {
    try {
      const size = new Size({
        size: req.body.size,
        inStock: req.body.inStock,
      });

      await size.save();
      res.status(200).json(size);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // test model size
  addSize: async (req, res) => {
    try {
      const product = await Product.updateOne(
        {
          _id: req.params.id,
        },
        {
          $push: { sizes: req.body.size_id },
          $set: { discountProduct_id: req.body.discount },
        },
        { new: true }
      );

      // await discount_amount.save();
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //  Lấy ra tất cả sản phẩm
  // getAllProduct: async (req, res) => {
  //   let page = req.query.page;
  //   const pageSize = parseInt(req.query.limit);
  //   page = parseInt(page);
  //   if (page < 1) {
  //     page = 1;
  //   }
  //   let quanti = (page - 1) * pageSize;

  //   const qNew = req.query.new;
  //   const qCategory = req.query.category;
  //   try {
  //     let products;

  //     if (qNew) {
  //       products = await Product.find().sort({ createdAt: -1 }).limit(1);
  //     } else if (qCategory) {
  //       products = await Product.find({
  //         categories: {
  //           $in: [qCategory],
  //         },
  //       })
  //         // .sort({ createdAt: -1 })
  //         .skip(quanti)
  //         .limit(pageSize);
  //     } else {
  //       products = await Product.find();
  //     }

  //     const total = await Product.find({
  //       categories: {
  //         $in: [qCategory],
  //       },
  //     });

  //     const totalProduct = total.length;

  //     const pagi = {
  //       page: page,
  //       totalRows: totalProduct,
  //       limit: pageSize,
  //     };

  //     const results = {
  //       resultProducts: products,
  //       pagi: pagi,
  //     };

  //     res.status(200).json(results);
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // },

  getAllProduct: async (req, res) => {
    // Xử lí số trang hiện tại
    console.log("req", req.query);
    let page = req.query.page;
    const pageSize = parseInt(req.query.limit);
    page = parseInt(page);
    if (page < 1) {
      page = 1;
    }
    let quanti = (page - 1) * pageSize;

    // Xử lí sort
    let sort;
    if (req.query.sort === "newest") {
      sort = {
        createdAt: -1,
      };
    } else if (req.query.sort === "asc") {
      sort = {
        price: -1,
      };
    } else if (req.query.sort === "desc") {
      sort = {
        price: 1,
      };
    }

    try {
      let products;
      let totalProduct;

      if (req.query.new) {
        products = await Product.find().sort({ createdAt: -1 }).limit(1);
      } else if (req.query.category !== "undefined") {
        products = await Product.find({
          categories: {
            $in: [req.query.category],
          },
        })
          .sort(sort)
          .skip(quanti)
          .limit(pageSize)

          .populate("discountProduct_id", "discount_amount")
          .populate("sizes", "size inStock")
          // .populate({
          //   path: "discountProduct_id",
          // })
          .select("title img price discountProduct_id sizes");

        totalProduct = await Product.find({
          categories: {
            $in: [req.query.category],
          },
        }).lean();
      } else {
        products = await Product.find()
          .sort(sort)
          .skip(quanti)
          .limit(pageSize)
          .populate("discountProduct_id", "discount_amount")
          .populate("sizes", "size inStock")
          // .populate({
          //   path: "discountProduct_id",
          // })
          .select("title img price discountProduct_id sizes");

        totalProduct = await Product.find().lean();
      }

      // console.log("products", products);

      const pagi = {
        page: page,
        totalRows: totalProduct.length,
        limit: pageSize,
      };

      const results = {
        resultProducts: products,
        pagi: pagi,
      };

      res.status(200).json(results);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getAllProductList: async (req, res) => {
    let page = req.query.page;
    const pageSize = parseInt(req.query.limit);
    page = parseInt(page);
    if (page < 1) {
      page = 1;
    }
    let quanti = (page - 1) * pageSize;

    const qNew = req.query.new;
    const qCategory = req.query.category;
    try {
      let products;

      if (qNew) {
        products = await Product.find().sort({ createdAt: -1 }).limit(1).lean();
      } else if (qCategory) {
        products = await Product.find({
          categories: {
            $in: [qCategory],
          },
        })
          .sort({ createdAt: -1 })
          .lean();
      } else {
        products = await Product.find().sort({ createdAt: -1 }).lean();
      }

      res.status(200).json(products);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getDiscountProduct: async (req, res) => {
    try {
      const findDiscount = await DiscountProduct.findOne({
        product_id: mongoose.Types.ObjectId(req.params.id),
      })
        .select("discount_amount")
        .lean();

      if (!findDiscount) return res.status(200).json(0);

      console.log("findDiscount", findDiscount);
      res.status(200).json(findDiscount);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = productController;
