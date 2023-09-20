const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");

// Handle POST request to create a new conversation
router.post("/", async (req, res) => {
  try {
    // Create a new conversation with the senderId and receiverId from the request body
    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });

    // Save the new conversation to the database
    const savedConversation = await newConversation.save();

    // Respond with a 200 (OK) status code and the saved conversation in JSON format
    return res.status(200).json(savedConversation);
  } catch (err) {
    // Handle any errors and send a 500 (Internal Server Error) response with the error message
    res.status(500).json({ error: err.message });
  }
});

//GET A CONVERSATION OF A USER
router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
