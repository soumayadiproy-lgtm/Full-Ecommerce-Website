const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const User = require("../models/User");

// 🔐 AUTH
const { verifyToken, isAdmin } = require("../middleware/auth");

const fallbackProducts = [
    // ======= 👗 FASHION & GENERAL (100 items) =======
    // --- Clothes (40) ---
    { _id: "f1",   name: "Red Printed T-Shirt", price: 300, type: "clothes", category: "general", stock: 50, img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400" },
    { _id: "f2",   name: "Black Tracksuit", price: 500, type: "clothes", category: "general", stock: 50, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400" },
    { _id: "f3",   name: "Yellow Party Dress", price: 3000, type: "clothes", category: "general", stock: 20, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400" },
    { _id: "f4",   name: "White Shorts Girls", price: 2500, type: "clothes", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400" },
    { _id: "f8",   name: "Men Casual Dress", price: 1000, type: "clothes", category: "general", stock: 35, img: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400" },
    { _id: "f10",  name: "Men Tracksuit", price: 700, type: "clothes", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400" },
    { _id: "f25",  name: "Floral Summer Dress", price: 1200, type: "clothes", category: "general", stock: 45, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400" },
    { _id: "f26",  name: "Blue Denim Jacket", price: 2200, type: "clothes", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400" },
    { _id: "f27",  name: "Cotton Graphic Hoodie", price: 1400, type: "clothes", category: "general", stock: 40, img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400" },
    { _id: "f28",  name: "High-Waist Jeans", price: 1800, type: "clothes", category: "general", stock: 35, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400" },
    { _id: "f34",  name: "Classic Sunglasses", price: 850, type: "clothes", category: "general", stock: 50, img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400" },
    { _id: "f45",  name: "Men Slim Fit Shirt", price: 950, type: "clothes", category: "general", stock: 40, img: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400" },
    { _id: "f46",  name: "Women Crop Top", price: 600, type: "clothes", category: "general", stock: 50, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400" },
    { _id: "f47",  name: "Men Polo T-Shirt", price: 750, type: "clothes", category: "general", stock: 45, img: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=400" },
    { _id: "f48",  name: "Women Kurti Set", price: 1600, type: "clothes", category: "general", stock: 35, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { _id: "f49",  name: "Men Chino Pants", price: 1200, type: "clothes", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400" },
    { _id: "f50",  name: "Women Blazer", price: 3500, type: "clothes", category: "general", stock: 20, img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400" },
    { _id: "f51",  name: "Men Formal Shirt White", price: 1100, type: "clothes", category: "general", stock: 35, img: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400" },
    { _id: "f52",  name: "Girls Skirt Floral", price: 900, type: "clothes", category: "general", stock: 40, img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400" },
    { _id: "f53",  name: "Men Denim Shirt", price: 1400, type: "clothes", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400" },
    { _id: "f54",  name: "Women Palazzo Pants", price: 1100, type: "clothes", category: "general", stock: 40, img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400" },
    { _id: "f55",  name: "Men Round Neck Sweatshirt", price: 1300, type: "clothes", category: "general", stock: 35, img: "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=400" },
    { _id: "f56",  name: "Women Maxi Dress", price: 2800, type: "clothes", category: "general", stock: 20, img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400" },
    { _id: "f57",  name: "Men Jogger Pants", price: 900, type: "clothes", category: "general", stock: 45, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400" },
    { _id: "f58",  name: "Women Sports Bra", price: 700, type: "clothes", category: "general", stock: 50, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400" },
    { _id: "f59",  name: "Men Linen Shirt", price: 1250, type: "clothes", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=400" },
    { _id: "f60",  name: "Women Winter Coat", price: 4200, type: "clothes", category: "general", stock: 15, img: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=400" },
    { _id: "f61",  name: "Men Bomber Jacket", price: 3200, type: "clothes", category: "general", stock: 25, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" },
    { _id: "f62",  name: "Women Puffer Jacket", price: 3800, type: "clothes", category: "general", stock: 18, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400" },
    { _id: "f63",  name: "Men V-Neck Sweater", price: 1100, type: "clothes", category: "general", stock: 35, img: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400" },
    { _id: "f64",  name: "Women Cardigan", price: 1400, type: "clothes", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400" },
    { _id: "f65",  name: "Men Cargo Shorts", price: 850, type: "clothes", category: "general", stock: 45, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400" },
    { _id: "f66",  name: "Women Yoga Leggings", price: 1100, type: "clothes", category: "general", stock: 50, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400" },
    { _id: "f67",  name: "Men Casual Shorts", price: 650, type: "clothes", category: "general", stock: 50, img: "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400" },
    { _id: "f68",  name: "Women Off-Shoulder Top", price: 800, type: "clothes", category: "general", stock: 40, img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400" },
    { _id: "f69",  name: "Men Ethnic Kurta", price: 1350, type: "clothes", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { _id: "f70",  name: "Women Saree", price: 4500, type: "clothes", category: "general", stock: 10, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
    { _id: "f99",  name: "Men Sports Cap", price: 550, type: "clothes", category: "general", stock: 50, img: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400" },
    { _id: "f100", name: "Women Silk Scarf", price: 750, type: "clothes", category: "general", stock: 40, img: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400" },
    // --- Shoes (20) ---
    { _id: "f5",   name: "Grey Running Shoe", price: 2000, type: "shoes", category: "general", stock: 40, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { _id: "f7",   name: "Blue Sneakers", price: 500, type: "shoes", category: "general", stock: 50, img: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=400" },
    { _id: "f9",   name: "Girls Party Shoes", price: 1500, type: "shoes", category: "general", stock: 25, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
    { _id: "f29",  name: "Leather Formal Shoes", price: 3200, type: "shoes", category: "general", stock: 25, img: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400" },
    { _id: "f30",  name: "Athletic Sport Trainers", price: 2400, type: "shoes", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400" },
    { _id: "f71",  name: "Men Canvas Shoes", price: 1800, type: "shoes", category: "general", stock: 35, img: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=400" },
    { _id: "f72",  name: "Women High Heels", price: 2200, type: "shoes", category: "general", stock: 20, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
    { _id: "f73",  name: "Men Loafers", price: 2600, type: "shoes", category: "general", stock: 25, img: "https://images.unsplash.com/photo-1614252234498-9b5571339ce9?w=400" },
    { _id: "f74",  name: "Women Sandals", price: 1400, type: "shoes", category: "general", stock: 40, img: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400" },
    { _id: "f75",  name: "Men Chelsea Boots", price: 3800, type: "shoes", category: "general", stock: 15, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400" },
    { _id: "f76",  name: "Women Platform Shoes", price: 2800, type: "shoes", category: "general", stock: 20, img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400" },
    { _id: "f77",  name: "Men Sports Running Shoes", price: 3500, type: "shoes", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { _id: "f78",  name: "Women Ballet Flats", price: 1600, type: "shoes", category: "general", stock: 35, img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400" },
    { _id: "f79",  name: "Men Slip-On Shoes", price: 1900, type: "shoes", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1497706703565-29f70de0c4c3?w=400" },
    { _id: "f80",  name: "Women Ankle Boots", price: 3200, type: "shoes", category: "general", stock: 18, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400" },
    { _id: "f101", name: "Men Derby Shoes", price: 2700, type: "shoes", category: "general", stock: 22, img: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400" },
    { _id: "f102", name: "Women Espadrilles", price: 1500, type: "shoes", category: "general", stock: 28, img: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400" },
    { _id: "f103", name: "Men Trail Running Shoes", price: 4000, type: "shoes", category: "general", stock: 18, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { _id: "f104", name: "Women Mules", price: 1800, type: "shoes", category: "general", stock: 25, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
    { _id: "f105", name: "Kids Sneakers", price: 1200, type: "shoes", category: "general", stock: 35, img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400" },
    // --- Accessories & Electronics (40) ---
    { _id: "f6",   name: "Black Printed Handbag", price: 3000, type: "electronics", category: "general", stock: 15, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
    { _id: "f31",  name: "Smart Fitness Watch", price: 2999, type: "electronics", category: "general", stock: 20, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
    { _id: "f32",  name: "Wireless Headphones", price: 4500, type: "electronics", category: "general", stock: 15, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { _id: "f33",  name: "Leather Backpack", price: 1999, type: "electronics", category: "general", stock: 25, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
    { _id: "f81",  name: "Wireless Earbuds", price: 2200, type: "electronics", category: "general", stock: 20, img: "https://images.unsplash.com/photo-1590658165737-15a047b7c35e?w=400" },
    { _id: "f82",  name: "Stylish Wristwatch", price: 3500, type: "electronics", category: "general", stock: 18, img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400" },
    { _id: "f83",  name: "Women Tote Bag", price: 1800, type: "electronics", category: "general", stock: 25, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
    { _id: "f84",  name: "Men Leather Wallet", price: 900, type: "electronics", category: "general", stock: 40, img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400" },
    { _id: "f85",  name: "Aviator Sunglasses", price: 1200, type: "electronics", category: "general", stock: 35, img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400" },
    { _id: "f86",  name: "Phone Case Luxury", price: 599, type: "electronics", category: "general", stock: 60, img: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400" },
    { _id: "f87",  name: "Portable Charger 20000mAh", price: 1800, type: "electronics", category: "general", stock: 25, img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400" },
    { _id: "f88",  name: "Laptop Sleeve 15 inch", price: 1200, type: "electronics", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400" },
    { _id: "f89",  name: "Travel Duffel Bag", price: 2400, type: "electronics", category: "general", stock: 20, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
    { _id: "f90",  name: "Bluetooth Speaker", price: 3200, type: "electronics", category: "general", stock: 15, img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400" },
    { _id: "f91",  name: "Smart Band Fitness Tracker", price: 1500, type: "electronics", category: "general", stock: 25, img: "https://images.unsplash.com/photo-1557935728-e6d1eaabe559?w=400" },
    { _id: "f92",  name: "Women Pearl Necklace", price: 1800, type: "electronics", category: "general", stock: 20, img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400" },
    { _id: "f93",  name: "Men Leather Belt", price: 950, type: "electronics", category: "general", stock: 35, img: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400" },
    { _id: "f94",  name: "Women Clutch Bag", price: 1400, type: "electronics", category: "general", stock: 25, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
    { _id: "f95",  name: "Men Silk Tie", price: 1100, type: "electronics", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400" },
    { _id: "f96",  name: "Women Hair Accessories Set", price: 450, type: "electronics", category: "general", stock: 50, img: "https://images.unsplash.com/photo-1586495777744-4e6232bf2ebb?w=400" },
    { _id: "f97",  name: "Steel Water Bottle 1L", price: 800, type: "electronics", category: "general", stock: 45, img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400" },
    { _id: "f98",  name: "Digital Camera Bag", price: 1600, type: "electronics", category: "general", stock: 18, img: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400" },
    { _id: "f106", name: "Men's Bracelet Silver", price: 850, type: "electronics", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400" },
    { _id: "f107", name: "Women's Gold Earrings", price: 1200, type: "electronics", category: "general", stock: 25, img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400" },
    { _id: "f108", name: "Crossbody Sling Bag", price: 1600, type: "electronics", category: "general", stock: 22, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
    { _id: "f109", name: "Sunglasses Case", price: 350, type: "electronics", category: "general", stock: 50, img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400" },
    { _id: "f110", name: "Gym Gym Duffel Bag", price: 1900, type: "electronics", category: "general", stock: 20, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },

    // ======= 🥬 GROCERY (50 items) =======
    // --- Rice (7) ---
    { _id: "g1",  name: "Basmati Rice 5kg", price: 450, type: "rice", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { _id: "g2",  name: "Sona Masoori Rice 10kg", price: 650, type: "rice", category: "grocery", stock: 25, img: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400" },
    { _id: "g3",  name: "Organic Brown Rice 2kg", price: 320, type: "rice", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400" },
    { _id: "g4",  name: "Jasmine Rice 1kg", price: 180, type: "rice", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400" },
    { _id: "g5",  name: "Puffed Rice 500g", price: 60, type: "rice", category: "grocery", stock: 60, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { _id: "g6",  name: "Red Rice 2kg", price: 280, type: "rice", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400" },
    { _id: "g7",  name: "Parboiled Rice 5kg", price: 400, type: "rice", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400" },
    // --- Dairy (8) ---
    { _id: "g8",  name: "Fresh Organic Milk 1L", price: 60, type: "dairy", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { _id: "g9",  name: "Amul Butter 500g", price: 275, type: "dairy", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400" },
    { _id: "g10", name: "Fresh Cottage Cheese Paneer 200g", price: 95, type: "dairy", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400" },
    { _id: "g11", name: "Greek Yogurt 400g", price: 140, type: "dairy", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400" },
    { _id: "g12", name: "Mozzarella Cheese 200g", price: 220, type: "dairy", category: "grocery", stock: 25, img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400" },
    { _id: "g13", name: "Dahi Curd 500g", price: 45, type: "dairy", category: "grocery", stock: 55, img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400" },
    { _id: "g14", name: "Condensed Milk 400g", price: 130, type: "dairy", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { _id: "g15", name: "Salted Butter 100g", price: 80, type: "dairy", category: "grocery", stock: 45, img: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400" },
    // --- Fruits (8) ---
    { _id: "g16", name: "Fresh Red Apples 1kg", price: 180, type: "fruits", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400" },
    { _id: "g17", name: "Fresh Bananas 1 Dozen", price: 60, type: "fruits", category: "grocery", stock: 45, img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400" },
    { _id: "g18", name: "Sweet Oranges 1kg", price: 120, type: "fruits", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400" },
    { _id: "g19", name: "Fresh Mangoes 1kg", price: 350, type: "fruits", category: "grocery", stock: 25, img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400" },
    { _id: "g20", name: "Fresh Grapes 500g", price: 90, type: "fruits", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400" },
    { _id: "g21", name: "Fresh Papaya 1 piece", price: 80, type: "fruits", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400" },
    { _id: "g22", name: "Watermelon 1 piece", price: 120, type: "fruits", category: "grocery", stock: 20, img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400" },
    { _id: "g23", name: "Pineapple 1 piece", price: 100, type: "fruits", category: "grocery", stock: 25, img: "https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=400" },
    // --- Vegetables (8) ---
    { _id: "g24", name: "Farm Fresh Tomatoes 1kg", price: 40, type: "vegetables", category: "grocery", stock: 60, img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" },
    { _id: "g25", name: "Organic Potatoes 2kg", price: 70, type: "vegetables", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400" },
    { _id: "g26", name: "Fresh Spinach 250g", price: 30, type: "vegetables", category: "grocery", stock: 45, img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400" },
    { _id: "g27", name: "Fresh Carrots 1kg", price: 50, type: "vegetables", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400" },
    { _id: "g28", name: "Fresh Cauliflower 1 piece", price: 60, type: "vegetables", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1568584711271-6bf6a23ceff4?w=400" },
    { _id: "g29", name: "Fresh Broccoli 500g", price: 80, type: "vegetables", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400" },
    { _id: "g30", name: "Fresh Onions 2kg", price: 55, type: "vegetables", category: "grocery", stock: 55, img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400" },
    { _id: "g31", name: "Green Capsicum 500g", price: 65, type: "vegetables", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400" },
    // --- Snacks (8) ---
    { _id: "g32", name: "Classic Potato Chips 150g", price: 30, type: "snacks", category: "grocery", stock: 80, img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400" },
    { _id: "g33", name: "Crispy Bhujia Sev 400g", price: 110, type: "snacks", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1621996346565-e3d5d6281274?w=400" },
    { _id: "g34", name: "Roasted Salted Cashews 200g", price: 280, type: "snacks", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
    { _id: "g35", name: "Mixed Dry Fruits 500g", price: 650, type: "snacks", category: "grocery", stock: 20, img: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400" },
    { _id: "g36", name: "Dark Chocolate Bar 100g", price: 140, type: "snacks", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400" },
    { _id: "g37", name: "Peanut Butter 500g", price: 320, type: "snacks", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400" },
    { _id: "g38", name: "Roasted Almonds 200g", price: 350, type: "snacks", category: "grocery", stock: 25, img: "https://images.unsplash.com/photo-1617200419049-4fcf77ae8b44?w=400" },
    { _id: "g39", name: "Oat Biscuits Pack 300g", price: 180, type: "snacks", category: "grocery", stock: 45, img: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400" },
    // --- Beverages (7) ---
    { _id: "g40", name: "Orange Juice 1L", price: 120, type: "beverages", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400" },
    { _id: "g41", name: "Organic Green Tea 25 Pack", price: 220, type: "beverages", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400" },
    { _id: "g42", name: "Cold Pressed Coconut Water 1L", price: 50, type: "beverages", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400" },
    { _id: "g43", name: "Mango Juice 1L", price: 140, type: "beverages", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400" },
    { _id: "g44", name: "Cold Brew Coffee 250ml", price: 180, type: "beverages", category: "grocery", stock: 25, img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400" },
    { _id: "g45", name: "Sparkling Water 6-Pack 500ml", price: 250, type: "beverages", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400" },
    { _id: "g46", name: "Lemon Mint Drink 1L", price: 90, type: "beverages", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400" },
    // --- Personal Care (4) ---
    { _id: "g47", name: "Moisturizing Soap 125g", price: 65, type: "personal_care", category: "grocery", stock: 60, img: "https://images.unsplash.com/photo-1607006482602-76ca97ac8a2f?w=400" },
    { _id: "g48", name: "Herbal Toothpaste 150g", price: 115, type: "personal_care", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400" },
    { _id: "g49", name: "Aloe Vera Face Wash 150ml", price: 160, type: "personal_care", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { _id: "g50", name: "Coconut Oil Shampoo 400ml", price: 240, type: "personal_care", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400" }
];

// Pre-built reviews pool (realistic 4 and 5 star reviews)
const reviewPool = [
    { text: "Amazing quality! Totally worth the price.", rating: 5, author: "Rahul M." },
    { text: "Very comfortable and looks exactly like the picture.", rating: 5, author: "Priya S." },
    { text: "Great product, fast delivery. Will buy again!", rating: 4, author: "Amit K." },
    { text: "Good quality for the price. Happy with purchase.", rating: 4, author: "Sneha R." },
    { text: "Excellent! Exceeded my expectations.", rating: 5, author: "Vikram T." },
    { text: "Loved it! Fits perfectly and feels premium.", rating: 5, author: "Ananya B." },
    { text: "Pretty good. Would recommend to friends.", rating: 4, author: "Karan P." },
    { text: "Top-notch quality. Very satisfied!", rating: 5, author: "Deepika L." },
    { text: "Nice product. Delivery was quick.", rating: 4, author: "Rohit V." },
    { text: "Superb! The material is high quality.", rating: 5, author: "Meera J." },
];

function getRandomReviews(count = 3) {
    const shuffled = [...reviewPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(r => ({
        ...r,
        date: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
    }));
}

// Ensure every fallback product has pre-attached reviews
fallbackProducts.forEach(p => {
    if (!p.reviews || p.reviews.length === 0) {
        p.reviews = getRandomReviews(3);
    }
});

// ✅ Auto-seed helper
async function ensureProductsSeeded() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            const seedData = fallbackProducts.map(({ _id, ...rest }) => rest);
            await Product.insertMany(seedData);
            console.log("Auto-seeded products into MongoDB ✅");
        }
    } catch (err) {
        console.error("Auto-seed notice:", err.message);
    }
}

// Helper to ensure product object has reviews
function ensureProductReviews(prod) {
    if (!prod) return prod;
    const item = prod.toObject ? prod.toObject() : prod;
    if (!item.reviews || item.reviews.length === 0) {
        item.reviews = getRandomReviews(3);
    }
    return item;
}

// ✅ 1. GET PRODUCTS
router.get("/", async (req, res) => {
    try {
        await ensureProductsSeeded();
        const { type, category } = req.query;

        let filter = {};
        if (type) filter.type = type;
        if (category) filter.category = category;

        let products = await Product.find(filter);

        if (!products || products.length === 0) {
            products = fallbackProducts.filter(p => {
                if (type && p.type !== type) return false;
                if (category && p.category !== category) return false;
                return true;
            });
        }

        const result = products.map(p => ensureProductReviews(p));
        return res.json(result);
    } catch (err) {
        console.log("❌ ERROR:", err);
        const { type, category } = req.query;
        const products = fallbackProducts.filter(p => {
            if (type && p.type !== type) return false;
            if (category && p.category !== category) return false;
            return true;
        });
        const result = products.map(p => ensureProductReviews(p));
        return res.json(result);
    }
});

// ✅ 1b. GET REVIEWS FOR A PRODUCT
router.get(["/reviews/:id", "/:id/reviews"], async (req, res) => {
    try {
        let product = null;
        try { product = await Product.findById(req.params.id); } catch(e){}
        if (!product) {
            product = fallbackProducts.find(p => p._id === req.params.id);
        }
        const finalP = ensureProductReviews(product);
        return res.json(finalP?.reviews || getRandomReviews(3));
    } catch (err) {
        return res.json(getRandomReviews(3));
    }
});

// ✅ 1c. GET SINGLE PRODUCT BY ID
router.get("/:id", async (req, res, next) => {
    // Skip static route names
    if (["premium-products", "add-product"].includes(req.params.id)) {
        return next();
    }
    try {
        let product = null;
        try { product = await Product.findById(req.params.id); } catch(e){}
        if (!product) {
            product = fallbackProducts.find(p => p._id === req.params.id);
        }
        if (!product) {
            return res.status(404).json({ message: "Product not found ❌" });
        }
        return res.json(ensureProductReviews(product));
    } catch (err) {
        const fallback = fallbackProducts.find(p => p._id === req.params.id);
        if (fallback) return res.json(ensureProductReviews(fallback));
        return res.status(404).json({ message: "Product not found ❌" });
    }
});

// ✅ 2. ADD PRODUCT
router.post("/add-product", verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, price, img, type } = req.body;

        if (!name || !price || !img || !type) {
            return res.status(400).json({ msg: "All fields required ❌" });
        }

        const product = new Product({ name, price, img, type });
        await product.save();

        res.json({ msg: "Product added ✅", product });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Error ❌" });
    }
});


// ✅ 3. ADD REVIEW
router.post("/add-review/:id", async (req, res) => {
    try {
        const { text, rating, author } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Review text required ❌" });
        }

        const newReview = {
            text: text.trim(),
            rating: Number(rating) || 5,
            author: author || "Anonymous",
            date: new Date()
        };

        let product = null;
        try { product = await Product.findById(req.params.id); } catch(e){}

        if (product) {
            if (!product.reviews) product.reviews = [];
            product.reviews.push(newReview);
            try { await product.save(); } catch(e){}
            return res.json({ msg: "Review added ✅", reviews: product.reviews });
        }

        // Fallback product review store
        const fallback = fallbackProducts.find(p => p._id === req.params.id);
        if (fallback) {
            if (!fallback.reviews) fallback.reviews = getRandomReviews(3);
            fallback.reviews.push(newReview);
            return res.json({ msg: "Review added ✅", reviews: fallback.reviews });
        }

        return res.json({ msg: "Review added ✅", reviews: [newReview] });

    } catch (err) {
        console.log("❌ REVIEW ERROR:", err);
        return res.status(500).json({ error: err.message });
    }
});


// ✅ 4. DELETE PRODUCT
router.delete("/delete-product/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found ❌" });
        }

        return res.json({ msg: "Deleted ✅" });

    } catch (err) {
        console.log("❌ DELETE ERROR:", err);
        return res.status(500).json({ error: err.message });
    }
});


// ✅ 5. UPDATE PRODUCT
router.put("/update-product/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        return res.json({ msg: "Updated ✅", product: updated });

    } catch (err) {
        console.log("❌ UPDATE ERROR:", err);
        return res.status(500).json({ error: err.message });
    }
});


// 💎 6. PREMIUM PRODUCTS
router.get("/premium-products", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user || user.membership !== "premium_plus") {
            return res.status(403).json({ message: "Premium required ❌" });
        }

        const products = await Product.find({ premium: true });

        res.json(products);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error ❌" });
    }
});


// 🚀 7. FAST DELIVERY (PREMIUM ONLY)
router.post("/fast-delivery", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user || user.membership !== "premium_plus") {
            return res.status(403).json({ message: "Upgrade to Premium Plus 🚀" });
        }

        res.json({ message: "Fast delivery enabled 🚀" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error ❌" });
    }
});

module.exports = router;