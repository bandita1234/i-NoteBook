const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');


const User = require("../models/User");

const JWT_SECRET = "hello.there.bandita.here";

// router.get("/", (req, res) => {

// obj = {
//     name : "Bandita",
//     age : 20
// }
// res.json(obj);

//CREATE A USER USING: POST './api/auth/createuser' , NO AUTHENTICATION REQUIRED (So instead of get-> post)
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

      var salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });


      const data = {
        user:{
          id:user.id
        }
      }

      const jwtData = jwt.sign(data,JWT_SECRET);

      res.send(user);

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Error Occured!");
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
module.exports = router;
