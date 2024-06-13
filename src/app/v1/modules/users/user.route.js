const express = require("express");
const userController = require("./user.controller");
const verifyJWT = require("../middleware/verifyJWT");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();

// ---------Product Route Start -------//
router.get("/api/v1/admin/products", userController.getProducts);
router.get("/api/v1/admin/single/products", userController.getSingleProduct);

router.post(
  "/api/v1/admin/product",
  verifyJWT,
  verifyAdmin,
  userController.createProduct
);

router.patch(
  "/api/v1/admin/product/status/:id",
  verifyJWT,
  verifyAdmin,
  userController.updateProductStatus
);

router.delete(
  "/api/v1/admin/product/:id",
  verifyJWT,
  verifyAdmin,
  userController.deleteProduct
);
// ---------Product Route End -------//

// ---------Order Route Start -------//
router.get("/api/v1/admin/orders", userController.getOrders);
router.patch(
  "/api/v1/admin/order/status/:id",
  verifyJWT,
  verifyAdmin,
  userController.updateOrderStatus
);
router.patch(
  "/api/v1/admin/order/delivary/:id",
  verifyJWT,
  verifyAdmin,
  userController.updateOrderDelivary
);
router.delete(
  "/api/v1/admin/order/:id",
  verifyJWT,
  verifyAdmin,
  userController.deleteOrder
);

// ---------Order Route End -------//

router.post(
  "/api/v1/admin/user",
  verifyJWT,
  verifyAdmin,
  userController.createUser
);
router.get(
  "/api/v1/admin/users",
  verifyJWT,
  verifyAdmin,
  userController.getUsers
);
router.get(
  "/api/v1/admin/reseller",
  verifyJWT,
  verifyAdmin,
  userController.getReseller
);
router.get(
  "/api/v1/admin/block/users",
  verifyJWT,
  verifyAdmin,
  userController.getBlockUsers
);
router.patch(
  "/api/v1/admin/user/:id",
  verifyJWT,
  verifyAdmin,
  userController.updateUser
);
router.patch(
  "/api/v1/admin/user/status/:id",
  verifyJWT,
  verifyAdmin,
  userController.updateStatus
);
router.delete(
  "/api/v1/admin/user/:id",
  verifyJWT,
  verifyAdmin,
  userController.deleteUser
);
router.patch(
  "/api/v1/admin/user/password-change/:id",
  verifyJWT,
  verifyAdmin,
  userController.updatePassword
);
router.patch(
  "/api/v1/admin/user/bonus/:id",
  verifyJWT,
  verifyAdmin,
  userController.claimUserBouns
);
router.patch(
  "/api/v1/admin/user/notice/:id",
  verifyJWT,
  verifyAdmin,
  userController.sendNotice
);

router.get("/api/v1/public/user/:id", userController.getUser);
router.get("/api/v1/public/track/user/:id", userController.getTrackUser);
router.get("/api/v1/public/web/track/user/:id", userController.getTrackWebUser);
router.get("/api/v1/admin/stat", userController.getAdminStat);

router.get("/api/v1/public/user/pay/due", userController.setUsersDueStatus);

router.get(
  "/api/v1/admin/accounts",
  verifyJWT,
  verifyAdmin,
  userController.getaccounts
);

module.exports = router;
