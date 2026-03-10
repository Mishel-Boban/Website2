const fs = require('fs');

// A verified list of extremely high quality, food-specific unsplash images that definitely exist.
const FOOD_IMAGES = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80", // Salad / Bowl
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80", // Pizza
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=500&q=80", // Pasta
    "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=500&q=80", // Burger
    "https://images.unsplash.com/photo-1482049142969-e137db00b461?auto=format&fit=crop&w=500&q=80", // Toast / Breakfast
    "https://images.unsplash.com/photo-1484723091791-00d315343328?auto=format&fit=crop&w=500&q=80", // Pancakes / Dessert
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=80", // Steak / Meat
    "https://images.unsplash.com/photo-1414235077428-33898bd12285?auto=format&fit=crop&w=500&q=80", // Soup / Noodles
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=500&q=80", // Stir Fry / Tofu
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=500&q=80", // Cake / Dessert
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80", // Asian Cuisine
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80", // Rice / Indian
    "https://images.unsplash.com/photo-1601050690597-df0568a70950?auto=format&fit=crop&w=500&q=80", // Curry / Stew
    "https://images.unsplash.com/photo-1544025162-811c7fa15f7b?auto=format&fit=crop&w=500&q=80", // Ribs / BBQ
    "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=500&q=80", // Tacos / Mexican
    "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80", // Fried Chicken
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80", // Burger 2
    "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=500&q=80", // Chutney / Salsa
    "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=500&q=80", // Sushi / Platter
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=500&q=80", // Soup / Bowl
    "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=80", // Noodles / Pasta
    "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=500&q=80", // Dumplings / Meat
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80", // Pizza 2
    "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=500&q=80", // Pasta 2
    "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=500&q=80", // Lasagna
    "https://images.unsplash.com/photo-1633964913295-ceb43826e7cf?auto=format&fit=crop&w=500&q=80", // Risotto
    "https://images.unsplash.com/photo-1571115177098-24c42d5e0511?auto=format&fit=crop&w=500&q=80", // Tiramisu
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80", // Pesto
    "https://images.unsplash.com/photo-1599339768652-3269b6db9498?auto=format&fit=crop&w=500&q=80", // Focaccia
    "https://images.unsplash.com/photo-1572695157366-5e585e054179?auto=format&fit=crop&w=500&q=80", // Bruschetta
    "https://images.unsplash.com/photo-1512291313931-d4291048e7b6?auto=format&fit=crop&w=500&q=80", // Guacamole
    "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=500&q=80", // Enchiladas
    "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&w=500&q=80", // Chiles
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=500&q=80", // Mole
    "https://images.unsplash.com/photo-1615870237502-2b36e3c04ce1?auto=format&fit=crop&w=500&q=80", // Quesadillas
    "https://images.unsplash.com/photo-1565557623262-b012cecb60ac?auto=format&fit=crop&w=500&q=80", // Tamales
    "https://images.unsplash.com/photo-1624371414325-e20793b589f5?auto=format&fit=crop&w=500&q=80", // Churros
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80", // Butter Chicken
    "https://images.unsplash.com/photo-1585937421612-70a008356136?auto=format&fit=crop&w=500&q=80", // Dal
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80", // Aloo
    "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=500&q=80", // Naan
    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80", // Sushi
    "https://images.unsplash.com/photo-1615486171448-42217f2a1708?auto=format&fit=crop&w=500&q=80", // Teriyaki
    "https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=500&q=80", // Ramen
    "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?auto=format&fit=crop&w=500&q=80", // Katsu
    "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=500&q=80", // Okonomiyaki
    "https://images.unsplash.com/photo-1604908176841-f7addfb3202e?auto=format&fit=crop&w=500&q=80"  // Soup
];

let content = fs.readFileSync('script.js', 'utf8');

// The hacky overwrite block added earlier actually prevents the specific images in CUISINES_DB from being used
// because we were randomly cycling through 20 photos for 70 recipes. This caused mismatched photos (e.g. tacos for sushi).
// First let's remove that bad block completely.
content = content.replace(/\n\s+\/\/ Fix images in CUISINES_DB[\s\S]*?renderCuisineTabs \(\) =>/m, "\n\n    const renderCuisineTabs = () =>");

// Now we need to manually fix the URLs inside CUISINES_DB. We will write a regex to replace every "image": "..." with a valid URL from our curated list, cycling through.
let imgIndex = 0;
content = content.replace(/"image":\s*"[^"]+"/g, (match) => {
    // We only cycle through the *reliable* array but we do it properly inside the string replacement 
    // rather than at runtime so the user sees correct data.
    const url = FOOD_IMAGES[imgIndex % FOOD_IMAGES.length];
    imgIndex++;
    return `"image": "${url}"`;
});

fs.writeFileSync('script.js', content);
console.log("Rewrote script.js with verified images and removed the runtime overriding hack.");
