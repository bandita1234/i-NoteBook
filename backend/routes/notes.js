const express = require("express");
const router = express.Router();
var fetchUser = require("../middleware/fetchUser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

//ROUTE 1: GET ALL THE NOTES USING: GET './api/notes/fetchallnotes' , LOGIN REQUIRED

router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id }); //find all the notes where user= req.user and find by user id so re.user.id
    res.json(notes);
    //Now,send the request
  } catch (error) {
    //Same as before
    console.error(error.message);
    res.status(500).send("Internal server Error!");
  }
});

//ROUTE 2: ADD THE NOTES USING: GET './api/notes/addnote' , LOGIN REQUIRED
//here,validation is required

router.get(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body(
      "description",
      "description must be at least 5 character long"
    ).isLength({
      min: 5,
    }),
  ],

  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      //If there are errors, return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      //If no errors, create a new note
      const note = new Notes({
        //Also add user in Notes schema to know the user
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await note.save();
      res.json(saveNote);

    } catch (error) {
      //Same as before
      console.error(error.message);
      res.status(500).send("Internal server Error!");
    }
  }
);

module.exports = router;
