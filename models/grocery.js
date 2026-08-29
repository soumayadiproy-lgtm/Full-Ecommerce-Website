let productsData = [];

let filteredData = [];

// 🔗 Fetch from backend
fetch("/api/products?category=grocery")
  .then(res => res.json())
  .then(data => {
    productsData = data;
    filteredData = data;
    displayProducts(data);
  })
  .catch(() => {
    // fallback demo data
    productsData = [
      { name: "Rice", price: 50, type: "rice", img: "https://via.placeholder.com/200" },
      { name: "Milk", price: 30, type: "dairy", img: "https://via.placeholder.com/200" },
      { name: "Apple", price: 120, type: "fruits", img: "https://via.placeholder.com/200" }
    ];
    filteredData = productsData;
    displayProducts(productsData);
  });

// 🛍️ Display
function displayProducts(data) {
  const container = document.getElementById("products");
  container.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
  <div class="badge">20% OFF</div>
  <img src="${item.img}">
  <h3>${item.name}</h3>
  <p>₹${item.price}</p>
  <button>Add to Cart</button>
`;

    container.appendChild(div);
  });
}

// 🔍 Category filter
function filterCategory(type) {
  if (type === "all") {
    filteredData = productsData;
  } else {
    filteredData = productsData.filter(p => p.type === type);
  }
  displayProducts(filteredData);
}

// 💰 Price filter
document.getElementById("priceRange").addEventListener("input", function () {
  const max = this.value;
  document.getElementById("priceValue").innerText = "Up to ₹" + max;

  const data = filteredData.filter(p => p.price <= max);
  displayProducts(data);
});

// 🔄 Clear filters
function clearFilters() {
  filteredData = productsData;
  document.getElementById("priceRange").value = 500;
  document.getElementById("priceValue").innerText = "Up to ₹500";
  displayProducts(productsData);
}

// 🛒 Cart
function addToCart(id) {
  alert("Added to cart 🛒");
}