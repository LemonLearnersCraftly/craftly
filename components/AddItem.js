import { useState } from "react";
import { addData } from "../utils/firestore";
import { collection, addDoc } from "firebase/firestore";

const AddItem = () => {
  const [value, setValue] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    await addData("something", { name: value });
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
