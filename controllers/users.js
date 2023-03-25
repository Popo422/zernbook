import User from "../models/User.js";
/* Read */

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, picturePath, location, occupation }) => {
        return { _id, firstName, lastName, picturePath, location, occupation };
      }
    );  //babalik lang friend list mo sa frontend
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);
    if (user.friends.includes(friendId)) {
      //logic para tangalin ung friend mo sa friendlist
      user.friends = user.friends.filter((id) => id !== friendId); //babalik arrray ng mga friends na di na kasama ung friendId
      friend.friends = friend.friends.filter((id) => id !== id); //pag tinagal mo friend mo dapat ung frined mo ttangalin ka din
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, picturePath, location, occupation }) => {
        return { _id, firstName, lastName, picturePath, location, occupation };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
 
  }
};
