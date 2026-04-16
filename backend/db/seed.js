const { getDbPromise, run, get, pool } = require('./database');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  await getDbPromise();

  const existing = await get('SELECT COUNT(*) as count FROM users');
  if (existing && Number(existing.count) > 0) {
    console.log('Database already seeded.');
    return;
  }

  const uid = 'user-default-001';
  await run('INSERT INTO users (id,name,email,phone) VALUES (?,?,?,?)', [uid, 'Madhav', 'madhav@example.com', '9876543210']);

  const cats = [
    { name: 'Mobiles', slug: 'mobiles', img: 'https://rukminim2.flixcart.com/flap/80/80/image/22fddf3c7da4c4f4.png', o: 1 },
    { name: 'Electronics', slug: 'electronics', img: 'https://rukminim2.flixcart.com/flap/80/80/image/69c6589653afdb9a.png', o: 2 },
    { name: 'Fashion', slug: 'fashion', img: 'https://rukminim2.flixcart.com/flap/80/80/image/0d75b34f7d8fbcb3.png', o: 3 },
    { name: 'Home & Furniture', slug: 'home-furniture', img: 'https://rukminim2.flixcart.com/flap/80/80/image/ab7e2b022a4587dd.jpg', o: 4 },
    { name: 'Appliances', slug: 'appliances', img: 'https://rukminim2.flixcart.com/flap/80/80/image/0139228b2f7eb413.jpg', o: 5 },
    { name: 'Books', slug: 'books', img: 'https://rukminim2.flixcart.com/flap/80/80/image/71050627a56b4693.png', o: 6 },
    { name: 'Grocery', slug: 'grocery', img: 'https://rukminim2.flixcart.com/flap/80/80/image/29327f40e9c4d26b.png', o: 7 },
    { name: 'Sports & Fitness', slug: 'sports-fitness', img: 'https://rukminim2.flixcart.com/flap/80/80/image/71050627a56b4693.png', o: 8 },
  ];

  const catMap = {};
  for (const c of cats) {
    const id = uuidv4();
    catMap[c.slug] = id;
    await run('INSERT INTO categories (id,name,slug,image_url,display_order) VALUES (?,?,?,?,?)', [id, c.name, c.slug, c.img, c.o]);
  }

  const img = (text, bg = '2874f0', fg = 'ffffff') => `https://placehold.co/600x600/${bg}/${fg}?text=${encodeURIComponent(text)}`;

  const products = [
    { name: 'Galaxy S24 Ultra 5G', slug: 'galaxy-s24-ultra', desc: 'Samsung Galaxy S24 Ultra with S Pen, 200MP camera, Snapdragon 8 Gen 3 processor.', price: 129999, op: 144999, dp: 10, cat: 'mobiles', brand: 'Samsung', r: 4.5, rc: 12847, stock: 45, hl: ['200 MP Camera', '6.8" QHD+ Display', 'Snapdragon 8 Gen 3', '5000 mAh Battery', 'S Pen Included'], specs: { General: { Brand: 'Samsung', Model: 'Galaxy S24 Ultra', OS: 'Android 14' }, Display: { Size: '6.8"', Type: 'Dynamic AMOLED 2X' }, Camera: { Rear: '200MP+50MP+12MP+10MP', Front: '12MP' }, Battery: { Capacity: '5000 mAh' } }, imgs: [img('Galaxy+S24+Ultra', '1a1a2e'), img('S24+Camera', '16213e'), img('S24+Display', '0f3460')] },
    { name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', desc: 'Apple iPhone 15 Pro Max with A17 Pro chip, titanium design, 48MP camera.', price: 159900, op: 169900, dp: 6, cat: 'mobiles', brand: 'Apple', r: 4.6, rc: 8932, stock: 30, hl: ['A17 Pro Chip', 'Titanium Design', '48MP Camera', 'USB-C', '6.7" Super Retina XDR'], specs: { General: { Brand: 'Apple', Model: 'iPhone 15 Pro Max', OS: 'iOS 17' }, Display: { Size: '6.7"', Type: 'Super Retina XDR OLED' }, Camera: { Rear: '48MP+12MP+12MP', Front: '12MP TrueDepth' } }, imgs: [img('iPhone+15+Pro', '1c1c1c'), img('iPhone+Camera', '2d2d2d'), img('iPhone+Titanium', '4a4a4a')] },
    { name: 'OnePlus 12 5G', slug: 'oneplus-12-5g', desc: 'OnePlus 12 with Snapdragon 8 Gen 3, Hasselblad camera, 100W charging.', price: 64999, op: 69999, dp: 7, cat: 'mobiles', brand: 'OnePlus', r: 4.4, rc: 6521, stock: 60, hl: ['Snapdragon 8 Gen 3', 'Hasselblad Camera', '100W SUPERVOOC', '5400 mAh Battery'], specs: { General: { Brand: 'OnePlus', Model: '12' }, Display: { Size: '6.82"', Type: 'LTPO AMOLED' }, Camera: { Rear: '50MP+48MP+64MP', Front: '32MP' } }, imgs: [img('OnePlus+12', 'eb0028'), img('OP12+Camera', 'c41e3a')] },
    { name: 'Pixel 8 Pro', slug: 'pixel-8-pro', desc: 'Google Pixel 8 Pro with Tensor G3, AI camera, 7 years updates.', price: 79999, op: 106999, dp: 25, cat: 'mobiles', brand: 'Google', r: 4.3, rc: 3210, stock: 25, hl: ['Tensor G3', 'AI Camera', '7 Years Updates', '50MP Triple Camera'], specs: { General: { Brand: 'Google', Model: 'Pixel 8 Pro' }, Display: { Size: '6.7"', Type: 'LTPO OLED' } }, imgs: [img('Pixel+8+Pro', '4285f4'), img('Pixel+Camera', '34a853')] },
    { name: 'Redmi Note 13 Pro+', slug: 'redmi-note-13-pro-plus', desc: '200MP camera, 120W HyperCharge, AMOLED display.', price: 29999, op: 32999, dp: 9, cat: 'mobiles', brand: 'Xiaomi', r: 4.2, rc: 18432, stock: 150, hl: ['200MP Camera', '120W HyperCharge', 'Dimensity 7200', '120Hz AMOLED'], specs: { General: { Brand: 'Xiaomi' }, Display: { Size: '6.67"', Type: 'AMOLED' } }, imgs: [img('Redmi+Note+13', 'ff6900'), img('Redmi+Camera', 'ff8c00')] },

    { name: 'Sony WH-1000XM5 Headphones', slug: 'sony-wh1000xm5', desc: 'Industry-leading noise cancellation, 30hr battery.', price: 26990, op: 34990, dp: 23, cat: 'electronics', brand: 'Sony', r: 4.5, rc: 4521, stock: 80, hl: ['Industry-leading ANC', '30 Hour Battery', 'Hi-Res Audio'], specs: { Audio: { Driver: '30mm', 'Freq Response': '4Hz-40kHz', Codec: 'LDAC, AAC' } }, imgs: [img('Sony+XM5', '1a1a1a'), img('XM5+Side', '2d2d2d')] },
    { name: 'MacBook Air M3 15"', slug: 'macbook-air-m3-15', desc: 'Apple MacBook Air with M3 chip, 15.3" Liquid Retina, 18hr battery.', price: 144900, op: 154900, dp: 6, cat: 'electronics', brand: 'Apple', r: 4.7, rc: 2103, stock: 20, hl: ['M3 Chip', '15.3" Liquid Retina', '18 Hour Battery', 'Fanless Design'], specs: { General: { Brand: 'Apple', Processor: 'Apple M3' }, Display: { Size: '15.3"', Type: 'Liquid Retina' }, Memory: { RAM: '8 GB', Storage: '256 GB SSD' } }, imgs: [img('MacBook+Air+M3', 'a3aaae'), img('MacBook+Open', 'e0e0e0')] },
    { name: 'Samsung 55" Crystal 4K UHD TV', slug: 'samsung-55-crystal-4k', desc: 'Crystal 4K with Dynamic Crystal Color, HDR, SmartThings.', price: 42990, op: 64900, dp: 34, cat: 'electronics', brand: 'Samsung', r: 4.3, rc: 7650, stock: 35, hl: ['55" Crystal 4K', 'HDR Support', 'SmartThings Hub', 'AirSlim Design'], specs: { Display: { Size: '55"', Resolution: '3840x2160', Type: 'Crystal UHD' } }, imgs: [img('Samsung+4K+TV', '000814'), img('TV+Room', '1a1a2e')] },
    { name: 'iPad Air M2 11"', slug: 'ipad-air-m2', desc: 'M2 chip, 11" Liquid Retina, Apple Pencil Pro support.', price: 59900, op: 69900, dp: 14, cat: 'electronics', brand: 'Apple', r: 4.6, rc: 1890, stock: 40, hl: ['M2 Chip', '11" Liquid Retina', 'Apple Pencil Pro', 'WiFi 6E'], specs: { General: { Brand: 'Apple', Processor: 'M2', Storage: '128 GB' } }, imgs: [img('iPad+Air+M2', '007aff'), img('iPad+Pencil', '5856d6')] },
    { name: 'JBL Charge 5 Speaker', slug: 'jbl-charge-5', desc: 'Portable Bluetooth speaker, IP67 waterproof, 20hr playtime.', price: 14999, op: 18999, dp: 21, cat: 'electronics', brand: 'JBL', r: 4.4, rc: 9870, stock: 100, hl: ['JBL Pro Sound', 'IP67 Waterproof', '20 Hour Playtime', 'Built-in Powerbank'], specs: { Audio: { 'Output': '30W RMS' } }, imgs: [img('JBL+Charge+5', 'ff6600'), img('JBL+Water', '0088cc')] },

    { name: 'Nike Air Max 270 Shoes', slug: 'nike-air-max-270', desc: 'Max Air 270 unit for soft ride, breathable mesh.', price: 8995, op: 13995, dp: 36, cat: 'fashion', brand: 'Nike', r: 4.3, rc: 5678, stock: 200, hl: ['Max Air 270 Unit', 'Breathable Mesh', 'Lightweight'], specs: { General: { Brand: 'Nike', Type: 'Running Shoes', Sole: 'Rubber' } }, imgs: [img('Nike+Air+Max', '111111'), img('Nike+Sole', 'e60023')] },
    { name: "Levi's 511 Slim Fit Jeans", slug: 'levis-511-slim-fit', desc: 'Classic slim fit jeans with stretch.', price: 2499, op: 4299, dp: 42, cat: 'fashion', brand: "Levi's", r: 4.2, rc: 12300, stock: 300, hl: ['Slim Fit', 'Stretch Denim', 'Machine Washable'], specs: { General: { Brand: "Levi's", Fit: 'Slim', Fabric: '99% Cotton' } }, imgs: [img("Levis+511+Jeans", '00518b'), img('Jeans+Detail', '003d73')] },
    { name: 'Allen Solly Formal Shirt', slug: 'allen-solly-formal-shirt', desc: 'Premium cotton formal shirt, regular fit.', price: 1199, op: 1999, dp: 40, cat: 'fashion', brand: 'Allen Solly', r: 4.1, rc: 8760, stock: 250, hl: ['Regular Fit', '100% Cotton', 'Full Sleeves'], specs: { General: { Brand: 'Allen Solly', Fabric: '100% Cotton', Pattern: 'Solid' } }, imgs: [img('Allen+Solly', 'f5f5f5', '333333'), img('Shirt+Detail', 'e8e8e8', '333333')] },

    { name: 'Wakefit Memory Foam Mattress', slug: 'wakefit-memory-foam', desc: 'Orthopaedic memory foam, Queen Size 78x60x6.', price: 8999, op: 16049, dp: 44, cat: 'home-furniture', brand: 'Wakefit', r: 4.3, rc: 34500, stock: 50, hl: ['Memory Foam', 'Orthopaedic Support', 'Queen Size', '10 Year Warranty'], specs: { Dimensions: { Length: '78"', Width: '60"', Height: '6"' } }, imgs: [img('Wakefit+Mattress', '4a90d9'), img('Mattress+Layers', '357abd')] },
    { name: 'Nilkamal Wooden Study Table', slug: 'nilkamal-study-table', desc: 'Engineered wood study table with storage shelves.', price: 5499, op: 8999, dp: 39, cat: 'home-furniture', brand: 'Nilkamal', r: 4.0, rc: 6780, stock: 30, hl: ['Engineered Wood', 'Storage Shelves', 'Walnut Finish'], specs: { Dimensions: { Length: '90 cm', Width: '45 cm', Height: '75 cm' } }, imgs: [img('Study+Table', '8b6914'), img('Table+Side', '6b4f12')] },

    { name: 'Samsung 253L Frost Free Fridge', slug: 'samsung-253l-fridge', desc: 'Digital Inverter, Convertible 5-in-1, 3 Star.', price: 24990, op: 33490, dp: 25, cat: 'appliances', brand: 'Samsung', r: 4.3, rc: 15600, stock: 25, hl: ['253L', 'Frost Free', 'Digital Inverter', '3 Star Rating'], specs: { General: { Capacity: '253 L', Type: 'Frost Free', 'Energy Rating': '3 Star' } }, imgs: [img('Samsung+Fridge', 'c0c0c0', '333333'), img('Fridge+Open', 'd0d0d0', '333333')] },
    { name: 'IFB 6.5 Kg Washing Machine', slug: 'ifb-65kg-washing', desc: 'Front load, 2D Wash, Aqua Energie, 5 Star.', price: 23990, op: 31490, dp: 24, cat: 'appliances', brand: 'IFB', r: 4.2, rc: 8900, stock: 20, hl: ['6.5 Kg', 'Front Load', '5 Star Rating', '4 Year Warranty'], specs: { General: { Capacity: '6.5 Kg', Type: 'Front Load' } }, imgs: [img('IFB+Washer', 'b0b0b0', '333333'), img('Washer+Panel', '909090', 'ffffff')] },

    { name: 'Atomic Habits - James Clear', slug: 'atomic-habits', desc: 'Build good habits & break bad ones. NYT Bestseller.', price: 399, op: 799, dp: 50, cat: 'books', brand: 'Penguin', r: 4.6, rc: 45600, stock: 500, hl: ['Paperback', 'English', '320 Pages', 'NYT Bestseller'], specs: { General: { Author: 'James Clear', Publisher: 'Penguin', Pages: '320', Language: 'English' } }, imgs: [img('Atomic+Habits', 'ffd700', '111111'), img('Book+Back', 'f0c000', '111111')] },
    { name: 'The Psychology of Money', slug: 'psychology-of-money', desc: 'Timeless lessons on wealth by Morgan Housel.', price: 299, op: 599, dp: 50, cat: 'books', brand: 'Jaico', r: 4.5, rc: 32100, stock: 400, hl: ['Paperback', 'English', '256 Pages'], specs: { General: { Author: 'Morgan Housel', Pages: '256' } }, imgs: [img('Psychology+of+Money', 'b8860b', 'ffffff')] },

    { name: 'Boldfit Adjustable Dumbbells 30kg', slug: 'boldfit-dumbbells-30kg', desc: 'Anti-slip grip, PVC coated, perfect for home gym.', price: 2999, op: 5999, dp: 50, cat: 'sports-fitness', brand: 'Boldfit', r: 4.1, rc: 7800, stock: 75, hl: ['30 Kg Total', 'Adjustable', 'Anti-Slip Grip', 'PVC Coated'], specs: { General: { Weight: '30 Kg', Material: 'PVC Coated Iron' } }, imgs: [img('Boldfit+Dumbbells', '2f4f4f'), img('Dumbbell+Set', '3c6060')] },
    { name: 'Nivia Storm Football Size 5', slug: 'nivia-storm-football', desc: 'Machine stitched, for training and recreation.', price: 549, op: 899, dp: 39, cat: 'sports-fitness', brand: 'Nivia', r: 4.0, rc: 11200, stock: 200, hl: ['Size 5', 'Machine Stitched', 'Rubber Material'], specs: { General: { Brand: 'Nivia', Size: '5', Material: 'Rubber' } }, imgs: [img('Nivia+Football', '228b22'), img('Football+Side', '2e8b57')] },

    { name: 'Tata Sampann Chana Dal 1kg', slug: 'tata-chana-dal', desc: 'Unpolished, high protein, no preservatives.', price: 145, op: 180, dp: 19, cat: 'grocery', brand: 'Tata Sampann', r: 4.3, rc: 23400, stock: 1000, hl: ['Unpolished', 'High Protein', '1 Kg Pack'], specs: { General: { Brand: 'Tata Sampann', Weight: '1 Kg' } }, imgs: [img('Tata+Chana+Dal', 'daa520', '111111')] },
    { name: 'Aashirvaad Atta 5kg', slug: 'aashirvaad-atta-5kg', desc: 'Superior Whole Wheat Atta, 0% Maida.', price: 289, op: 345, dp: 16, cat: 'grocery', brand: 'Aashirvaad', r: 4.4, rc: 56700, stock: 800, hl: ['100% Whole Wheat', '0% Maida', '5 Kg Pack'], specs: { General: { Brand: 'Aashirvaad', Weight: '5 Kg' } }, imgs: [img('Aashirvaad+Atta', 'b8860b', 'ffffff')] },
  ];

  for (const p of products) {
    const pid = uuidv4();
    await run('INSERT INTO products (id,name,slug,description,price,original_price,discount_percent,category_id,brand,rating,rating_count,stock,highlights,specifications) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [pid, p.name, p.slug, p.desc, p.price, p.op, p.dp, catMap[p.cat], p.brand, p.r, p.rc, p.stock, JSON.stringify(p.hl), JSON.stringify(p.specs)]);
    for (let i = 0; i < p.imgs.length; i++) {
      await run('INSERT INTO product_images (id,product_id,image_url,display_order) VALUES (?,?,?,?)', [uuidv4(), pid, p.imgs[i], i]);
    }
  }

  console.log(`\u2705 Seeded: ${cats.length} categories, ${products.length} products`);
}

// If this file is run directly (node db/seed.js), execute seed and exit
if (require.main === module) {
  seed()
    .then(() => pool.end())
    .catch(err => {
      console.error('Seed error:', err);
      pool.end();
      process.exit(1);
    });
}

module.exports = seed;
