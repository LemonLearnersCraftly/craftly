import { useState } from "react";
import { addData, updateData } from "../utils/firestore";
import { UserSchema, UserConverter } from "../models/Users";
import { PostSchema, PostConverter } from "../models/Posts";

const AddItem = () => {
  const [value, setValue] = useState("");
  const newUser = new UserSchema("", "sanchit", "sanchitjain200327");
  const newPost = new PostSchema(
    "",
    ["something.png", "hello.png"],
    true,
    "sanchit",
    0,
    [],
    true
  );
  newPost.addLike();
  newUser.addFollowing("priyanshs");
  const userData = JSON.stringify(newUser);
  // console.log(JSON.stringify(newUser));
  const handleSubmit = async (event) => {
    event.preventDefault();
    await addData("Users", newUser, UserConverter);
    await addData("Posts", newPost, PostConverter);
    // await updateData("Users", newUser.toJSON());
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a new item"
      />
      <button type="submit">Add Item</button>
    </form>
  );
};

export default AddItem;
