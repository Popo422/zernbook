import Post from "../models/Posts.js";
import User from "../models/User.js";

/* Create */

export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });
    await newPost.save();

    const post = await Post.find();
    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { id } = req.params; //id being the posts id , userId sino nag post
    const { userId, description, picturePath, userPicture, name } = req.body;
    console.log(req.body);
    const post = await Post.findById(id);
    const comment = {
      description: description,
      userId: userId,
      picturePath: picturePath,
      userPicture: userPicture,
      name: name,
    };
    post.comments.push(comment);
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { comments: post.comments },
      { new: true }
    );
    res.status(201).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* Read*/
export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find();
    res.status(201).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
    res.status(201).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* Update */
export const likePosts = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id); //grabbing te post
    const isLiked = post.likes.get(userId); //checking if user liked the post
    if (isLiked) {
      post.likes.delete(userId); //delete if user liked it
    } else {
      post.likes.set(userId, true); //set it to true if di pa nalilike
    }
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(201).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
