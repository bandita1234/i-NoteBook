const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var fetchUser = require('../middleware/fetchUser');

const User = require("../models/User");

const JWT_SECRET = "hello.there.bandita.here";

// router.get("/", (req, res) => {

// obj = {
//     name : "Bandita",
//     age : 20
// }
// res.json(obj);

//ROUTE 1: CREATE A USER USING: POST './api/auth/createuser' , NO AUTHENTICATION(LOGIN) REQUIRED (So instead of get-> post)
router.post(
  "/createuser",
  [
    //name must be at least 3 chars long
    body("name", "Enter a valid name").isLength({ min: 3 }),
    // email must be an valid email
    body("email", "Enter a valid email").isEmail(),
    // password must be at least 5 chars long
    body("password", "password must be at least 5 character long").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // console.log(req.body);
    // res.send("Hello,Bandita!"); // to see this in console...app.use(express.json()) is required

    // const user = User(req.body);
    // user.save();

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //check whether the user with same email exists already
    try {
      let user = await User.findOne({ email: req.body.email }); //As this is a promise,we have to include await
      // console.log(user);
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry! A user with this email already exists!" });
      }

      //Salting and Hashing of passwords
      var salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      //JWT Authentication
      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);
      // console.log(authtoken);
      // res.send(user); instead of user, we'll send authtoken

      res.json({ authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server Error!");
    }

    //   .then((user) => res.json(user))
    //   .catch((err) => {console.log(err)
    // res.json({
    //   error: "please enter an unique value for email",
    //   message: err.message,
    // })})

    // res.send(req.body); //As we've already done res.json...so need to do this
  }
);

//ROUTE 2: AUTHENTICATE A USER USING: POST './api/auth/login' , NO AUTHENTICATION REQUIRED (So instead of get-> post)
router.post(
  "/login",
  [
    // email must be an valid email
    body("email", "Enter a valid email").isEmail(),
    // password can't be empty
    body("password", "password can't be black").exists(),
  ],

  async (req, res) => {
    //If there are any errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //To get email and password from req.body and
    const { email, password } = req.body;

    try {
      //Pull the user from the database whose email = entered email
      let user = await User.findOne({ email });

      //If the user does not exist
      if (!user) {
        return res
          .status(400)
          .json({ Error: "please enter a correct credentials! " });
      }

      //To compare the entered password with the existing password use .compare method
      const passwordCompare = await bcrypt.compare(password, user.password);
      //If password doesnot match
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ Error: "please enter a correct credentials! " });
      }

      //If password is correct,Send the user data(id)
      const data = {
        user: {
          id: user.id,
        },
      };
      //Also, send the authtoken
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({ authtoken });
    } catch (error) {
      //Same as before
      console.error(error.message);
      res.status(500).send("Internal server Error!");
    }
  }
);

//ROUTE 3: GET LOGGEDIN USER DETAILS USING: POST './api/auth/getuser' ,  AUTHENTICATION(LOGIN) REQUIRED

router.post("/getuser", fetchUser, async (req, res) => {

  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user);
  } catch(error) {
    //Same as before
    console.error(error.message);
    res.status(500).send("Internal server Error!");
  }
  //We have to docode the authtoken then get the user id.
  //Create a middleware and pass it before async function here

  //Then '.api/auth/getuser' apend authtoken in the header,then send the request
});

module.exports = router;
