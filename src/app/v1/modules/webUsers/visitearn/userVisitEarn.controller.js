const { ObjectId } = require("mongodb");
const { getDatabase } = require("../../../../../utils/database");
const {
  getCurrentDateTimeInDhaka,
  formatDateTime,
} = require("../../../../../utils/currentDateTime");
const getBangladeshDateTime = require("../../../../../utils/currentDateTime");

exports.getVisitEarns = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = "" } = req.query;
    const db = getDatabase();
    const query = {};

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }];
    }
    // Updated query to filter Active users
    query.status = true;

    const totalCount = await db.collection("visitearns").countDocuments(query);
    const result = await db
      .collection("visitearns")
      .find(query)
      .sort({ published: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .toArray();

    res.json({ totalCount, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getVisitEarn = async (req, res) => {
  try {
    const db = getDatabase();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await db.collection("visitearns").findOne(query);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.setVisitClaim = async (req, res) => {
  const { vId } = req.body;
  const db = getDatabase();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const vQuery = { _id: new ObjectId(vId) };
  const dQuery = { uid: id, jobid: vId };
  try {
    const user = await db.collection("users").findOne(query);
    const visit = await db.collection("visitearns").findOne(vQuery);

    const visitCheck = await db
      .collection("visitSubmit")
      .find(dQuery)
      .toArray();
    if (visitCheck.length > 0) {
      return res.send({ Error: `Already completed this task` });
    }
    await db
      .collection("visitSubmit")
      .insertOne({
        uid: id,
        jobid: vId,
        visitTime: getBangladeshDateTime(),
        status: "Complete",
        amount: visit.amount,
      });

    const remainingBalance = parseInt(user?.balance) + parseInt(visit.amount);
    const totalVisit = parseInt(visit?.count) + parseInt(1);

    await db
      .collection("visitearns")
      .updateOne(vQuery, { $set: { count: totalVisit } });

    const userHis = {
      uid: user._id.toString(),
      type: `Visit Earn`,
      amount: parseInt(visit.amount),
      by: "User",
      date: getBangladeshDateTime(),
      status: true,
    };
    await db.collection("history").insertOne(userHis);

    const result = await db
      .collection("users")
      .updateOne(query, {
        $set: { balance: parseInt(remainingBalance).toFixed(4) },
      });
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Direct Link
exports.getDirectLink = async (req, res) => {
  try {
    const db = getDatabase();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await db.collection("directlinks").findOne(query);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createDirectLink = async (req, res) => {
  const { vId } = req.body;
  const db = getDatabase();
  const id = req.params.id;
  const vQuery = { _id: new ObjectId(vId) };
  const dQuery = { uid: id, jobid: vId };
  try {
    const visit = await db.collection("directlinks").findOne(vQuery);
    const totalVisit = parseInt(visit?.count) + parseInt(1);
    const directCheck = await db
      .collection("directSubmit")
      .find(dQuery)
      .toArray();
    if (directCheck.length > 0) {
      return res.send({ Error: `Already completed this task` });
    }
    const result = await db
      .collection("directSubmit")
      .insertOne({
        uid: id,
        jobid: vId,
        visitTime: getBangladeshDateTime(),
        subTime: "",
        prof: "",
        status: "Pending",
        amount: visit.amount,
      });
    await db
      .collection("directlinks")
      .updateOne(vQuery, { $set: { count: totalVisit } });
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateDirectLink = async (req, res) => {
  const { vId, prof, subTime } = req.body;
  const db = getDatabase();
  const id = req.params.id;
  const vQuery = { uid: id, jobid: vId };
  try {
    const result = await db
      .collection("directSubmit")
      .updateOne(vQuery, {
        $set: { prof, subTime: getBangladeshDateTime(), status: "Submit" },
      });
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
