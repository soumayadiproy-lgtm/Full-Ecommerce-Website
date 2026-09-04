const fs = require("fs");
const path = require("path");

// Realistic curated review generator
const reviewsPool = [
    { text: "Amazing quality! Totally worth the price.", rating: 5, author: "Rahul M." },
    { text: "Very comfortable and looks exactly like the picture.", rating: 5, author: "Priya S." },
    { text: "Great product, fast delivery. Will buy again!", rating: 4, author: "Amit K." },
    { text: "Good quality for the price. Happy with purchase.", rating: 4, author: "Sneha R." },
    { text: "Excellent! Exceeded my expectations.", rating: 5, author: "Vikram T." },
    { text: "Loved it! Fits perfectly and feels premium.", rating: 5, author: "Ananya B." },
    { text: "Pretty good. Would recommend to friends.", rating: 4, author: "Karan P." },
    { text: "Top-notch quality. Very satisfied!", rating: 5, author: "Deepika L." },
    { text: "Nice product. Delivery was quick.", rating: 4, author: "Rohit V." },
    { text: "Superb! The material and finish is high quality.", rating: 5, author: "Meera J." },
    { text: "Authentic item, great packaging and fresh stock.", rating: 5, author: "Suresh G." },
    { text: "Value for money. Genuine brand quality.", rating: 4, author: "Pooja N." }
];

function getSampleReviews() {
    const shuffled = [...reviewsPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map((r, i) => ({
        text: r.text,
        rating: r.rating,
        author: r.author,
        date: new Date(Date.now() - (i + 1) * 3 * 24 * 60 * 60 * 1000)
    }));
}

// ---------------------------------------------------------------------------
// 1. FASHION - CLOTHES (160 items)
// ---------------------------------------------------------------------------
const clothesRaw = [
    // Men's Shirts & Polos (30)
    { name: "Levi's Men's Barstow Western Denim Shirt", price: 2399, img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400" },
    { name: "Tommy Hilfiger Classic Oxford Cotton Shirt", price: 3499, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400" },
    { name: "Allen Solly Men's Slim Fit Casual Shirt", price: 1299, img: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400" },
    { name: "Peter England Men's Classic Formal White Shirt", price: 1099, img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400" },
    { name: "Nike Dri-FIT Men's Training T-Shirt", price: 1495, img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400" },
    { name: "Adidas Originals Trefoil Cotton T-Shirt", price: 1599, img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400" },
    { name: "Puma Men's Regular Fit Pique Polo", price: 1199, img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400" },
    { name: "US Polo Assn Men's Striped Casual Shirt", price: 1699, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400" },
    { name: "Van Heusen Men's Formal Sky Blue Shirt", price: 1499, img: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400" },
    { name: "Zara Men's Linen Blend Relaxed Shirt", price: 2990, img: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=400" },
    { name: "Ralph Lauren Classic Fit Mesh Polo Shirt", price: 4999, img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400" },
    { name: "Levi's Men's Graphic Housemark T-Shirt", price: 999, img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400" },
    { name: "Under Armour Men's Tech 2.0 Short Sleeve Tee", price: 1699, img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400" },
    { name: "Arrow Men's Premium White Twill Shirt", price: 1899, img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400" },
    { name: "Raymond Men's Semi-Formal Check Shirt", price: 1599, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400" },
    { name: "Roadster Men's Navy Tartan Check Casual Shirt", price: 899, img: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=400" },
    { name: "Jack & Jones Men's Floral Printed Resort Shirt", price: 1499, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400" },
    { name: "Calvin Klein Men's Monogram Logo T-Shirt", price: 2499, img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400" },
    { name: "Marks & Spencer Pure Cotton Regular Shirt", price: 2199, img: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400" },
    { name: "Louis Philippe Men's Classic Micro Print Shirt", price: 2499, img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400" },
    { name: "Flying Machine Men's Solid Crew Neck T-Shirt", price: 699, img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400" },
    { name: "Mufti Men's Authentic Mandarin Collar Shirt", price: 1799, img: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=400" },
    { name: "Superdry Men's Vintage Logo Tri-Colour Tee", price: 2299, img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400" },
    { name: "Wrangler Men's Western Flannel Plaid Shirt", price: 1899, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400" },
    { name: "H&M Men's Relaxed Fit Cotton Linen Shirt", price: 1499, img: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=400" },
    { name: "Pepe Jeans Men's Printed Regular Polo", price: 1299, img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400" },
    { name: "Park Avenue Men's Self Design Formal Shirt", price: 1699, img: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400" },
    { name: "Blackberrys Men's Slim Fit Linen Blend Shirt", price: 2295, img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400" },
    { name: "GAP Men's Arch Logo Everyday Cotton Tee", price: 1199, img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400" },
    { name: "Lacoste Classic Pique Cotton Tennis Polo", price: 5499, img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400" },

    // Men's Jeans & Bottoms (25)
    { name: "Levi's Men's 511 Slim Fit Stretch Jeans", price: 2899, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400" },
    { name: "Levi's Men's 501 Original Fit Denim Jeans", price: 3499, img: "https://images.unsplash.com/photo-1542272604-780c96856592?w=400" },
    { name: "Wrangler Men's Texas Regular Fit Blue Jeans", price: 2199, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400" },
    { name: "Pepe Jeans London Men's Kingston Tapered Jeans", price: 2599, img: "https://images.unsplash.com/photo-1542272604-780c96856592?w=400" },
    { name: "Spykar Men's Super Skinny Low Rise Jeans", price: 1999, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400" },
    { name: "Flying Machine Men's Jackson Slim Fit Jeans", price: 1699, img: "https://images.unsplash.com/photo-1542272604-780c96856592?w=400" },
    { name: "Allen Solly Men's Flat Front Chino Trousers", price: 1799, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400" },
    { name: "Peter England Men's Formal Slim Fit Trousers", price: 1399, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400" },
    { name: "Blackberrys Men's Charcoal Formal Trousers", price: 2199, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400" },
    { name: "Nike Sportswear Club Fleece Jogger Pants", price: 2795, img: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400" },
    { name: "Adidas Essentials 3-Stripes Tapered Joggers", price: 2499, img: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400" },
    { name: "Puma Men's Evostripe Knit Track Pants", price: 1999, img: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400" },
    { name: "Zara Men's Regular Fit Cotton Cargo Trousers", price: 3290, img: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=400" },
    { name: "H&M Men's Relaxed Fit Ripstop Cargo Pants", price: 2299, img: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=400" },
    { name: "Under Armour Men's Rival Fleece Sport Joggers", price: 2999, img: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400" },
    { name: "Marks & Spencer Men's Linen Rich Chinos", price: 2999, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400" },
    { name: "Van Heusen Men's Premium Tailored Fit Trousers", price: 1899, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400" },
    { name: "Roadster Men's Washed Stretch Denim Shorts", price: 999, img: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400" },
    { name: "Jack & Jones Men's Glenn Original Slim Jeans", price: 2399, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400" },
    { name: "Superdry Men's Orange Label Cotton Sweatshorts", price: 2499, img: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400" },
    { name: "Calvin Klein Men's Straight Fit Blue Jeans", price: 4499, img: "https://images.unsplash.com/photo-1542272604-780c96856592?w=400" },
    { name: "Tommy Hilfiger Men's Bleecker Slim Chino Pants", price: 3999, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400" },
    { name: "US Polo Assn Men's Cotton Bermuda Shorts", price: 1199, img: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400" },
    { name: "GAP Men's Vintage Soft Athletic Joggers", price: 1899, img: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400" },
    { name: "Mufti Men's Raw Distressed Narrow Jeans", price: 2299, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400" },

    // Men's Jackets, Hoodies & Outerwear (25)
    { name: "Levi's Men's Original Trucker Denim Jacket", price: 3999, img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400" },
    { name: "Nike Sportswear Club Fleece Full-Zip Hoodie", price: 3295, img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400" },
    { name: "Adidas Essentials French Terry 3-Stripes Hoodie", price: 2999, img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400" },
    { name: "Puma Men's Poly Tracksuit Set", price: 2899, img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400" },
    { name: "Zara Men's Faux Leather Biker Jacket", price: 4990, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" },
    { name: "The North Face Resolve 2 Waterproof Windbreaker", price: 6999, img: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=400" },
    { name: "Superdry Men's Fuji Quilted Lightweight Jacket", price: 5499, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400" },
    { name: "H&M Men's Relaxed Fit Zip-Through Bomber Jacket", price: 2699, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" },
    { name: "GAP Men's Classic Logo Pullover Hoodie", price: 2499, img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400" },
    { name: "Calvin Klein Men's Monogram Crewneck Sweatshirt", price: 3499, img: "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=400" },
    { name: "Tommy Hilfiger Men's Reversible Bomber Jacket", price: 6999, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" },
    { name: "Under Armour Men's Storm Fleece Half-Snap Sweater", price: 3499, img: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400" },
    { name: "Roadster Men's Olive Quilted Puffer Jacket", price: 2199, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400" },
    { name: "Jack & Jones Men's Faux Suede Bomber Jacket", price: 3999, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" },
    { name: "Marks & Spencer Pure Cotton V-Neck Jumper", price: 2299, img: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400" },
    { name: "Allen Solly Men's Single Breasted Formal Blazer", price: 4999, img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400" },
    { name: "Peter England Men's Navy Wool Blend Blazer", price: 4499, img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400" },
    { name: "Raymond Men's Charcoal Fine Tailored Suit Blazer", price: 6499, img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400" },
    { name: "US Polo Assn Men's Colorblocked Windcheater", price: 2399, img: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=400" },
    { name: "Wrangler Men's Sherpa Lined Denim Jacket", price: 3999, img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400" },
    { name: "Wildcraft Men's Hypadry Packable Rain Jacket", price: 1899, img: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=400" },
    { name: "Van Heusen Men's Textured Formal Suit Jacket", price: 5999, img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400" },
    { name: "Blackberrys Men's Slim Fit Party Velvet Blazer", price: 6995, img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400" },
    { name: "Puma Men's Ferrari Race Track Jacket", price: 3999, img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400" },
    { name: "H&M Men's Cable Knit Winter Crewneck Sweater", price: 2299, img: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400" },

    // Men's Ethnic & Traditional Wear (20)
    { name: "Manyavar Men's Jacquard Silk Blend Kurta Pajama", price: 3999, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "FabIndia Pure Cotton Solid Handloom Kurta", price: 1690, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "Sanwara Men's Floral Silk Nehru Jacket", price: 2199, img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400" },
    { name: "Sojanya Pure Silk Blend Royal Sherwani", price: 7999, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "Manyavar Men's Pastel Wedding Kurta with Dhoti", price: 4999, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "FabIndia Men's Chanderi Silk Festive Kurta", price: 2890, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "Kicche Men's Hand Block Print Cotton Short Kurta", price: 999, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "Ethnix by Raymond Men's Bandhgala Formal Suit", price: 6999, img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400" },
    { name: "Peter England Men's Cotton Linen Ethnic Kurta", price: 1299, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "Manyavar Men's Embroidered Modi Nehru Jacket", price: 2999, img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400" },
    { name: "Vastramay Men's Silk Blend Pathani Suit", price: 2499, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "FabIndia Men's Khadi Cotton Straight Kurta", price: 1490, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "Hangup Men's Royal Jodhpuri Bandhgala Coat", price: 4599, img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400" },
    { name: "Manyavar Men's Chikankari Embroidered White Kurta", price: 3299, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "SG RAJPUTANA Men's Gold Brocade Achkan", price: 5499, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "Sojanya Men's Cotton Linen Blend Summer Kurta", price: 1199, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "Ethnix by Raymond Men's Printed Silk Kurta Set", price: 3499, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "FabIndia Men's Pure Silk Tussar Kurta", price: 3890, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "Manyavar Men's Banarasi Silk Festive Stole", price: 1499, img: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400" },
    { name: "Sanwara Men's Rose Gold Dupion Silk Kurta Set", price: 2799, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },

    // Women's Dresses, Gowns & Jumpsuits (25)
    { name: "Zara Floral Print Ruffled Midi Dress", price: 3590, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400" },
    { name: "H&M Women's Wrap Over Satin Cocktail Dress", price: 2299, img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400" },
    { name: "Vero Moda A-Line Polka Dot Summer Dress", price: 1999, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400" },
    { name: "Forever New Women's Pleated Halter Neck Maxi Dress", price: 4499, img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400" },
    { name: "Mango Women's Belted Linen Blend Shirt Dress", price: 3990, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400" },
    { name: "Only Women's Floral Tiered Fit & Flare Dress", price: 1799, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400" },
    { name: "Zara Women's Little Black Bodycon Dress", price: 2590, img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400" },
    { name: "Forever 21 Ribbed Knit Sleeveless Midi Dress", price: 1499, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400" },
    { name: "H&M Women's Broderie Anglaise White Dress", price: 2999, img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400" },
    { name: "Marks & Spencer Pure Cotton Printed Midi Dress", price: 3499, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400" },
    { name: "Vero Moda High Neck Shimmer Party Dress", price: 2799, img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400" },
    { name: "Mango Women's Off-Shoulder Ruffle Slip Dress", price: 3290, img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400" },
    { name: "GAP Women's Tiered Floral Smocked Sundress", price: 2499, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400" },
    { name: "Zara Women's Denim Belted Jumpsuit", price: 3990, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400" },
    { name: "H&M Women's Wide Leg Crepe Jumpsuit", price: 2499, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400" },
    { name: "Forever New Women's Emerald Green Velvet Gown", price: 5999, img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400" },
    { name: "Only Women's Striped Casual T-Shirt Dress", price: 1199, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400" },
    { name: "Vero Moda Solid Pastel Blazer Dress", price: 3699, img: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=400" },
    { name: "Zara Satin Finish Backless Evening Gown", price: 4590, img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400" },
    { name: "Marks & Spencer Floral Smocked Waist Dress", price: 3299, img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400" },
    { name: "Tommy Hilfiger Women's Polo Collar Sporty Dress", price: 4499, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400" },
    { name: "Levi's Women's Classic Denim Dungaree Pinafore", price: 2999, img: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400" },
    { name: "Calvin Klein Jeans Women's Stretch Denim Dress", price: 4999, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400" },
    { name: "H&M Women's Ribbed Bodycon Sweater Dress", price: 2199, img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400" },
    { name: "Forever 21 Tropical Print Bohemian Maxi Dress", price: 1999, img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400" },

    // Women's Tops, Blouses & Sweaters (20)
    { name: "Zara Women's Flowing Satin Button Blouse", price: 2290, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400" },
    { name: "H&M Women's Fitted Ribbed Crop Top", price: 699, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400" },
    { name: "Vero Moda Peplum Floral Summer Top", price: 1299, img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400" },
    { name: "Forever New Women's Organza Sleeve High-Neck Top", price: 2499, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400" },
    { name: "Only Women's Ruffle Detail Chiffon Blouse", price: 1499, img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400" },
    { name: "Levi's Women's Classic Batwing Graphic Tee", price: 999, img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400" },
    { name: "Mango Women's Striped Cotton Breton Top", price: 1790, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400" },
    { name: "H&M Women's Knitted Cardigan with Rhinestone Buttons", price: 1999, img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400" },
    { name: "Marks & Spencer Pure Cotton High Neck T-Shirt", price: 1199, img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400" },
    { name: "Forever 21 Off-the-Shoulder Smocked Top", price: 999, img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400" },
    { name: "Zara Women's Oversized Cable Knit Sweater", price: 2990, img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400" },
    { name: "GAP Women's French Terry Vintage Logo Crewneck", price: 2199, img: "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=400" },
    { name: "Tommy Hilfiger Women's Contrast Collar Pique Polo", price: 3299, img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400" },
    { name: "Vero Moda V-Neck Cashmere Touch Cardigan", price: 2299, img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400" },
    { name: "Nike Sportswear Club Women's Fleece Crop Hoodie", price: 2995, img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400" },
    { name: "Adidas Originals Trefoil Women's Loose Sweatshirt", price: 2799, img: "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=400" },
    { name: "Puma Women's Essentials Cropped Logo Tee", price: 899, img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400" },
    { name: "Mango Women's Floral Embroidered Georgette Blouse", price: 2490, img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400" },
    { name: "Zara Women's Ribbed Turtleneck Warm Pullover", price: 1990, img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400" },
    { name: "Calvin Klein Jeans Women's Rib Monogram Baby Tee", price: 1899, img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400" },

    // Women's Jeans, Trousers & Skirts (20)
    { name: "Levi's Women's 721 High Rise Skinny Jeans", price: 2799, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400" },
    { name: "Levi's Women's 501 Crop Straight Fit Jeans", price: 3299, img: "https://images.unsplash.com/photo-1542272604-780c96856592?w=400" },
    { name: "Zara Women's Marine Straight High-Waist Jeans", price: 2990, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400" },
    { name: "H&M Women's Wide High Jeans in Light Denim", price: 2299, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400" },
    { name: "Vero Moda High Waist Tailored Cigarette Trousers", price: 1899, img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400" },
    { name: "Mango Women's Pleated Wide-Leg Palazzo Pants", price: 2990, img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400" },
    { name: "Only Women's A-Line Denim Button-Front Mini Skirt", price: 1499, img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400" },
    { name: "H&M Women's Pleated Satin Midi Skirt", price: 1999, img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400" },
    { name: "Zara Faux Leather Flared Midi Skirt", price: 2990, img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400" },
    { name: "Forever New Women's Paperbag Waist Linen Shorts", price: 2199, img: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400" },
    { name: "Marks & Spencer Women's Linen Rich Straight Trousers", price: 2799, img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400" },
    { name: "Forever 21 Women's Distressed Mom Jeans", price: 1799, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400" },
    { name: "Pepe Jeans Women's Soho Low Waist Skinny Fit", price: 2399, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400" },
    { name: "Vero Moda Women's Checked Formal Ankle Pants", price: 1999, img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400" },
    { name: "Zara Women's Flowy Culottes with Tie Belt", price: 2290, img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400" },
    { name: "GAP Women's Sky High Rise True Skinny Jeans", price: 2499, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400" },
    { name: "Only Women's Floral Tiered Ruffle Skirt", price: 1399, img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400" },
    { name: "Tommy Hilfiger Women's Heritage High Rise Chinos", price: 3999, img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400" },
    { name: "Calvin Klein Jeans Women's Slim Bootcut Jeans", price: 4299, img: "https://images.unsplash.com/photo-1542272604-780c96856592?w=400" },
    { name: "H&M Women's High Waist Tailored Bermuda Shorts", price: 1499, img: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400" },

    // Women's Ethnic & Indian Wear (20)
    { name: "Biba Anarkali Kurta Set with Dupatta", price: 4299, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
    { name: "W for Woman Gold Printed Straight Kurti", price: 1899, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "Aurelia Women's Cotton Printed Festive Kurta", price: 1199, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "FabIndia Hand Block Printed Chanderi Silk Saree", price: 5990, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
    { name: "Global Desi Bohemian Embroidered Tunic", price: 1699, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "Biba Women's Floral Printed Palazzo Suit Set", price: 3499, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
    { name: "W for Woman Silk Blend Embroidered Gown Kurti", price: 3299, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
    { name: "FabIndia Pure Tussar Silk Saree with Zari Border", price: 6890, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
    { name: "Aurelia Women's Embellished Kurta with Sharara", price: 2799, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "Soch Women's Georgette Embroidered Saree", price: 3899, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
    { name: "Biba Girls Tiered Festive Lehenga Choli Set", price: 2999, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
    { name: "Global Desi Geometric Printed A-Line Kurti", price: 1399, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "W for Woman Cropped Ethnic Shrug with Inner", price: 1999, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "FabIndia Pure Cotton Chikankari Kurta", price: 2490, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "Aurelia Festive Silk Dupatta with Tassels", price: 899, img: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400" },
    { name: "Soch Women's Silk Blend Jacquard Kurta Set", price: 4199, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
    { name: "Biba Solid Cotton Cambric Straight Pants", price: 999, img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400" },
    { name: "Global Desi Mirror Work Festive Anarkali Suit", price: 3999, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
    { name: "W for Woman Festive Brocade Trouser Kurti Set", price: 3699, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
    { name: "FabIndia Handwoven Silk Chanderi Dupatta", price: 1890, img: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400" }
];

// ---------------------------------------------------------------------------
// 2. FASHION - SHOES (80 items)
// ---------------------------------------------------------------------------
const shoesRaw = [
    // Men's Sneakers & Casuals (25)
    { name: "Nike Air Force 1 '07 All White Sneakers", price: 7495, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400" },
    { name: "Adidas Ultraboost Light Running Shoes", price: 11999, img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400" },
    { name: "Puma Smash V2 Leather Low-Top Sneakers", price: 2499, img: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=400" },
    { name: "New Balance 574 Core Classic Sneakers", price: 6999, img: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400" },
    { name: "Converse Chuck Taylor All Star High Top", price: 3999, img: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400" },
    { name: "Vans Old Skool Classic Skate Shoes", price: 4499, img: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400" },
    { name: "Reebok Classic Leather Retro Trainers", price: 4299, img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400" },
    { name: "Asics Gel-Nimbus 25 Performance Running Shoes", price: 12999, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { name: "Nike Pegasus 40 Road Running Shoes", price: 8995, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { name: "Adidas Stan Smith Primegreen Sneakers", price: 5999, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400" },
    { name: "Puma RS-X Efekt Reflective Sneakers", price: 6499, img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400" },
    { name: "Under Armour HOVR Phantom 3 SE Running Shoes", price: 9999, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { name: "Skechers Men's Go Walk Arch Fit Slip-Ins", price: 4999, img: "https://images.unsplash.com/photo-1497706703565-29f70de0c4c3?w=400" },
    { name: "Nike Air Max 90 Classic Men's Trainers", price: 8495, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { name: "Puma Court Star Clean Leather Shoes", price: 2999, img: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=400" },
    { name: "Red Tape Men's Classic White Casual Sneakers", price: 1699, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400" },
    { name: "Sparx Men's Lightweight Mesh Running Shoes", price: 899, img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400" },
    { name: "Campus Men's North Running & Walking Shoes", price: 1199, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { name: "Crocs Classic Unisex Lightweight Clogs", price: 2995, img: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400" },
    { name: "Adidas Adizero SL Training Shoes", price: 7999, img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400" },
    { name: "Nike Dunk Low Retro Casual Shoes", price: 8295, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400" },
    { name: "Bata Men's Power Energy Cushion Running Shoes", price: 1799, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { name: "Asics Gel-Kayano 30 Stability Shoes", price: 13999, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { name: "Converse Chuck 70 Vintage Canvas Low Top", price: 4999, img: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400" },
    { name: "Vans Classic Slip-On Checkerboard Shoes", price: 3799, img: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400" },

    // Men's Formal Shoes & Boots (20)
    { name: "Clarks Men's Tilden Cap Leather Oxford Shoes", price: 4999, img: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400" },
    { name: "Woodland Men's Camel Nubuck Leather Boots", price: 3995, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400" },
    { name: "Red Tape Men's Tan Genuine Leather Chelsea Boots", price: 2499, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400" },
    { name: "Hush Puppies Men's Glen Leather Brogues", price: 4299, img: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400" },
    { name: "Bata Men's Formal Black Slip-On Loafers", price: 1599, img: "https://images.unsplash.com/photo-1614252234498-9b5571339ce9?w=400" },
    { name: "Lee Cooper Men's Leather Derby Formal Shoes", price: 2699, img: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400" },
    { name: "Cat Footwear Colorado Rugged Leather Boots", price: 7499, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400" },
    { name: "Louis Philippe Men's Handcrafted Leather Monk Straps", price: 5499, img: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400" },
    { name: "Woodland Men's Olive Suede Casual Ankle Boots", price: 4295, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400" },
    { name: "Red Tape Men's Formal Wingtip Leather Brogues", price: 2199, img: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400" },
    { name: "Clarks Men's Whiddon Pace Cap Toe Shoes", price: 4499, img: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400" },
    { name: "Bata Comfit Men's Memory Foam Formal Shoes", price: 1899, img: "https://images.unsplash.com/photo-1614252234498-9b5571339ce9?w=400" },
    { name: "Ruosh Men's Hand-Finished Italian Leather Loafers", price: 4990, img: "https://images.unsplash.com/photo-1614252234498-9b5571339ce9?w=400" },
    { name: "Hush Puppies Men's Bennet Suede Leather Loafers", price: 3499, img: "https://images.unsplash.com/photo-1614252234498-9b5571339ce9?w=400" },
    { name: "Woodland Men's Khaki Leather Trekking Shoes", price: 3795, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400" },
    { name: "Bata Men's Moccasin Casual Driving Shoes", price: 1499, img: "https://images.unsplash.com/photo-1614252234498-9b5571339ce9?w=400" },
    { name: "Clarks Men's Clarkdale Gobi Suede Chelsea Boots", price: 6499, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400" },
    { name: "Red Tape Men's Horsebit Buckle Leather Loafers", price: 2299, img: "https://images.unsplash.com/photo-1614252234498-9b5571339ce9?w=400" },
    { name: "Dr. Martens 1460 8-Eye Smooth Leather Boots", price: 11999, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400" },
    { name: "Bata Men's Leather Fisherman Sandals", price: 1299, img: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400" },

    // Women's Heels, Flats & Sandals (20)
    { name: "Aldo Stessy Pointed Toe Stiletto Heels", price: 5999, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
    { name: "Steve Madden Stecy Ankle Strap Heeled Sandals", price: 4999, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
    { name: "Charles & Keith Classic Block Heel Pumps", price: 4499, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
    { name: "Bata Comfit Women's Cushioned Ballerina Flats", price: 1199, img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400" },
    { name: "Birkenstock Arizona Two-Strap EVA Sandals", price: 3490, img: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400" },
    { name: "Carlton London Embellished Open-Toe Mules", price: 1799, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
    { name: "Crocs Brooklyn Low Wedge Women's Sandals", price: 4495, img: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400" },
    { name: "Aldo Cassedy Pointy Toe Classic Court Shoes", price: 6499, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
    { name: "Bata Women's Ethnic Embellished Mojari Flats", price: 999, img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400" },
    { name: "Steve Madden Irenee Ankle Strap Block Heels", price: 5499, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
    { name: "Charles & Keith Strappy Toe Ring Flat Sandals", price: 3299, img: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400" },
    { name: "Catwalk Women's Shimmer Peep-Toe Platform Heels", price: 2195, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
    { name: "Carlton London Pointed Toe Glossy Ballerinas", price: 1499, img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400" },
    { name: "Aldo Glaeswen Braided Flat Slide Sandals", price: 3999, img: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400" },
    { name: "Bata Comfit Women's Wedge Comfort Slip-Ons", price: 1399, img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400" },
    { name: "H&M Women's Platform Mule Sandals", price: 1999, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
    { name: "Zara Minimalist Strappy Stiletto Sandals", price: 3290, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
    { name: "Steve Madden Carrson Suede Chunky Heel Sandals", price: 6299, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
    { name: "Charles & Keith Metallic Accent Loafer Mules", price: 4299, img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400" },
    { name: "Bata Women's Casual Floral Thong Flip-Flops", price: 699, img: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400" },

    // Women's Sneakers & Boots (15)
    { name: "Nike Air Max 90 Futura Women's Sneakers", price: 8995, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { name: "Adidas Originals Gazelle Women's Suede Shoes", price: 6999, img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400" },
    { name: "Puma Carina 2.0 Women's Retro Sneakers", price: 2799, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400" },
    { name: "Skechers Women's D'Lites Memory Foam Sneakers", price: 4499, img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400" },
    { name: "Converse Chuck Taylor Move High Top Platform", price: 4999, img: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400" },
    { name: "Vans Sk8-Hi Women's High Top Canvas Sneakers", price: 4999, img: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400" },
    { name: "Zara Chunky Lug Sole Chelsea Boots", price: 4590, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400" },
    { name: "H&M Women's Combat Lace-Up Boots", price: 3499, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400" },
    { name: "Aldo Bigstep Faux Leather Chunky Ankle Boots", price: 6999, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400" },
    { name: "New Balance 327 Women's Lifestyle Sneakers", price: 7499, img: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400" },
    { name: "Nike Court Legacy Lift Women's Platform Shoes", price: 5495, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400" },
    { name: "Puma Cali Dream Women's Pastel Sneakers", price: 3999, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400" },
    { name: "Charles & Keith Lace-Up Chunky Sole Boots", price: 5999, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400" },
    { name: "Bata Power Wave Women's Walking Trainers", price: 1499, img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400" },
    { name: "Asics Gel-Contend 8 Women's Running Shoes", price: 3999, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" }
];

// ---------------------------------------------------------------------------
// 3. FASHION - ACCESSORIES & TECH (80 items)
// ---------------------------------------------------------------------------
const accessoriesRaw = [
    // Watches & Smartwatches (25)
    { name: "Titan Neo Casual Analog Men's Black Dial Watch", price: 3995, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
    { name: "Fossil Grant Chronograph Brown Leather Watch", price: 8995, img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400" },
    { name: "Casio Vintage Digital Gold Stainless Watch A168", price: 3295, img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400" },
    { name: "Apple Watch SE (2nd Gen) 40mm GPS Smartwatch", price: 24900, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
    { name: "Samsung Galaxy Watch 6 Bluetooth 44mm", price: 19999, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
    { name: "Fastrack Reflex Beat+ 1.69'' Smartwatch", price: 1495, img: "https://images.unsplash.com/photo-1557935728-e6d1eaabe559?w=400" },
    { name: "Noise ColorFit Pro 5 BT Calling Smartwatch", price: 2999, img: "https://images.unsplash.com/photo-1557935728-e6d1eaabe559?w=400" },
    { name: "boAt Wave Call 2 Bluetooth Calling Smartwatch", price: 1799, img: "https://images.unsplash.com/photo-1557935728-e6d1eaabe559?w=400" },
    { name: "Timex Expedition Scout Analog Leather Watch", price: 3495, img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400" },
    { name: "Daniel Wellington Classic St Mawes Rose Gold", price: 11999, img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400" },
    { name: "Titan Raga Viva Rose Gold Analog Women's Watch", price: 4495, img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400" },
    { name: "Fossil Jacqueline Stainless Steel Women's Watch", price: 7495, img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400" },
    { name: "Casio G-Shock Matte Black Tough Watch GA-2100", price: 7995, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
    { name: "Tommy Hilfiger Men's Multi-Eye Stainless Steel Watch", price: 8995, img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400" },
    { name: "Michael Kors Runway Gold-Tone Chronograph Watch", price: 14995, img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400" },
    { name: "Fastrack Casual Analog Black Dial Men's Watch", price: 1295, img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400" },
    { name: "Fire-Boltt Phoenix Pro Bluetooth Calling Watch", price: 1699, img: "https://images.unsplash.com/photo-1557935728-e6d1eaabe559?w=400" },
    { name: "Fitbit Charge 6 Fitness & Health Tracker", price: 12999, img: "https://images.unsplash.com/photo-1557935728-e6d1eaabe559?w=400" },
    { name: "Armani Exchange Chronograph Black Silicone Watch", price: 9495, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
    { name: "Citizen Eco-Drive Aviator Solar Powered Watch", price: 16990, img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400" },
    { name: "Seiko 5 Sports Automatic Military Green Watch", price: 21990, img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400" },
    { name: "Garmin Forerunner 55 GPS Running Smartwatch", price: 18990, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
    { name: "Titan Karishma Analog Silver Dial Men's Watch", price: 1895, img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400" },
    { name: "Fossil Neutra Minimalist Quartz Leather Watch", price: 6995, img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400" },
    { name: "Tissot PRX 40mm Quartz Stainless Steel Watch", price: 31500, img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400" },

    // Audio & Gadgets (20)
    { name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones", price: 26990, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { name: "Apple AirPods Pro (2nd Gen) with MagSafe Case", price: 20990, img: "https://images.unsplash.com/photo-1590658165737-15a047b7c35e?w=400" },
    { name: "boAt Rockerz 550 Over-Ear Wireless Headphones", price: 1799, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { name: "JBL Flip 6 Waterproof Portable Bluetooth Speaker", price: 8999, img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400" },
    { name: "Marshall Emberton II Portable Bluetooth Speaker", price: 14999, img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400" },
    { name: "OnePlus Buds Pro 2 ANC True Wireless Earbuds", price: 7999, img: "https://images.unsplash.com/photo-1590658165737-15a047b7c35e?w=400" },
    { name: "Marshall Major IV Wireless Bluetooth Headphones", price: 11999, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { name: "Sennheiser Momentum 4 Wireless ANC Headphones", price: 24990, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { name: "boAt Airdopes 141 Bluetooth Wireless Earbuds", price: 1299, img: "https://images.unsplash.com/photo-1590658165737-15a047b7c35e?w=400" },
    { name: "Realme Buds Air 5 Pro with Active Noise Cancellation", price: 4499, img: "https://images.unsplash.com/photo-1590658165737-15a047b7c35e?w=400" },
    { name: "Anker PowerCore 20000mAh Portable Fast Power Bank", price: 2499, img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400" },
    { name: "Mi Power Bank 3i 10000mAh Fast Charging", price: 1199, img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400" },
    { name: "Sony SRS-XB13 Extra Bass Wireless Speaker", price: 3490, img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400" },
    { name: "Bose QuietComfort 45 Wireless Noise Cancelling", price: 23900, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { name: "JBL Tune 760NC Over-Ear Active Noise Cancelling", price: 4999, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { name: "Noise Buds VS102 Wireless in-Ear Earbuds", price: 999, img: "https://images.unsplash.com/photo-1590658165737-15a047b7c35e?w=400" },
    { name: "Apple MagSafe Battery Pack Wireless Charger", price: 8900, img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400" },
    { name: "boAt Stone 350 10W Bluetooth Speaker", price: 1399, img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400" },
    { name: "Sony WF-C700N Truly Wireless ANC Earbuds", price: 7990, img: "https://images.unsplash.com/photo-1590658165737-15a047b7c35e?w=400" },
    { name: "Marshall Willen Ultra-Compact Bluetooth Speaker", price: 8999, img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400" },

    // Bags, Backpacks & Wallets (20)
    { name: "Wildcraft 45L Adventure Rucksack Backpack", price: 2999, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
    { name: "American Tourister 32L Casual Laptop Backpack", price: 1599, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
    { name: "Lavie Women's Betula Large Faux Leather Tote", price: 1899, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
    { name: "Caprese Brenda Faux Leather Shoulder Satchel Bag", price: 2499, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
    { name: "Tommy Hilfiger Men's Leather Bifold Wallet", price: 1999, img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400" },
    { name: "Hidesign Genuine Vegetable Tanned Leather Wallet", price: 2295, img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400" },
    { name: "Baggit Women's Vegan Leather Crossbody Sling Bag", price: 1299, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
    { name: "VIP Skybags Duffle Bag with Wheels 55cm", price: 2199, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
    { name: "Fossil Men's Derrick RFID Leather Card Case", price: 2495, img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400" },
    { name: "Lavie Women's Compact Flap Over Clutch Wallet", price: 899, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
    { name: "Safari Thorium Neo 55cm Hard Luggage Suitcase", price: 2499, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
    { name: "Puma Pioneer Unisex 25L School Gym Backpack", price: 1199, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
    { name: "Nike Elemental Unisex Everyday Workout Backpack", price: 1895, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
    { name: "Hidesign Women's Pure Leather Handcrafted Tote", price: 6495, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
    { name: "Caprese Women's Chic Quilted Crossbody Bag", price: 2199, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
    { name: "American Tourister Valex Set of 3 Cabin Luggage", price: 7999, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
    { name: "Titan Men's Contemporary Dark Tan Leather Wallet", price: 1495, img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400" },
    { name: "Wildcraft Waterproof 15.6 Inch Laptop Sleeve", price: 899, img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400" },
    { name: "Tommy Hilfiger Women's Signature Satchel Handbag", price: 4999, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
    { name: "Baggit Women's Hobo Everyday Work Bag", price: 1699, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },

    // Sunglasses, Belts & Jewelry (15)
    { name: "Ray-Ban Aviator Classic Green G-15 Sunglasses RB3025", price: 7490, img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400" },
    { name: "Ray-Ban Wayfarer Classic Polarized Black Sunglasses", price: 8990, img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400" },
    { name: "Fastrack UV Protected Square Men's Sunglasses", price: 999, img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400" },
    { name: "Woodland Men's Reversible Genuine Leather Belt", price: 1295, img: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400" },
    { name: "Levi's Men's Classic Antique Metal Buckle Leather Belt", price: 1499, img: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400" },
    { name: "GIVA 925 Sterling Silver Zircon Solitaire Pendant", price: 1899, img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400" },
    { name: "GIVA 925 Sterling Silver Classic Stud Earrings", price: 1299, img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400" },
    { name: "Polaroid Polarized Round Unisex Sunglasses", price: 3490, img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400" },
    { name: "Tommy Hilfiger Men's Reversible Pin Buckle Belt", price: 2199, img: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400" },
    { name: "Daniel Wellington Classic Rose Gold Minimal Bracelet", price: 4499, img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400" },
    { name: "Fossil Men's Vintage Casual Braided Leather Bracelet", price: 2495, img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400" },
    { name: "Fastrack Rimless Oval Women's Trendy Sunglasses", price: 1195, img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400" },
    { name: "Vogue Eyewear Butterfly Gradient Women's Sunglasses", price: 4990, img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400" },
    { name: "Hidesign Pure Leather Dress Formal Belt", price: 1795, img: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400" },
    { name: "GIVA 925 Silver Rose Gold Adjustable Tennis Bracelet", price: 2799, img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400" }
];

// ---------------------------------------------------------------------------
// 4. GROCERY - ALL 7 CATEGORIES (156 items)
// ---------------------------------------------------------------------------

// 4a. Rice & Grains (25 items)
const groceryRiceRaw = [
    { name: "India Gate Classic Basmati Rice 5kg", price: 799, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { name: "Daawat Rozana Super Basmati Rice 5kg", price: 465, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { name: "Fortune Everyday Basmati Rice 1kg", price: 110, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { name: "Kohinoor Super Silver Basmati Rice 5kg", price: 625, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { name: "BB Royal Sona Masoori Raw Rice 10kg", price: 650, img: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400" },
    { name: "24 Mantra Organic Brown Rice 1kg", price: 145, img: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400" },
    { name: "Aashirvaad Sharbati Select Whole Wheat Atta 5kg", price: 320, img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
    { name: "Fortune Chakki Fresh Atta 10kg", price: 420, img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
    { name: "Tata Sampann Unpolished Toor Dal 1kg", price: 175, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { name: "Tata Sampann Moong Dal Yellow Split 1kg", price: 155, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { name: "Tata Sampann Chana Dal Unpolished 1kg", price: 120, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { name: "Fortune Sunlite Refined Sunflower Oil 1L", price: 135, img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400" },
    { name: "Saffola Gold Pro Healthy Blend Edible Oil 5L", price: 799, img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400" },
    { name: "Dhara Kachi Ghani Mustard Oil 1L", price: 165, img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400" },
    { name: "Amul Pure Cow Ghee 1L Tin", price: 620, img: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400" },
    { name: "Quaker Rolled Oats 1kg Pouch", price: 199, img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
    { name: "Kellogg's Corn Flakes Original 875g", price: 340, img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
    { name: "Tata Salt Vacuum Evaporated Iodized Salt 1kg", price: 28, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { name: "Catch Jeera Whole Cumin Seeds 200g", price: 135, img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400" },
    { name: "Everest Garam Masala Powder 100g", price: 88, img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400" },
    { name: "Patanjali Traditional Thick Poha 500g", price: 55, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { name: "Rajdhani Besan Gram Flour 1kg", price: 95, img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
    { name: "Aashirvaad Organic Organic Kabuli Chana 1kg", price: 185, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { name: "Daawat Dubar Traditional Basmati Rice 1kg", price: 135, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { name: "Fortune Soya Badi Chunks 200g", price: 50, img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" }
];

// 4b. Dairy & Milk (22 items)
const groceryDairyRaw = [
    { name: "Amul Taaza Homogenised Toned Milk 1L", price: 72, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { name: "Amul Gold Pasteurized Full Cream Milk 1L", price: 82, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { name: "Mother Dairy Full Cream Fresh Milk 1L", price: 68, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { name: "Amul Salted Pasteurized Butter 500g", price: 275, img: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400" },
    { name: "Amul Pasteurised Butter 100g", price: 58, img: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400" },
    { name: "Amul Fresh Malai Paneer 200g", price: 95, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400" },
    { name: "Mother Dairy Classic Paneer 200g", price: 92, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400" },
    { name: "Amul Processed Cheese Block 200g", price: 135, img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400" },
    { name: "Britannia Cheese Slices 200g (10 Slices)", price: 155, img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400" },
    { name: "Amul Mozzarella Diced Pizza Cheese 200g", price: 145, img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400" },
    { name: "Amul Masti Dahi Fresh Curd 400g", price: 40, img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400" },
    { name: "Epigamia Greek Yogurt Natural 400g", price: 160, img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400" },
    { name: "Epigamia Greek Yogurt Blueberry 120g", price: 60, img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400" },
    { name: "Nestle Milkmaid Sweetened Condensed Milk 400g", price: 144, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { name: "Amul Fresh Cream 250ml", price: 67, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { name: "Mother Dairy Pure Ghee 1L Jar", price: 640, img: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400" },
    { name: "Nestle Everyday Dairy Whitener Milk Powder 400g", price: 235, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { name: "Amul Masti Spiced Buttermilk 200ml", price: 15, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { name: "Amul Kool Kesar Flavoured Milk 180ml Can", price: 35, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { name: "Milky Mist Cooking Butter Unsalted 500g", price: 290, img: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400" },
    { name: "Go Cheese Spread Plain 200g", price: 115, img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400" },
    { name: "Amul Garlic & Herbs Butter Spread 100g", price: 65, img: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400" }
];

// 4c. Fruits (22 items)
const groceryFruitsRaw = [
    { name: "Kashmir Fresh Red Delicious Apples 1kg", price: 190, img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400" },
    { name: "Fresh Robusta Bananas 1 Dozen", price: 65, img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400" },
    { name: "Nagpur Sweet Fresh Oranges 1kg", price: 110, img: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400" },
    { name: "Ratnagiri Alphonso Mangoes 1kg (6 pcs)", price: 499, img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400" },
    { name: "Shimla Golden Delicious Apples 1kg", price: 175, img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400" },
    { name: "Imported Zespri Green Kiwis 3 pcs Pack", price: 120, img: "https://images.unsplash.com/photo-1585059895524-72359e06133a?w=400" },
    { name: "Fresh Royal Ruby Pomegranate (Anar) 1kg", price: 210, img: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400" },
    { name: "Fresh Sweet Papaya 1 pc (approx 1kg)", price: 75, img: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400" },
    { name: "Fresh Farm Seedless Green Grapes 500g", price: 85, img: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400" },
    { name: "Fresh Black Seedless Grapes 500g", price: 95, img: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400" },
    { name: "Sweet Fresh Watermelon 1 pc (approx 3kg)", price: 130, img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400" },
    { name: "Fresh Golden Ripe Pineapple 1 pc", price: 95, img: "https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=400" },
    { name: "Fresh Exotic Pink Dragon Fruit 1 pc", price: 110, img: "https://images.unsplash.com/photo-1527325678964-54921661f888?w=400" },
    { name: "Sweet Thai Guava (Amrood) 1kg", price: 90, img: "https://images.unsplash.com/photo-1536511135899-7389eb3b1f13?w=400" },
    { name: "Fresh Imported Sweet Plums 500g", price: 160, img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400" },
    { name: "Fresh Mosambi Sweet Lime 1kg", price: 95, img: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400" },
    { name: "Fresh Farm Fresh Strawberries 200g Box", price: 120, img: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400" },
    { name: "Fresh Organic Avocados (Butter Fruit) 500g", price: 220, img: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400" },
    { name: "Kesar Mangoes Fresh Box 1kg", price: 380, img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400" },
    { name: "Fresh Muskmelon (Kharbooja) 1 pc", price: 80, img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400" },
    { name: "Fresh Sweet Pears (Nashpati) 1kg", price: 140, img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400" },
    { name: "Fresh Sapota (Chikoo) 1kg", price: 70, img: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400" }
];

// 4d. Vegetables (24 items)
const groceryVegRaw = [
    { name: "Fresh Farm Hybrid Tomatoes 1kg", price: 42, img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" },
    { name: "Organic Jyoti Potatoes 2kg Pack", price: 68, img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400" },
    { name: "Nashik Fresh Red Onions 2kg Pack", price: 58, img: "https://images.unsplash.com/photo-1508747703725-719777637510?w=400" },
    { name: "Fresh Desi Spinach (Palak) 250g Bunch", price: 28, img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400" },
    { name: "Farm Fresh Green Cauliflower 1 pc", price: 55, img: "https://images.unsplash.com/photo-1568584711271-6bf6a23ceff4?w=400" },
    { name: "Fresh Green Broccoli 1 pc (approx 400g)", price: 85, img: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400" },
    { name: "Fresh Crunchy Orange Carrots 1kg", price: 48, img: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400" },
    { name: "Green Bell Capsicum (Shimla Mirch) 500g", price: 60, img: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400" },
    { name: "Fresh Tender Lady Finger (Bhindi) 500g", price: 45, img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" },
    { name: "Fresh English Cucumber (Kheera) 500g", price: 35, img: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400" },
    { name: "Fresh Green Sweet Peas (Matar) 500g", price: 65, img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400" },
    { name: "Farm Fresh Green Cabbage (Patta Gobhi) 1 pc", price: 38, img: "https://images.unsplash.com/photo-1568584711271-6bf6a23ceff4?w=400" },
    { name: "Fresh Ginger (Adrak) 250g", price: 45, img: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400" },
    { name: "Fresh Garlic Bulbs (Lahsun) 250g", price: 75, img: "https://images.unsplash.com/photo-1508747703725-719777637510?w=400" },
    { name: "Fresh Juicy Lemon (Nimbu) 200g Pack", price: 35, img: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400" },
    { name: "Fresh Green Coriander (Dhaniya) 100g", price: 20, img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400" },
    { name: "Fresh Button White Mushrooms 200g Pack", price: 55, img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
    { name: "Fresh Sweet Corn Cobs 2 pcs Pack", price: 45, img: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400" },
    { name: "Fresh Dark Red Beetroot (Chukandar) 500g", price: 30, img: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400" },
    { name: "Fresh Tender Bottle Gourd (Lauki) 1 pc", price: 35, img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" },
    { name: "Fresh Small Bitter Gourd (Karela) 500g", price: 40, img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" },
    { name: "Fresh Green Chilli (Hari Mirch) 100g", price: 18, img: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400" },
    { name: "Fresh Purple Eggplant (Baingan Bharta) 500g", price: 35, img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" },
    { name: "Fresh Mint Leaves (Pudina) 100g", price: 15, img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400" }
];

// 4e. Snacks & Munchies (23 items)
const grocerySnacksRaw = [
    { name: "Lay's India's Magic Masala Potato Chips 90g", price: 35, img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400" },
    { name: "Lay's American Style Cream & Onion Chips 90g", price: 35, img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400" },
    { name: "Kurkure Masala Munch Crunchy Snacks 85g", price: 20, img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400" },
    { name: "Haldiram's Nagpur Aloo Bhujia 400g", price: 115, img: "https://images.unsplash.com/photo-1621996346565-e3d5d6281274?w=400" },
    { name: "Haldiram's Khatta Meetha Namkeen 400g", price: 110, img: "https://images.unsplash.com/photo-1621996346565-e3d5d6281274?w=400" },
    { name: "Bikaji Bhujia Sev Namkeen 1kg Value Pack", price: 260, img: "https://images.unsplash.com/photo-1621996346565-e3d5d6281274?w=400" },
    { name: "Parle-G Original Glucose Biscuits 800g", price: 85, img: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400" },
    { name: "Britannia Good Day Cashew Cookies 600g", price: 145, img: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400" },
    { name: "Sunfeast Dark Fantasy Choco Fills Biscuits 300g", price: 150, img: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400" },
    { name: "Cadbury Dairy Milk Silk Chocolate Bar 150g", price: 175, img: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400" },
    { name: "Nestle KitKat 4 Finger Chocolate Bar 38.5g", price: 30, img: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400" },
    { name: "Pringles Original Potato Crisps Can 107g", price: 115, img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400" },
    { name: "Act II Instant Popcorn Butter Lover 150g", price: 50, img: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400" },
    { name: "Pintola All Natural Peanut Butter Crunchy 1kg", price: 425, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400" },
    { name: "Nutella Hazelnut Cocoa Spread 350g Jar", price: 345, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400" },
    { name: "Happilo Premium California Whole Almonds 200g", price: 240, img: "https://images.unsplash.com/photo-1617200419049-4fcf77ae8b44?w=400" },
    { name: "Happilo Premium Whole Roasted Cashews 200g", price: 290, img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
    { name: "Tong Garden Salted Roasted Pistachios 150g", price: 310, img: "https://images.unsplash.com/photo-1617200419049-4fcf77ae8b44?w=400" },
    { name: "Cadbury Celebrations Rich Chocolate Gift Pack", price: 220, img: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400" },
    { name: "Oreo Original Vanilla Creme Sandwich Biscuits 300g", price: 90, img: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400" },
    { name: "Bingo Tedhe Medhe Masala Tadka 130g", price: 25, img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400" },
    { name: "Haldiram's Gulab Jamun Tin 1kg", price: 240, img: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400" },
    { name: "Ferrero Rocher Premium Hazelnut Chocolates 16 Pcs", price: 549, img: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400" }
];

// 4f. Beverages & Drinks (20 items)
const groceryBevRaw = [
    { name: "Tata Tea Gold Royal Assam Leaf Tea 1kg", price: 540, img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400" },
    { name: "Brooke Bond Red Label Natural Care Tea 500g", price: 310, img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400" },
    { name: "Taj Mahal Rich Fresh Assam Tea 500g", price: 380, img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400" },
    { name: "Nescafe Classic 100% Pure Instant Coffee 200g Jar", price: 395, img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400" },
    { name: "Bru Instant Coffee Chicory Mix 200g Pouch", price: 299, img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400" },
    { name: "Tropicana 100% Real Orange Juice 1L", price: 135, img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400" },
    { name: "Real Fruit Power Mixed Fruit Juice 1L", price: 125, img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400" },
    { name: "Paper Boat Aamras Mango Fruit Drink 1L", price: 120, img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400" },
    { name: "Frooti Fresh Mango Drink 1.2L Bottle", price: 75, img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400" },
    { name: "Coca-Cola Original Taste Carbonated Drink 750ml", price: 45, img: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400" },
    { name: "Sprite Refreshing Lemon Lime Soda 750ml", price: 45, img: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400" },
    { name: "Thums Up Charged Strong Cola 750ml", price: 45, img: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400" },
    { name: "Raw Pressery 100% Pure Tender Coconut Water 200ml", price: 65, img: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400" },
    { name: "Red Bull Energy Drink Original Can 250ml", price: 125, img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400" },
    { name: "Lipton Pure & Light Green Tea Bags 25 Pcs", price: 165, img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400" },
    { name: "Horlicks Classic Malt Health Drink 1kg Jar", price: 425, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { name: "Bournvita Cadbury Chocolate Nutrition Drink 1kg Jar", price: 440, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { name: "Kinley Club Soda Extra Punch 750ml", price: 20, img: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400" },
    { name: "Bisleri Mineral Drinking Water 5L Can", price: 70, img: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400" },
    { name: "Appy Fizz Sparkling Apple Juice Drink 600ml", price: 40, img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400" }
];

// 4g. Personal Care & Essentials (20 items)
const groceryCareRaw = [
    { name: "Dettol Original Germ Protection Bathing Soap 125g (Pack of 4)", price: 195, img: "https://images.unsplash.com/photo-1607006482602-76ca97ac8a2f?w=400" },
    { name: "Dove Cream Beauty Bathing Soap Bar 100g (Pack of 3)", price: 210, img: "https://images.unsplash.com/photo-1607006482602-76ca97ac8a2f?w=400" },
    { name: "Pears Pure & Gentle Glycerin Soap 125g (Pack of 3)", price: 245, img: "https://images.unsplash.com/photo-1607006482602-76ca97ac8a2f?w=400" },
    { name: "Colgate Strong Teeth Dental Paste 300g Saver Pack", price: 165, img: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400" },
    { name: "Sensodyne Deep Clean Toothpaste for Sensitive Teeth 100g", price: 160, img: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400" },
    { name: "Dabur Red Ayurvedic Paste 300g with Free Toothbrush", price: 145, img: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400" },
    { name: "Head & Shoulders Anti-Dandruff Cool Menthol Shampoo 650ml", price: 540, img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400" },
    { name: "L'Oreal Paris Total Repair 5 Repairing Shampoo 650ml", price: 565, img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400" },
    { name: "Parachute 100% Pure Coconut Hair Oil 500ml", price: 199, img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { name: "Nivea Soft Light Moisturizing Cream 200ml", price: 275, img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { name: "Vaseline Intensive Care Deep Moisture Body Lotion 400ml", price: 310, img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { name: "Himalaya Purifying Neem Face Wash 200ml", price: 215, img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { name: "Garnier Skin Naturals Bright Complete Face Wash 150g", price: 220, img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { name: "Dettol Antiseptic Liquid Disinfectant 550ml", price: 210, img: "https://images.unsplash.com/photo-1607006482602-76ca97ac8a2f?w=400" },
    { name: "Lifebuoy Total 10 Antibacterial Handwash Refill 750ml", price: 110, img: "https://images.unsplash.com/photo-1607006482602-76ca97ac8a2f?w=400" },
    { name: "Gillette Mach3 Turbo Razor Blades Cartridge 4s", price: 499, img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { name: "Pond's White Beauty Anti-Spot Fairness Cream 50g", price: 145, img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { name: "Cinthol Original Deodorant and Complexion Soap 100g (Pack of 4)", price: 180, img: "https://images.unsplash.com/photo-1607006482602-76ca97ac8a2f?w=400" },
    { name: "Fiama Shower Gel Blackcurrant & Bearberry 250ml", price: 199, img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400" },
    { name: "Clean & Clear Foaming Face Wash Oil-Free 150ml", price: 175, img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" }
];

console.log("Counts Summary:");
console.log("- Clothes:", clothesRaw.length);
console.log("- Shoes:", shoesRaw.length);
console.log("- Accessories:", accessoriesRaw.length);
console.log("Total Fashion:", clothesRaw.length + shoesRaw.length + accessoriesRaw.length);

console.log("- Grocery Rice:", groceryRiceRaw.length);
console.log("- Grocery Dairy:", groceryDairyRaw.length);
console.log("- Grocery Fruits:", groceryFruitsRaw.length);
console.log("- Grocery Veg:", groceryVegRaw.length);
console.log("- Grocery Snacks:", grocerySnacksRaw.length);
console.log("- Grocery Bev:", groceryBevRaw.length);
console.log("- Grocery Care:", groceryCareRaw.length);
console.log("Total Grocery:", groceryRiceRaw.length + groceryDairyRaw.length + groceryFruitsRaw.length + groceryVegRaw.length + grocerySnacksRaw.length + groceryBevRaw.length + groceryCareRaw.length);

// Combine and format
let fashionIndex = 1;
const fashionProducts = [
    ...clothesRaw.map(p => ({
        _id: `f${fashionIndex++}`,
        name: p.name,
        price: p.price,
        type: "clothes",
        category: "general",
        stock: Math.floor(Math.random() * 40) + 20,
        img: p.img,
        reviews: getSampleReviews()
    })),
    ...shoesRaw.map(p => ({
        _id: `f${fashionIndex++}`,
        name: p.name,
        price: p.price,
        type: "shoes",
        category: "general",
        stock: Math.floor(Math.random() * 30) + 15,
        img: p.img,
        reviews: getSampleReviews()
    })),
    ...accessoriesRaw.map(p => ({
        _id: `f${fashionIndex++}`,
        name: p.name,
        price: p.price,
        type: "electronics",
        category: "general",
        stock: Math.floor(Math.random() * 35) + 15,
        img: p.img,
        reviews: getSampleReviews()
    }))
];

let groceryIndex = 1;
const groceryProducts = [
    ...groceryRiceRaw.map(p => ({
        _id: `g${groceryIndex++}`,
        name: p.name,
        price: p.price,
        type: "rice",
        category: "grocery",
        stock: Math.floor(Math.random() * 50) + 25,
        img: p.img,
        reviews: getSampleReviews()
    })),
    ...groceryDairyRaw.map(p => ({
        _id: `g${groceryIndex++}`,
        name: p.name,
        price: p.price,
        type: "dairy",
        category: "grocery",
        stock: Math.floor(Math.random() * 45) + 20,
        img: p.img,
        reviews: getSampleReviews()
    })),
    ...groceryFruitsRaw.map(p => ({
        _id: `g${groceryIndex++}`,
        name: p.name,
        price: p.price,
        type: "fruits",
        category: "grocery",
        stock: Math.floor(Math.random() * 40) + 20,
        img: p.img,
        reviews: getSampleReviews()
    })),
    ...groceryVegRaw.map(p => ({
        _id: `g${groceryIndex++}`,
        name: p.name,
        price: p.price,
        type: "vegetables",
        category: "grocery",
        stock: Math.floor(Math.random() * 60) + 30,
        img: p.img,
        reviews: getSampleReviews()
    })),
    ...grocerySnacksRaw.map(p => ({
        _id: `g${groceryIndex++}`,
        name: p.name,
        price: p.price,
        type: "snacks",
        category: "grocery",
        stock: Math.floor(Math.random() * 70) + 30,
        img: p.img,
        reviews: getSampleReviews()
    })),
    ...groceryBevRaw.map(p => ({
        _id: `g${groceryIndex++}`,
        name: p.name,
        price: p.price,
        type: "beverages",
        category: "grocery",
        stock: Math.floor(Math.random() * 50) + 20,
        img: p.img,
        reviews: getSampleReviews()
    })),
    ...groceryCareRaw.map(p => ({
        _id: `g${groceryIndex++}`,
        name: p.name,
        price: p.price,
        type: "personal_care",
        category: "grocery",
        stock: Math.floor(Math.random() * 50) + 25,
        img: p.img,
        reviews: getSampleReviews()
    }))
];

const allProducts = [...fashionProducts, ...groceryProducts];

// Write file content
const outputDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const fileContent = `// Auto-generated Comprehensive Products Catalog
// 320 Fashion Products + 156 Grocery Products = 476 Total Real Branded Products

const fashionProducts = ${JSON.stringify(fashionProducts, null, 4)};

const groceryProducts = ${JSON.stringify(groceryProducts, null, 4)};

const allProducts = [...fashionProducts, ...groceryProducts];

module.exports = {
    fashionProducts,
    groceryProducts,
    allProducts
};
`;

const targetPath = path.join(outputDir, "productsData.js");
fs.writeFileSync(targetPath, fileContent, "utf8");
console.log(`Successfully generated ${targetPath} with ${allProducts.length} items! ✅`);
