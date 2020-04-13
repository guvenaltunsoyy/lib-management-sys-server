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

function getTwoDateDiff(date1, date2) {
  const difftime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(difftime / (1000 * 60 * 60 * 24));
  return diffDays;
}
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
  Books.findByIdAndUpdate(id, update, (err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

router.post("/give/book", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  await AssignedBooks.updateOne(
    {
      _id: req.body.assignedBookId,
    },
    { $set: { isReceipt: true } },
    (err, res2) => {
      if (err) {
        return res.json({ success: false });
      }
    }
  );
  var book = await Books.findOne({ _id: req.body.bookId });
  Books.findByIdAndUpdate(
    book._id,
    {
      quantity: book.quantity + 1,
    },
    (err, r) => {
      if (err) {
        console.log("book not updated", err);
        return res.json({ success: false });
      }
      console.log("book updated");
      return res.json({ success: true });
    }
  );
});

router.post("/assign/book", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  var add = true;
  var date = new Date(req.body.date);
  var assignedBooksToUser = await AssignedBooks.find({
    userId: req.body.userId,
  });
  if (assignedBooksToUser !== undefined || assignedBooksToUser !== null) {
    var notReceiptBooks = assignedBooksToUser.filter(
      (record) => !record.isReceipt
    );
    if (notReceiptBooks.length >= 3) {
      res.end(
        JSON.stringify({
          result: false,
          message: "Kullanıcı üzerinde 3 kitap mevcut.",
        })
      );
      return;
    }
    notReceiptBooks.map(
      (record) =>
        (add = getTwoDateDiff(date, record.createdAt) >= 7 ? false : add)
    );
  }
  if (add) {
    var book = await Books.findOne({ _id: req.body.bookId });
    if (book === undefined || book === null) {
      res.end(JSON.stringify({ result: false, message: "Kitap bulunamadı." }));
    } else if (book.quantity > 0) {
      var assignBook = new AssignedBooks();
      assignBook.userId = req.body.userId;
      assignBook.bookId = req.body.bookId;
      assignBook.isReceipt = false;
      AssignedBooks.create(assignBook, (err, assBook) => {
        if (err) {
          res.end(JSON.stringify({ result: false, message: err }));
        } else {
          Books.findByIdAndUpdate(
            assignBook.bookId,
            {
              quantity: book.quantity - 1,
            },
            (err, r) => {
              if (err) {
                console.log("book not updated", err);
              } else {
                console.log("book updated ");
              }
            }
          );
          console.log("success");
          res.end(
            JSON.stringify({
              result: true,
              message: "Kitap alma işlemi başarılı. İyi okumalar...",
            })
          );
        }
      });
    } else {
      res.end(
        JSON.stringify({
          result: false,
          message: "Kitap sayısı yeterli değil. Başka bir kitap seçiniz.",
        })
      );
    }
  } else {
    res.end(
      JSON.stringify({
        result: false,
        message:
          "Kullanıcının 7 günü aşkın süredir iade etmediği kitap mevcut.",
      })
    );
  }
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
    const {
      _id,
      name,
      surname,
      age,
      mail,
      schoolNumber,
      phoneNumber,
      isManager,
    } = user;

    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        user: {
          _id,
          name,
          surname,
          age,
          mail,
          schoolNumber,
          phoneNumber,
          isManager,
        },
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
