const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");
// ROUTE 1: Get Notes of a logged in user using : GET /api/notes/fetchallnotes. Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
});
// ROUTE 2: Add a new note of a logged in user using : POST /api/notes/addnote. Login required
router.post(
  "/addnote",
  fetchuser,
  [
    // Using Express Validator npm package website version 6.12.0
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be at least 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // If there are errors return Bad Request (express-validator)
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);
// ROUTE 3: Update an existing note of a logged in user using : PUT /api/notes/updatenote. Login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  // the ' : ' in id is showing that id is a params
  try {
    const { title, description, tag } = req.body;
    // Create a newNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (title) {
      newNote.tag = tag;
    }
    // Find the note to be updated
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return req.status(404).send("Note not found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
});
// ROUTE 4: Delete an existing note of a logged in user using : DELETE /api/notes/deletenote. Login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // const {title, description, tag} = req.body;
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Note not found");
    }
    // Allow deletion only when user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(404).send("Not Authorized");
    }
    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note deleted successfully", note: note });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
