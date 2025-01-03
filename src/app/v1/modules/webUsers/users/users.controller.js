const { ObjectId } = require("mongodb");
const { getDatabase } = require("../../../../../utils/database");
const { generateReferCode, generateUserUit } = require("./users.utils");
const bcrypt = require("bcryptjs");
const { parse, format } = require("date-fns");

const {
  getCurrentDateTimeInDhaka,
  formatDateTime,
} = require("../../../../../utils/currentDateTime");
const getBangladeshDateTime = require("../../../../../utils/currentDateTime");

exports.webUtils = async (req, res) => {
  const db = getDatabase();
  const utils = await db.collection("utils").find().toArray();
  const categorys = await db.collection("categories").find().toArray();
  const products = await db.collection("products").find().limit(20).toArray();
  const result = utils[0];
  res.send({ result, categorys, products });
};

exports.getWebProducts = async (req, res) => {
  const db = getDatabase();
  const { categoryId } = req.query;

  let query = {};
  if (categoryId) {
    query = { categoryId: categoryId }; // Assumes categoryId is a field in your products collection
  }

  try {
    const products = await db.collection("products").find(query).toArray();
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch products", error });
  }
};

exports.webOrder = async (req, res) => {
  const db = getDatabase();
  const order = req.body;
  const result = await db.collection("orders").insertOne(order);
  res.send(result);
};

exports.getResellerSell = async (req, res) => {
  try {
    const db = getDatabase();
    const id = req.params.id;
    const query = { refMe: id };
    const result = await db.collection("orders").find(query).toArray();

    // Sort the results by orderTime in descending order
    result.sort((a, b) => {
      const dateA = parse(a.orderTime, "dd-MM-yyyy h:mm:ss a", new Date());
      const dateB = parse(b.orderTime, "dd-MM-yyyy h:mm:ss a", new Date());
      return dateB - dateA; // Descending order
    });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getWebOrder = async (req, res) => {
  try {
    const db = getDatabase();
    const id = req.params.id;
    const query = { uId: id };
    const result = await db.collection("orders").find(query).toArray();

    // Sort the results by orderTime in descending order
    result.sort((a, b) => {
      const dateA = parse(a.orderTime, "dd-MM-yyyy h:mm:ss a", new Date());
      const dateB = parse(b.orderTime, "dd-MM-yyyy h:mm:ss a", new Date());
      return dateB - dateA; // Descending order
    });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.getWebProduct = async (req, res) => {
  try {
    const db = getDatabase();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await db.collection("products").findOne(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.webAllUsers = async (req, res) => {
  const db = getDatabase();
  const user = await db
    .collection("users")
    .find({ balance: { $gt: "2" } })
    .toArray();
  res.json({ user });
};
exports.webUserLogin = async (req, res) => {
  const db = getDatabase();
  const { email, password } = req.body;

  const user = await db.collection("users").findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.json({ Error: "Invalid email or password" });
  }
  if (!user.status) {
    return res.json({ Error: "Account Blocked Contact Admin" });
  }

  const existingDevice = await db.collection("users").findOne({
    $and: [{ email }],
  });

  if (existingDevice) {
    res.json({ auth: true, email });
  } else {
    return res.json({
      Error: "This device is already associated. Contact Admin",
    });
  }
};

exports.webUserRegister = async (req, res) => {

  const db = getDatabase();
  const { name, email, password, referId, phone } = req.body;
  let referCode = generateReferCode();
  const existingreferCode = await db.collection("users").findOne({ referCode });
  while (existingreferCode) {
    referCode = generateReferCode();
    existingreferCode = await db.collection("users").findOne({ referCode });
  }

  const existingUser = await db
    .collection("users")
    .findOne({ $or: [{ email }] });
  if (existingUser) {
    return res.json({ Error: "User already exists" });
  }

  let refBy = [];

  if (referId) {
    const existingreferID = await db
      .collection("users")
      .findOne({ referCode: referId });
    if (existingreferID) {
      refBy = existingreferID.refBy;
      refBy.push({ refer: referCode, uId: email });

      await db.collection("users").updateOne(
        { referCode: referId },
        {
          $set: {
            refBy: refBy,
          },
        }
      );
    } else {
      return res.json({ Error: "Refer ID is not valid!" });
    }
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const refMeUser = await db
    .collection("users")
    .findOne({ referCode: referId });

  const result = await db.collection("users").insertOne({
    name,
    email,
    phone,
    password: hashedPassword,
    referCode,
    status: true,
    balance: parseInt(0),
    refBy: [],
    refMe: refMeUser?.email,
    notice: "আপনাকে স্বাগতম",
    comStatus: true,
    joinDate: getBangladeshDateTime(),
    type: "Normal",
  });
  res.json({ result, auth: true });
};

exports.updateApplyReseller = async (req, res) => {
  const id = req.params.id;
  const filter = { email: id };
  const { reseller } = req.body;
  const db = getDatabase();
  try {
    const result = await db
      .collection("users")
      .updateOne(filter, { $set: reseller });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updatePassword = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const { passValues } = req.body;
  const db = getDatabase();
  try {
    const user = await db.collection("users").findOne(filter);
    if (!user || !bcrypt.compareSync(passValues.oldPass, user.password)) {
      return res.send({ Error: "Invalid password try again!" });
    }
    const hashedPassword = bcrypt.hashSync(passValues.newPass, 10);
    const result = await db
      .collection("users")
      .updateOne(filter, { $set: { password: hashedPassword } });
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const db = getDatabase();
  const userQuery = { _id: new ObjectId(id) };

  const session = db.startSession();

  try {
    session.startTransaction();

    const user = await db.collection("users").findOne(userQuery, { session });

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "User not found" });
    }

    const orderQuery = { uId: user.email };

    const deleteUserResult = await db
      .collection("users")
      .deleteOne(userQuery, { session });
    if (deleteUserResult.deletedCount === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ error: "Failed to delete user" });
    }

    const deleteOrdersResult = await db
      .collection("orders")
      .deleteMany(orderQuery, { session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "User and associated orders deleted successfully",
      userDeletionCount: deleteUserResult.deletedCount,
      ordersDeletionCount: deleteOrdersResult.deletedCount,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting user and orders:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
