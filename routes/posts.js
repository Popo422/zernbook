import express from "express";
import { createComment, getFeedPosts, getUserPosts, likePosts } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
router.post("/comments/:id/", verifyToken, createComment);
/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId", verifyToken, getUserPosts);
/* UPDATE */
router.patch("/:id/like", verifyToken, likePosts);
export default router;

