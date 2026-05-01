import React, { useState } from "react";
import Login from "./Login";
import Products from "./Products";
import Navbar from "./Navbar";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div style={{padding:40}}>
      <Navbar setPage={setPage} />
      
      {page === "home" && <h1>Welcome {user}</h1>}
      {page === "products" && <Products />}
    </div>
  );
}