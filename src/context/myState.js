import React, {  useState } from "react";
import MyContext from "./myContext";
const myState = ({ children }) => {
  const [mode, setMode] = useState("light");

  return (
    <MyContext.Provider
      value={{ mode }}
    >
      {children}
    </MyContext.Provider>
  );
};

export default myState;
