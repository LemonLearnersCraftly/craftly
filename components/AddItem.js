import { useState } from "react";
import { addData, updateData } from "../utils/firestore";
import UserSchema from "../models/Users";

const AddItem = () => {
  const [value, setValue] = useState("");
  const newUser = new UserSchema("sanchitjain", "sanchitjain2003");
  newUser.setUserId("351lJuPLkCa2TJmPSYXt");
  newUser.addFollowing("priyanshsar96");
  const userData = JSON.stringify(newUser);
  // console.log(JSON.stringify(newUser));
  const handleSubmit = async (event) => {
    event.preventDefault();
    await updateData("Users", newUser.toJSON());
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
