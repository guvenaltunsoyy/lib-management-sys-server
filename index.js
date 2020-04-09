const mongoose = require("mongoose");
const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
const Books = require("./Books");
const Users = require("./Users");
const AssignedBooks = require("./AssignedBooks");
const API_PORT = 3001;
const app = express();
app.use(cors());
const router = express.Router();

// this is our MongoDB database
const dbRoute =
  "mongodb+srv://guven:6516102@cluster0-tdrcz.mongodb.net/library-management-system?retryWrites=true&w=majority";

// connects our back end code with the database
mongoose.connect(dbRoute, { useNewUrlParser: true });

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

// this is our get method
// this method fetches all available data in our database
router.get("/getBooks", (req, res) => {
  Books.find((err, books) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, books });
  });
});
router.get("/getUsers", (req, res) => {
  Users.find((err, users) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, users });
  });
});
router.get("/getAssignedBooks", (req, res) => {
  AssignedBooks.find((err, assignedBooks) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, assignedBooks });
  });
});
// this is our update method
// this method overwrites existing data in our database
router.post("/updateBook", (req, res) => {
  const { title, author, quantity, isbnNumber } = req.body;
  Book.findByIdAndUpdate(id, update, (err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// this is our delete method
// this method removes existing data in our database
router.delete("/deleteBook", (req, res) => {
  const { id } = req.body;
  Book.findByIdAndRemove(id, (err) => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});

// LOGIN
router.post("/login", async (req, res) => {
  var user = await Users.findOne({ mail: req.body.mail });
  if (
    user === undefined ||
    user === null ||
    user.password !== req.body.password
  ) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ user: null }));
  } else {
    const { name, surname, age, mail, schoolNumber, phoneNumber } = user;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        user: { name, surname, age, mail, schoolNumber, phoneNumber },
      })
    );
  }
});

router.post("/addBook", (req, res) => {
  let data = new Books();
  console.log(req.body);

  const { title, author, quantity, isbnNumber } = JSON.parse(
    JSON.stringify(req.body)
  );
  console.log(title, author, quantity, isbnNumber);

  if ((!title && quantity !== 0) || !title) {
    return res.json({
      success: false,
      error: "INVALID INPUTS",
    });
  }
  data.title = title;
  data.author = author;
  data.quantity = quantity;
  data.isbnNumber = isbnNumber;
  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

router.post("/addUser", (req, res) => {
  let data = new Users();
  console.log(req.body);

  const { name, surname, age, mail, schoolNumber, phoneNumber } = JSON.parse(
    JSON.stringify(req.body)
  );

  if (name === undefined || schoolNumber === undefined) {
    console.log(false);
    return res.json({
      success: false,
      error: "INVALID INPUTS",
    });
  }
  data.name = name;
  data.surname = surname;
  data.age = age;
  data.mail = mail;
  data.schoolNumber = schoolNumber;
  data.phoneNumber = phoneNumber;
  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    console.log(true);
    return res.json({ success: true });
  });
});

router.post("/assignBook", (req, res) => {
  let data = new AssignedBooks();
  console.log(req.body);

  const { userId, bookId } = JSON.parse(JSON.stringify(req.body));

  if (userId === undefined || bookId === undefined) {
    console.log(false);
    return res.json({
      success: false,
      error: "INVALID INPUTS",
    });
  }
  data.userId = userId;
  data.bookId = bookId;
  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    console.log(true);
    return res.json({ success: true });
  });
});

// append /api for our http requests
app.use("/api", router);

// launch our backend into a port
app.listen(process.env.PORT || 3001, function () {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});
