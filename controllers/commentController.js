const Comment = require("../models/Comment");
const Order = require("../models/Order");
// const User = require("../models/User");
const mongoose = require("mongoose");

const commentController = {
  // Thêm bình luận
  addComment: async (req, res) => {
    try {
      console.log(req.body);
      const newComment = new Comment({
        comment: req.body.comment,
        product_id: req.body.product_id,
        //   user_id: req.body.user_id,
        user_id: req.params.id,
        //
        img: req.body.img,
        size: req.body.size,
        quantiStar: req.body.quantiStar,
      });

      const savedComment = await newComment.save();

      const updatedOrder = await Order.findOneAndUpdate(
        {
          // userId: req.body.user_id,
          userId: req.params.id,
          status: "complete",
          _id: req.body.order_id,
          "products.product_id": mongoose.Types.ObjectId(req.body.product_id), // chuyển product_id từ string sang ObjectId
        },
        {
          $set: {
            "products.$[product].checkEvaluate": true, // sử dụng arrayFilters để tìm đến phần tử trong mảng và cập nhật checkEvaluate thành true
          },
        },
        {
          arrayFilters: [
            {
              "product.product_id": mongoose.Types.ObjectId(
                req.body.product_id
              ),
            }, // tìm phần tử trong mảng products có product_id trùng với req.body.product_id
          ],
          new: true, // trả về document mới được cập nhật
        }
      ).populate({
        path: "products",
        populate: { path: "product_id" },
      });

      res.status(200).json(updatedOrder);
      // res.status(200).json("success");
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },

  //  Cập nhật bình luận
  updateComment: async (req, res) => {
    try {
      const updateComment = await Comment.updateOne(
        {
          product_id: req.body.product_id,
          user_id: req.body.user_id,
          comment: req.body.comment,
        },
        {
          $set: { comment: req.body.new_comment },
        },
        { new: true }
      );

      res.status(200).json("success");
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },

  // Xoá bình luận
  deleteComment: async (req, res) => {
    try {
      const deleteComment = await Comment.deleteOne(
        {
          product_id: req.body.product_id,
          user_id: req.body.user_id,
          comment: req.body.comment,
        },
        { new: true }
      );

      // await Product.findByIdAndDelete(req.params.id);
      res.status(200).json("Product has been deleted...");
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },

  // Lấy ra 1 bình luận
  getUserComment: async (req, res) => {
    try {
      // const option = req.params.option;
      // const amountImg = await Comment.find({
      //   product_id: req.params.id,
      //   img: { $exists: true },
      // })
      //   .select("img")
      //   .lean();

      // const amountComment = await Comment.find({
      //   product_id: req.params.id,
      //   comment: { $exists: true },
      // })
      //   .select("comment")
      //   .lean();

      // const amountStar1 = await Comment.find({
      //   product_id: req.params.id,
      //   quantiStar: 1,
      // })
      //   .select("quantiStar")
      //   .lean();

      // const amountStar2 = await Comment.find({
      //   product_id: req.params.id,
      //   quantiStar: 2,
      // })
      //   .select("quantiStar")
      //   .lean();

      // const amountStar3 = await Comment.find({
      //   product_id: req.params.id,
      //   quantiStar: 3,
      // })
      //   .select("quantiStar")
      //   .lean();

      // const amountStar4 = await Comment.find({
      //   product_id: req.params.id,
      //   quantiStar: 4,
      // })
      //   .select("quantiStar")
      //   .lean();

      // const amountStar5 = await Comment.find({
      //   product_id: req.params.id,
      //   quantiStar: 5,
      // })
      //   .select("quantiStar")
      //   .lean();

      // let filter = { product_id: req.params.id };
      // if (option) {
      //   if (option === "img" || option === "comment") {
      //     filter[option] = { $exists: true };
      //   } else if (option === "all") {
      //     // không thêm điều kiện lọc
      //   } else {
      //     filter.quantiStar = parseInt(option);
      //   }
      // }

      // const list = await Comment.find(filter).populate({ path: "user_id" });

      // // Tính tổng số sao đánh giá
      // const starAmount = await Comment.find({
      //   product_id: req.params.id,
      // })
      //   .select("quantiStar")
      //   .lean();
      // const totalEvaluateStar = starAmount.reduce(
      //   (sum, comment) => sum + comment.quantiStar,
      //   0
      // );
      // const mainEvaluateStar =
      //   starAmount.length > 0 ? totalEvaluateStar / starAmount.length : 0;

      // const amount = {
      //   amountImg: amountImg.length,
      //   amountComment: amountComment.length,
      //   amountStar1: amountStar1.length,
      //   amountStar2: amountStar2.length,
      //   amountStar3: amountStar3.length,
      //   amountStar4: amountStar4.length,
      //   amountStar5: amountStar5.length,
      // };

      // const infoComment = {
      //   mainEvaluateStar,
      //   list,
      //   amount,
      // };
      console.log("req.query", req.query);
      let page = req.query.page;
      const pageSize = parseInt(req.query.limit);
      page = parseInt(page);
      if (page < 1) {
        page = 1;
      }
      let quanti = (page - 1) * pageSize;
      console.log("quanti", quanti);
      console.log("page", page);
      // console.log('quanti',quanti)

      const option = req.params.option;
      const filters = { product_id: req.params.id };
      const promises = [];

      if (option === "img" || option === "comment") {
        filters[option] = { $exists: true };
      } else if (option === "all") {
        // không thêm điều kiện lọc
      } else {
        filters.quantiStar = parseInt(option);
      }

      // promises.push(Comment.countDocuments(filters));
      promises.push(
        Comment.find(filters)
          .sort({
            createdAt: -1,
          })
          // .skip(quanti)
          // .limit(pageSize)
          .populate({ path: "user_id" })
      );
      promises.push(
        // Comment.find({ product_id: req.params.id, img: { $exists: true } })
        Comment.countDocuments({
          product_id: req.params.id,
          img: { $exists: true },
        })
      );
      promises.push(
        Comment.countDocuments({
          product_id: req.params.id,
          comment: { $exists: true },
        })
      );
      promises.push(
        Comment.countDocuments({ product_id: req.params.id, quantiStar: 1 })
      );
      promises.push(
        Comment.countDocuments({ product_id: req.params.id, quantiStar: 2 })
      );
      promises.push(
        Comment.countDocuments({ product_id: req.params.id, quantiStar: 3 })
      );
      promises.push(
        Comment.countDocuments({ product_id: req.params.id, quantiStar: 4 })
      );
      promises.push(
        Comment.countDocuments({ product_id: req.params.id, quantiStar: 5 })
      );

      const [
        // total,
        list,
        amountImg,
        amountComment,
        amountStar1,
        amountStar2,
        amountStar3,
        amountStar4,
        amountStar5,
      ] = await Promise.all(promises);

      // Tính tổng số sao đánh giá
      const totalEvaluateStar = list.reduce(
        (sum, comment) => sum + comment.quantiStar,
        0
      );

      console.log("totalEvaluateStar", totalEvaluateStar);
      // const mainEvaluateStar = (total && totalEvaluateStar / total) || 0;

      // Tính tổng của tất cả các phần tử trong list
      // const sum = list.reduce((acc, curr) => {
      //   return acc + curr;
      // }, 0);

      // console.log("sum", sum);

      const mainEvaluateStar =
        (list.length && totalEvaluateStar / list.length) || 0;

      // Lấy 3 phần tử đầu tiên trong list
      const result = list.slice(quanti, quanti + pageSize);

      const amount = {
        amountImg: amountImg,
        amountComment: amountComment,
        amountStar1: amountStar1,
        amountStar2: amountStar2,
        amountStar3: amountStar3,
        amountStar4: amountStar4,
        amountStar5: amountStar5,
      };

      const pagi = {
        page: page,
        totalRows: list.length,
        limit: pageSize,
      };

      const infoComment = {
        mainEvaluateStar,
        list: result,
        amount,
      };

      console.log("mainEvaluateStar", mainEvaluateStar);
      // res.status(200).json(infoComment);
      res.status(200).json({
        resultProducts: infoComment,
        pagi: pagi,
      });
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },

  //  Lấy ra tất cả sản phẩm
  // getAllCart: async (req, res) => {
  //   try {
  //     const carts = await Cart.find();
  //     res.status(200).json(carts);
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // },
};

module.exports = commentController;
