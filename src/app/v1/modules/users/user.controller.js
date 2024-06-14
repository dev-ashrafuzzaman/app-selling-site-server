const { ObjectId } = require("mongodb");
const { getDatabase } = require("../../../../utils/database");
const bcrypt = require("bcryptjs");
const {
  getCurrentDateTimeInDhaka,
  formatDateTime,
} = require("../../../../utils/currentDateTime");

exports.getProducts = async (req, res) => {
  try {
    const { page = 1, pageSize = 2, search = "" } = req.query;
    const db = getDatabase();
    const query = {};

    if (search) {
      query.$or = [
        { uid: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
        { orderTime: { $regex: search, $options: "i" } },
        { _id: { $regex: search, $options: "i" } },
      ];
    }

    const totalCount = await db.collection("products").countDocuments(query);
    const result = await db
      .collection("products")
      .find(query)
      .sort({ joinDate: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .toArray();

    res.json({ totalCount, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const db = getDatabase();
    const result = await db.collection("products").find().toArray();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createProduct = async (req, res) => {
  const { product } = req.body;
  const db = getDatabase();
  try {
    const result = await db.collection("products").insertOne(product);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateProductStatus = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const { statusData } = req.body;
  const db = getDatabase();
  try {
    const result = await db
      .collection("products")
      .updateOne(filter, { $set: statusData });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteProduct = async (req, res) => {
  const id = req.params.id;
  const db = getDatabase();
  const query = { _id: new ObjectId(id) };
  try {
    const result = await db.collection("products").deleteOne(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ---- Product End ----//

// ---- Order Start ----//
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, pageSize = 2, search = "" } = req.query;
    const db = getDatabase();
    const query = {};

    if (search) {
      query.$or = [
        { uid: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
        { orderTime: { $regex: search, $options: "i" } },
        { _id: { $regex: search, $options: "i" } },
      ];
    }

    const totalCount = await db.collection("orders").countDocuments(query);
    const result = await db
      .collection("orders")
      .find(query)
      .sort({ joinDate: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .toArray();

    res.json({ totalCount, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.updateOrderStatus = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const { statusData } = req.body;
  const db = getDatabase();
  try {
    const result = await db
      .collection("orders")
      .updateOne(filter, { $set: statusData });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateOrderDelivary = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const { statusData } = req.body;
  const db = getDatabase();
  try {
    const result = await db
      .collection("orders")
      .updateOne(filter, { $set: statusData });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteOrder = async (req, res) => {
  const id = req.params.id;
  const db = getDatabase();
  const query = { _id: new ObjectId(id) };
  try {
    const result = await db.collection("orders").deleteOne(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//---- Order End ------//
exports.createUser = async (req, res) => {
  const { user } = req.body;
  const db = getDatabase();
  try {
    const result = await db.collection("users").insertOne(user);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = "" } = req.query;
    const db = getDatabase();
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    // Updated query to filter Active users
    query.status = true;

    const totalCount = await db.collection("users").countDocuments(query);
    const result = await db
      .collection("users")
      .find(query)
      .sort({ joinDate: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .toArray();

    res.json({ totalCount, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getBlockUsers = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = "" } = req.query;
    const db = getDatabase();
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Updated query to filter blocked users
    query.status = false;

    const totalCount = await db.collection("users").countDocuments(query);
    const result = await db
      .collection("users")
      .find(query)
      .sort({ joinDate: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .toArray();

    res.json({ totalCount, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getReseller = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = "", type } = req.query;
    const db = getDatabase();
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Updated query to filter blocked users
    query.resellerStatus =
      type == "pending"
        ? "Pending"
        : type == "approved"
        ? "Approved"
        : "Reject";

    const totalCount = await db.collection("users").countDocuments(query);
    const result = await db
      .collection("users")
      .find(query)
      .sort({ joinDate: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .toArray();

    res.json({ totalCount, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateResellerStatus = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const { statusData } = req.body;
  const db = getDatabase();
  try {
    const result = await db
      .collection("users")
      .updateOne(filter, { $set: statusData });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteReseller = async (req, res) => {
  const id = req.params.id;
  const db = getDatabase();
  const query = { _id: new ObjectId(id) };
  try {
    const statusData = {
      resellerStatus: "",
      type: "Normal",
      url: "",
    };
    const result = await db
      .collection("users")
      .updateOne(query, { $set: statusData });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const db = getDatabase();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await db.collection("users").findOne(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getTrackUser = async (req, res) => {
  try {
    const db = getDatabase();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const hQuery = { uid: id };
    const user = await db.collection("users").findOne(query);

    const wQuery = { uid: user.email };
    const history = await db
      .collection("history")
      .find(hQuery)
      .sort({ date: -1 })
      .limit(10)
      .toArray();
    const withdraw = await db
      .collection("withdraws")
      .find(wQuery)
      .sort({ date: -1 })
      .limit(10)
      .toArray();
    const jobSubmit = await db
      .collection("jobSubmit")
      .find(hQuery)
      .sort({ visitTime: -1 })
      .limit(10)
      .toArray();
    const directSubmit = await db
      .collection("directSubmit")
      .find(hQuery)
      .sort({ visitTime: -1 })
      .limit(10)
      .toArray();
    const global = await db.collection("global").find().toArray();
    res.send({
      user,
      history,
      withdraw,
      jobSubmit,
      directSubmit,
      global: global[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getTrackWebUser = async (req, res) => {
  try {
    const db = getDatabase();
    const id = req.params.id;
    const query = { email: id };
    const hQuery = { uId: id };

    const user = await db.collection("users").findOne(query);

    const order = await db
      .collection("orders")
      .find(hQuery)
      .sort({ orderTime: -1 })
      .limit(10)
      .toArray();
    const global = await db.collection("utils").find().toArray();
    res.send({ user, order, global: global[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateUser = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const { user } = req.body;
  const db = getDatabase();
  try {
    const result = await db
      .collection("users")
      .updateOne(filter, { $set: user });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error no update" });
  }
};

exports.updateStatus = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const { statusData } = req.body;
  const db = getDatabase();
  try {
    const result = await db
      .collection("users")
      .updateOne(filter, { $set: statusData });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  const id = req.params.id;
  const db = getDatabase();
  const query = { _id: new ObjectId(id) };
  try {
    const user = await db.collection("users").findOne(query);
    const uQuery = { uId: user?.email };
    const hQuery = { uid: user?.email };
    await db.collection("withdraws").deleteMany(hQuery);
    await db.collection("orders").deleteMany(uQuery);
    await db.collection("history").deleteMany(hQuery);
    const result = await db.collection("users").deleteOne(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updatePassword = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const { passValues, date } = req.body;
  const db = getDatabase();
  try {
    const user = await db.collection("users").findOne(filter);
    if (bcrypt.compareSync(passValues.newPass, user.password)) {
      return res.send({ Error: "Same password try another!" });
    }
    const hashedPassword = bcrypt.hashSync(passValues.newPass, 10);
    const result = await db
      .collection("users")
      .updateOne(filter, { $set: { password: hashedPassword } });
    const userHis = {
      uid: id,
      type: "Pass Change",
      amount: parseInt(0),
      by: "Admin",
      date,
    };
    await db.collection("history").insertOne(userHis);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.claimUserBouns = async (req, res) => {
  const dhakaTime = await getCurrentDateTimeInDhaka();
  const formattedDhakaTime = formatDateTime(dhakaTime);
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const { bonusValue } = req.body;
  const db = getDatabase();
  try {
    const user = await db.collection("users").findOne(filter);
    const remainingBalance =
      parseInt(user?.balance) + parseInt(bonusValue?.amount);
    const result = await db
      .collection("users")
      .updateOne(filter, { $set: { balance: parseInt(remainingBalance) } });
    const userHis = {
      uid: id,
      type: "Bonus",
      amount: parseInt(bonusValue?.amount),
      by: "Admin",
      date: formattedDhakaTime,
      status: true,
    };
    await db.collection("history").insertOne(userHis);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.sendNotice = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const { noticeValue } = req.body;
  const db = getDatabase();
  try {
    const result = await db
      .collection("users")
      .updateOne(filter, { $set: { notice: noticeValue.notice } });
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getaccounts = async (req, res) => {
  try {
    const db = getDatabase();
    const result = await db.collection("accounts").find().toArray();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.setUsersDueStatus = async (req, res) => {
  try {
    const db = getDatabase();
    const updateBillStatus = {
      $set: {
        billStatus: "Due",
      },
    };
    const result = await db
      .collection("users")
      .updateMany({}, updateBillStatus);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error No Update" });
  }
};

exports.getAdminStat = async (req, res) => {
  try {
    const db = getDatabase();
    const pendingWithdraw = await db
      .collection("withdraws")
      .countDocuments({ status: "Pending" });
    const completeWithdraw = await db
      .collection("withdraws")
      .countDocuments({ status: "Approved" });
    const totalUser = await db.collection("users").countDocuments();
    const activeUser = await db
      .collection("users")
      .countDocuments({ status: true });
    const reseller = await db
      .collection("users")
      .countDocuments({ resellerStatus: "Approved" });
    const BanUser = await db
      .collection("users")
      .countDocuments({ status: false });
    const totalOrder = await db.collection("orders").countDocuments();
    const completeOrder = await db
      .collection("orders")
      .countDocuments({ status: "Complete" });
    const pendingOrder = await db
      .collection("orders")
      .countDocuments({ status: "Pending" });
    res.send({
      pendingWithdraw,
      completeWithdraw,
      totalUser,
      activeUser,
      reseller,
      BanUser,
      totalOrder,
      completeOrder,
      pendingOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
