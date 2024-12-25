const express = require("express");
require("dotenv").config();
const app = express();
const ip = require("ip");
const cors = require("cors");
const fs = require("fs-extra");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const moment = require("moment-timezone");
const path = require("path");
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

const { getDatabase } = require("./src/utils/database");
const { connectToDatabase } = require("./src/utils/database");

// Web users Route
const webAuthRoutes = require("./src/app/v1/modules/webUsers/middleware/webJwtAuth.route");
const webUserRoutes = require("./src/app/v1/modules/webUsers/users/users.route");
const webJobRoutes = require("./src/app/v1/modules/webUsers/job/webJob.route");
const webWithdrawRoutes = require("./src/app/v1/modules/webUsers/withdraw/userWithdraw.route");
const webVisitEarnRoutes = require("./src/app/v1/modules/webUsers/visitearn/userVisitEarn.route");

// Admin Route
const authRoutes = require("./src/app/v1/modules/middleware/jwtAuth.route");
const otpRoutes = require("./src/app/v1/modules/otpVerification/otp.route");
const uploadRoutes = require("./src/app/v1/modules/multerUpload/multer.controller");

const userRoutes = require("./src/app/v1/modules/users/user.route");
const paymentRoutes = require("./src/app/v1/modules/userPayments/userPayments.route");
const withdrawRoutes = require("./src/app/v1/modules/userWithdraw/withdraw.route");
const mathodRoutes = require("./src/app/v1/modules/payMethod/method.route");
const packageRoutes = require("./src/app/v1/modules/packages/packages.route");
const jobRoutes = require("./src/app/v1/modules/jobs/jobs.route");
const DirectRoutes = require("./src/app/v1/modules/directLinks/directLinks.route");
const GlobalDataRoutes = require("./src/app/v1/modules/globalData/globalData.route");
const VisitEarnRoutes = require("./src/app/v1/modules/visitEarn/visitEarn.route");
const getBangladeshDateTime = require("./src/utils/currentDateTime");

app.use(express.json());
app.use(cors());
app.use("/public", express.static("public"));

// Connect to the database
connectToDatabase()
  .then(() => {
    // Use userRoutes after connecting to the database
    // Web User Route Database
    app.use(webAuthRoutes);
    app.use(webUserRoutes);
    app.use(webJobRoutes);
    app.use(webWithdrawRoutes);
    app.use(webVisitEarnRoutes);

    // Admin Route Database
    app.use(authRoutes);
    app.use(otpRoutes);

    app.use(userRoutes);
    app.use(paymentRoutes);
    app.use(withdrawRoutes);
    app.use(mathodRoutes);
    app.use(packageRoutes);
    app.use(jobRoutes);
    app.use(DirectRoutes);
    app.use(GlobalDataRoutes);
    app.use(VisitEarnRoutes);

    console.log(getBangladeshDateTime());
    //----------Update the commission status Due for all users start----------//

    cron.schedule("0 0 * * *", async () => {
      try {
        const db = getDatabase();
        const updateBillStatus = {
          $set: {
            comStatus: true,
          },
        };
        const result = await db
          .collection("users")
          .updateMany({}, updateBillStatus);
        console.log(
          `Bill status updated for ${result.modifiedCount} users on the Daily.`
        );
      } catch (error) {
        console.error("Error updating bill status:", error);
      }
    });

    //----------Update the commission status Due for all users End----------//

    //----------Update the commission status Due for all users Start----------//

    cron.schedule("0 0 */5 * *", async () => {
      try {
        const db = getDatabase();
        const result = await db.collection("history").deleteMany();
        console.log(
          `Bill status updated for ${result.deletedCount} users on the Daily.`
        );
      } catch (error) {
        console.error("Error updating bill status:", error);
      }
    });

    cron.schedule("0 0 */2 * *", async () => {
      try {
        const db = getDatabase();
        const result = await db
          .collection("directSubmit")
          .deleteMany({ status: "Pending" });
        await db.collection("jobSubmit").deleteMany({ status: "Pending" });
        await db.collection("visitSubmit").deleteMany({ status: "Complete" });
        console.log(
          `Bill status updated for ${result.deletedCount} users on the Daily.`
        );
      } catch (error) {
        console.error("Error updating bill status:", error);
      }
    });

    //----------Update the commission status Due for all users End----------//

    //----------Delete Delivary File Age 2 Month Auto Start----------//

    const deleteFile = (filePath) => {
      const fullPath = path.join(__dirname, filePath);
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${filePath}`, err);
        } else {
          console.log(`File deleted: ${filePath}`);
        }
      });
    };

    const isOlderThanTwoMonths = (deliveryTime) => {
      // Parse deliveryTime from database and compare
      const now = moment().tz("Asia/Dhaka");
      const deliveryDate = moment(deliveryTime, "DD-MM-YYYY hh:mm:ss A").tz(
        "Asia/Dhaka"
      );
      return now.diff(deliveryDate, "months") >= 2;
    };

    cron.schedule("0 0 * * *", async () => {
      // Runs every day at midnight
      try {
        const db = getDatabase();

        // Fetch orders with deliveryType "Apps"
        const orders = await db
          .collection("orders")
          .find({
            deliveryType: "Apps",
          })
          .toArray();

        // Filter orders older than two months
        const toDelete = orders.filter((order) =>
          isOlderThanTwoMonths(order.deliveryTime)
        );

        for (const order of toDelete) {
          const { deliveryDetails } = order;

          // Delete files if they exist
          if (deliveryDetails?.appFile) {
            deleteFile(deliveryDetails.appFile);
          }
          if (deliveryDetails?.adminPanelFile) {
            deleteFile(deliveryDetails.adminPanelFile);
          }

          // Update the order to set downloadStatus to false
          await db
            .collection("orders")
            .updateOne({ _id: order._id }, { $set: { downloadStatus: false } });
          console.log(
            `Order updated: ${order._id}, downloadStatus set to false.`
          );
        }

        console.log(`${toUpdate.length} orders processed and files deleted.`);
      } catch (error) {
        console.error("Error cleaning up orders:", error);
      }
    });

    //----------Delete Delivary File Age 2 Month Auto End----------//

    // ---------------Image Upload APIS Start-----------//
    app.post("/public/upload", uploadRoutes.single("image"), (req, res) => {
      const imageUrl = "/public/upload/" + req.file.filename;
      res.send({ imageUrl });
    });

    app.post("/public/upload/file", uploadRoutes.single("file"), (req, res) => {
      const fileName = "/public/upload/" + req.file.filename;
      res.send({ fileName });
    });

    app.post(
      "/public/upload/product",
      uploadRoutes.array("images", 5),
      (req, res) => {
        const imageUrls = req.files.map(
          (file) => "/public/upload/" + file.filename
        );
        res.send({ imageUrls });
      }
    );

    // Image Delete API
    app.delete("/public/upload/delete", (req, res) => {
      const filenames = req.body.filenames; // Assuming filenames are sent in the request body as an array
      if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
        return res
          .status(400)
          .json({ error: "Invalid or missing filenames in request body." });
      }

      // Array to hold deletion results for each file
      const deletionResults = [];

      // Iterate over each filename
      filenames.forEach((filePath) => {
        const filename = filePath.substring(filePath.lastIndexOf("/") + 1); // Extract filename from the path
        const fullPath = "./public/upload/" + filename;

        // Check if the file exists
        fs.access(fullPath, fs.constants.F_OK, (err) => {
          if (err) {
            // If file doesn't exist, add result to deletionResults
            deletionResults.push({
              filename: filename,
              success: false,
              error: "File not found.",
            });
            // If all files have been processed, send the response
            if (deletionResults.length === filenames.length) {
              res.status(200).json({ delete: false, deletionResults });
            }
          } else {
            // Delete the file
            fs.unlink(fullPath, (unlinkErr) => {
              if (unlinkErr) {
                // If error occurred during deletion, add result to deletionResults
                deletionResults.push({
                  filename: filename,
                  success: false,
                  error: "Error deleting file.",
                });
              } else {
                // If deletion successful, add result to deletionResults
                deletionResults.push({ filename: filename, success: true });
              }
              // If all files have been processed, send the response
              if (deletionResults.length === filenames.length) {
                res.status(200).json({ delete: true, deletionResults });
              }
            });
          }
        });
      });
    });
    // ---------------Image Upload APIS End-----------//

    app.get("/", (req, res) => {
      res
        .status(201)
        .send({
          serverRunning: true,
          ip: ip.address(),
          message: "Apps Selling Server is Running",
          DevelopingStart: "18-05-2024",
        });
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
