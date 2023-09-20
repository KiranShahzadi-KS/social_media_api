const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Handle POST request to add a new message
router.post("/", async (req, res) => {
  try {
    // Create a new message using the request body
    const newMessage = new Message(req.body);

    // Save the new message to the database
    const savedMessage = await newMessage.save();

    // Respond with a 200 (OK) status code and the saved message in JSON format
    res.status(200).json(savedMessage);
  } catch (err) {
    // Handle any errors and send a 500 (Internal Server Error) response with the error message
    res.status(500).json({ error: err.message });
  }
});

// //get
// router.get("/conversationId", async (req, res) => {
//   try {
//     const message = await Message.find({
//       conversationId: req.params.conversationId,
//     });
//     res.status(200).json(message);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// Handle GET request to retrieve messages by conversationId
router.get("/:conversationId", async (req, res) => {
  try {
    // Find messages with the specified conversationId
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });

    // Respond with a 200 (OK) status code and the retrieved messages in JSON format
    res.status(200).json(messages);
  } catch (err) {
    // Handle any errors and send a 500 (Internal Server Error) response with the error message
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
