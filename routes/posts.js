const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
//CREATE A POST
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE POST
router.put("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  try {
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("The post has been updated");
    } else {
      res.status(403).json("You can only update your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE POST
router.delete("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  try {
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("The post has been deleted!");
    } else {
      res.status(403).json("You can only delete your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// LIKE / DISLIKE A POST
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); // Changed 'req, params.id' to 'req.params.id'
    if (!post.likes.includes(req.body.userId)) {
      // Changed 'res.body.userId' to 'req.body.userId'
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET A POST
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET A TIMELINE POST
// router.get("/timeline/all", async (req, res) => {
//   try {
//     const currentUser = await User.findById(req.body.userId);
//     const userPosts = await Post.find({ userId: currentUser._id });
//     const friendPosts = await Promise.all(
//       currentUser.followings.map((friendId) => {
//         return Post.find({ userId: friendId });
//       })
//     );
//     res.json(userPosts.concat(...friendPosts));
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// Handle GET request to fetch the timeline of posts for a user and their friends
router.get("/timeline/all", async (req, res) => {
  try {
    // Find the current user by their user ID from the request body
    const currentUser = await User.findById(req.body.userId);

    // Find posts created by the current user
    const userPosts = await Post.find({ userId: currentUser._id });

    // Find posts created by the user's friends
    const friendPosts = await Promise.all(
      currentUser.followings.map(async (friendId) => {
        const friendPosts = await Post.find({ userId: friendId });
        return friendPosts;
      })
    );

    // Concatenate the user's posts and their friends' posts into one array
    const timelinePosts = userPosts.concat(...friendPosts);

    res.json(timelinePosts);
  } catch (err) {
    // Handle any errors and send a 500 (Internal Server Error) response with the error message
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
