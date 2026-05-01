import React from "react";

export default function Products() {
  const items = [
    { id: 1, name: "Shoes", price: 50 },
    { id: 2, name: "T-shirt", price: 25 },
    { id: 3, name: "Watch", price: 100 }
  ];

  return (
    <div>
      <h2>Products</h2>
      {items.map(item => (
        <div key={item.id} style={{border:"1px solid #ccc", padding:10, margin:10}}>
          <h3>{item.name}</h3>
          <p>${item.price}</p>
          <button>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}