import React from "react";

export default function Navbar({ setPage }) {
  return (
    <div style={{marginBottom:20}}>
      <button onClick={()=>setPage("home")}>Home</button>
      <button onClick={()=>setPage("products")}>Products</button>
    </div>
  );
}