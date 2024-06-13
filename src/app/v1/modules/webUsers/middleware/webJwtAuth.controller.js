const { getDatabase } = require("../../../../../utils/database");
require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.webGenerateToken = (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });

  // Set the token as an HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: true, // Set to true if your server is running over HTTPS
    sameSite: "strict", // Adjust according to your security requirements
    maxAge: 2 * 60 * 60 * 1000, // Max age of the cookie in milliseconds (2 hours)
  });

  res.send({ token, email: user.email });
};
exports.checkWebUser = async (req, res) => {
  const email = req.params.email;
  const db = getDatabase();
  if (req.decoded.email !== email) {
    res.send({ webUser: false });
  }

  const query = { email: email };
  const jobQuery = { status: true };
  const data = await db.collection("users").findOne(query);
  const hQuery = { uid: data?._id.toString() };
  const user = {
    status: data?.status,
    name: data?.name,
    email: data?.email,
    balance: data?.balance,
    notice: data?.notice,
    phone: data?.phone,
    refBy: data?.refBy,
    referCode: data?.referCode,
    comStatus: data?.comStatus,
    id: data?._id,
    type: data?.type,
    govId: data?.govId,
    resellerStatus: data?.resellerStatus,
    url: data?.url,
  };
  const history = await db
    .collection("history")
    .find(hQuery)
    .sort({ date: -1 })
    .limit(10)
    .toArray();
  const direct = await db
    .collection("directlinks")
    .find(jobQuery)
    .sort({ published: -1 })
    .limit(10)
    .toArray();
  const global = await db.collection("utils").find().toArray();
  const jdata = await db
    .collection("jobs")
    .find(jobQuery)
    .sort({ published: -1 })
    .limit(10)
    .toArray();
  const jobs = jdata.filter((job) => {
    const vacancy = job.vacancy;
    const attempt = job.attempt;
    // Exclude jobs where vacancy and attempt are the same
    if (vacancy === attempt) {
      return false;
    }
    // Exclude jobs where attempt is greater than or equal to vacancy
    if (attempt >= vacancy) {
      return false;
    }
    // Exclude jobs where attempt is negative
    if (attempt < 0) {
      return false;
    }
    // Include all other jobs
    return true;
  });
  const result = {
    webUser: data?.status === true,
    user,
    global: global[0],
    jobs,
    direct,
    history,
  };
  res.send(result);
};

exports.webSeed = async (req, res) => {
  const db = getDatabase();
  const admin = await db.collection("admins").insertOne({
    name: "Super Admin",
    email: "super@airdrop2pay.com",
    role: "admin",
    status: true,
  });

  const directSubmit = await db.collection("directSubmit").insertOne({
    visitTime: "200",
  });

  const directlinks = await db.collection("directlinks").insertOne({
    count: 783,
  });

  const history = await db.collection("history").insertOne({
    count: 783,
  });

  const jobSubmit = await db.collection("jobSubmit").insertOne({
    amount: 783,
  });
  const visitSubmit = await db.collection("visitSubmit").insertOne({
    amount: 783,
  });
  const visitearns = await db.collection("visitearns").insertOne({
    status: false,
  });
  const withdraws = await db.collection("withdraws").insertOne({
    withdrawNumber: "0125215525",
    mathod: "Bkash Personal",
    uid: "test@gmail.com",
    outAmount: { $numberDouble: "0.5" },
    status: "Pending",
    date: "04-04-2024 9:34:02 AM",
  });
  const users = await db.collection("users").insertOne({
    name: "test User",
    email: "test@gmail.com",
    phone: "0141660000",
    password: "$2a$10$Q3mwk1WHr6XBJCySDG2x6ej4Fl8BXSwYrXLwgziR51PeoA/wiqdau",
    referCode: "JB",
    status: true,
    balance: "0.0000",
    refBy: [],
    notice: "আপনাকে স্বাগতম",
    comStatus: true,
    joinDate: "04-04-2024 6:59:27 AM",
    uit: "AZ4",
  });
  const jobs = await db.collection("jobs").insertOne({
    title: "টেলিগ্রামে যুক্ত/Add জব!",
    vacancy: { $numberInt: "100" },
    attempt: { $numberInt: "100" },
    img: "https://i.ibb.co/gMmQBpV/images-2024-04-03-T051328-573.jpg",
    jobPrice: { $numberDouble: "0.0046" },
    description: [
      { text: "নিচের টেলিগ্রাফ গ্রুপ জয়েন হয়ে নিন" },
      { text: "টেলিগ্রাম লিংক:  https://t.me/" },
    ],
    status: true,
    published: "2024",
  });
  const global = await db.collection("global").insertOne({
    topNews:
      "⚠️যারা আমাদের টেলিগ্রাম এ প্রতিদিন এর আপডেট যানতে এখোনো Add করেননি তাদের একাউন্ট ব্যান হয়ে গেলে website দায়ী নয়।\n\n➡️ যারা জব পোস্ট দিতে চাচ্ছেন তারা 01303850197 এই নম্বরে হোয়াটসঅ্যাপে যোগাযোগ করুন। \n\nমিনিমাম ডিপোজিট ৫০০/- টাকা।\nবিস্তারিত জানতে হোয়াটসঅ্যাপ মেসেজ করুন।\n\n💥 যারা মোবাইল দিয়ে প্রিমিয়াম কোয়ালিটির কার্টুন তৈরি করতে চান তাদের জন্য আমাদের একটা কোর্স এসেছে, কোর্স নিতে হোয়াটসঅ্যাপ নম্বরে যোগাযোগ করুন। ",
    telegramChannel: "https://t.me/mtfetech",
    telegramGroup: "https://t.me/mtfetech",
    dailyNews:
      "✨প্রতিদিন $0.015 ডলার (১.৬৪ টাকা) ফ্রি রিসিভ করবেন।📍ডেইলি চেকিং অপশনে প্রবেশ করে আপনার বোনাস কালেক্ট করে নিন।",
    refNews:
      "✨রেফার করলেই আপনি $0.018 ডলার (২ টাকা) পেয়ে যাবেন। ⚠️একই ডিভাইস থেকে দুটি একাউন্ট খুললেই একাউন্ট ব্যান হয়ে যাবে অটোমেটিক ১৫ মিনিটের মধ্যে। সুতরাং ফেক রেফার অথবা একই ডিভাইস থেকে একের অধিক একাউন্ট কথা থেকে বিরত থাকুন!🚩",
    dailyCommission: { $numberDouble: "0.015" },
    withdrawType: [
      {
        name: "Bkash Personal",
        logo: "https://seeklogo.com/images/B/bkash-logo-FBB258B90F-seeklogo.com.png",
        details:
          "The money will be sent directly to the Baksh that is associated with the same email as your bKash account.",
      },
      {
        name: "Nagad Personal",
        logo: "https://seeklogo.com/images/N/nagad-logo-AA1B37DF1B-seeklogo.com.png",
        details:
          "Use your Nagad Gift Card* towards Books, Electronics, Music, and more.",
      },
      {
        name: "Binance",
        logo: "https://logolook.net/wp-content/uploads/2022/06/Binance-Logo.png",
        details:
          "The money will be sent directly to the Binance that is associated with the same email as your Binance account.",
      },
      {
        name: "Payeer",
        logo: "https://iconape.com/wp-content/png_logo_vector/payeer-logo.png",
        details:
          "The money will be sent directly to the Payeer that is associated with the same email as your Payeer account.",
      },
    ],
    withdrawRules: {
      maxAmount: { $numberInt: "100" },
      minAmount: { $numberDouble: "0.5" },
      outAmount: { $numberDouble: "0.046" },
      minRef: { $numberInt: "0" },
      withTime: "10AM 5PM",
    },
    referBonus: { $numberInt: "0" },
  });

  res.json({
    admin,
    global,
    jobs,
    users,
    history,
    withdraws,
    visitearns,
    visitSubmit,
    jobSubmit,
    directlinks,
    directSubmit,
  });
};
