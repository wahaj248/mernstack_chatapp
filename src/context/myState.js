import React, {  useState } from "react";
import MyContext from "./myContext";
const MyState = ({ children }) => {
  const [socketConnection, setSocketConnection] = useState(null);

  return (
    <MyContext.Provider
      value={{  socketConnection , setSocketConnection}}
    >
      {children}
    </MyContext.Provider>
  );
};

export default MyState;
