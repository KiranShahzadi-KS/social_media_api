const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/User"); // Make sure to import your User model

// Update user information by ID
router.put("/:id", async (req, res) => {
  try {
    // Check if the user making the request is the account owner or an admin
    if (req.body.userId === req.params.id || req.body.isAdmin) {
      if (req.body.password) {
        // If a new password is provided, hash it before updating
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }

      // Update the user's information
      const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });

      if (!updatedUser) {
        // Handle the case where the user with the given ID is not found
        return res.status(404).json("User not found");
      }

      res.status(200).json("Account has been updated");
    } else {
      // Unauthorized: User can only update their own account or admin can update any account
      return res
        .status(403)
        .json("You can update only your account or you are not authorized");
    }
  } catch (err) {
    // Handle server errors
    console.error(err);
    return res.status(500).json("Internal server error");
  }
});

//DELETE USER
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

//GET A USER

// GET A USER
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      // Handle the case where the user with the given ID is not found
      return res.status(404).json("User not found");
    }
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//FOLLOW A USER
// // FOLLOW A USER
// router.put("/:id/follow", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     const currentUser = await User.findById(req.body.userId);

//     if (!user) {
//       // Handle the case where the user to follow is not found
//       return res.status(404).json("User not found");
//     }

//     if (!currentUser) {
//       // Handle the case where the current user is not found
//       return res.status(404).json("Current user not found");
//     }

//     if (user.followers.includes(req.body.userId)) {
//       // Handle the case where the current user is already following the target user
//       return res.status(403).json("You are already following this user");
//     }

//     // Update the target user's followers and current user's followings
//     await user.updateOne({ $push: { followers: req.body.userId } });
//     await currentUser.updateOne({ $push: { followings: req.params.id } });

//     res.status(200).json("User has been followed");
//   } catch (err) {
//     // Handle any server errors
//     console.error(err);
//     res.status(500).json("Internal server error");
//   }
// });

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId != req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({
          $pull: { followings: req.params.id },
        });
        res.status(200).json("User has been unfollowed");
      } else {
        res.status(403).json("You don't follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't unfellow yourself");
  }
});

//unfollow a user

router.put("/:id/follow", async (req, res) => {
  if (req.body.userId != req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({
          $push: { followings: req.params.id },
        });
        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("You already fellow");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't fellow yourself");
  }
});

module.exports = router;
