import { Recipe } from '@/types';

const BASE = 'https://www.myprotein.com/thezone/recipe';
const BASE2 = 'https://www.myprotein.com/thezone/recipes';

export const RECIPES: Recipe[] = [
  // CHICKEN
  { id: 'c1',  name: 'Spicy Chicken with Couscous',          category: 'chicken',    calories: 284, proteinG: 50, carbsG: 22, fatG: 5,  url: `${BASE}/spicy-chicken-with-couscous-macro-balanced-meals/` },
  { id: 'c2',  name: 'Chicken Curry Gyros',                  category: 'chicken',    calories: 541, proteinG: 40, carbsG: 52, fatG: 17, url: `${BASE}/chicken-curry-gyros-fakeaway-recipe/` },
  { id: 'c3',  name: 'Naked Chicken Burrito Bowl',           category: 'chicken',    calories: 278, proteinG: 30, carbsG: 35, fatG: 8,  url: `${BASE}/naked-chicken-burrito-bowl-meal-prep/` },
  { id: 'c4',  name: 'Zingy Chicken Burger',                 category: 'chicken',    calories: 468, proteinG: 59, carbsG: 49, fatG: 12, url: `${BASE}/zingy-chicken-burger-fakeaway-recipes/` },
  { id: 'c5',  name: 'Easy Pesto Chicken & Veg',             category: 'chicken',    calories: 523, proteinG: 52, carbsG: 36, fatG: 16, url: `${BASE}/easy-pesto-chicken-veg-meal-prep/` },
  { id: 'c6',  name: 'Creamy Lemon & Thyme Chicken',         category: 'chicken',    calories: 227, proteinG: 21, carbsG: 5,  fatG: 14, url: `${BASE}/creamy-lemon-thyme-chicken/` },
  { id: 'c7',  name: 'Creamy Cajun Chicken Pasta',           category: 'chicken',    calories: 516, proteinG: 38, carbsG: 71, fatG: 8,  url: `${BASE}/creamy-cajun-chicken-pasta-high-protein-meal-prep/` },
  { id: 'c8',  name: 'Buffalo Chicken Pasta Salad',          category: 'chicken',    calories: 485, proteinG: 49, carbsG: 30, fatG: 20, url: `${BASE}/buffalo-chicken-3-day-chicken-meal-prep/` },
  { id: 'c9',  name: '30-Minute Chicken Tikka Masala',       category: 'chicken',    calories: 586, proteinG: 49, carbsG: 69, fatG: 14, url: `${BASE}/30-minute-chicken-tikka-masala-meal-prep/` },
  { id: 'c10', name: 'One-Pot Creamy Garlic Chicken & Rice', category: 'chicken',    calories: 387, proteinG: 45, carbsG: 32, fatG: 7,  url: `${BASE}/one-pot-creamy-garlic-chicken-rice/` },
  { id: 'c11', name: 'Fajita Pasta Bake',                    category: 'chicken',    calories: 521, proteinG: 28, carbsG: 62, fatG: 16, url: `${BASE}/fajita-pasta-bake-2/` },
  { id: 'c12', name: 'Chicken & Chorizo Paella',             category: 'chicken',    calories: 404, proteinG: 31, carbsG: 52, fatG: 7,  url: `${BASE}/chicken-chorizo-paella/` },
  { id: 'c13', name: 'Easy Protein Bowl',                    category: 'chicken',    calories: 620, proteinG: 55, carbsG: 87, fatG: 10, url: `${BASE}/easy-protein-bowl-meal-prep/` },
  { id: 'c14', name: 'Marry Me Chicken Pasta',               category: 'chicken',    calories: 460, proteinG: 36, carbsG: 52, fatG: 13, url: `${BASE}/marry-me-chicken/` },
  { id: 'c15', name: 'One-Pot Chicken Ramen',                category: 'chicken',    calories: 479, proteinG: 47, carbsG: 35, fatG: 11, url: `${BASE}/easy-one-pot-chicken-ramen/` },
  { id: 'c16', name: 'BBQ Chicken & Rice',                   category: 'chicken',    calories: 511, proteinG: 41, carbsG: 57, fatG: 6,  url: `${BASE}/meal-prep-chicken-and-rice-recipe/` },
  { id: 'c17', name: 'Creamy Tomato Chicken Sandwich',       category: 'chicken',    calories: 359, proteinG: 29, carbsG: 32, fatG: 11, url: `${BASE}/creamy-tomato-chicken-sandwich-protein-plates-recipe-book/` },
  { id: 'c18', name: 'Crispy Honey Sriracha Chicken Tenders',category: 'chicken',    calories: 335, proteinG: 40, carbsG: 37, fatG: 2,  url: `${BASE}/honey-sriracha-chicken-tenders/` },
  { id: 'c19', name: 'Peri Peri Chicken',                    category: 'chicken',    calories: 656, proteinG: 42, carbsG: 67, fatG: 26, url: `${BASE}/peri-peri-chicken-fakeaway/` },
  // FISH
  { id: 'f1',  name: 'Easy Tuna Pasta Salad',                category: 'fish',       calories: 415, proteinG: 26, carbsG: 40, fatG: 20, url: `${BASE}/easy-pasta-salad-meal-prep-recipe/` },
  { id: 'f2',  name: 'Salmon Poke Bowl',                     category: 'fish',       calories: 552, proteinG: 24, carbsG: 70, fatG: 19, url: `${BASE}/salmon-poke-bowl-recipe-high-protein-meal-prep/` },
  { id: 'f3',  name: 'Sweet Chilli Glazed Salmon',           category: 'fish',       calories: 483, proteinG: 29, carbsG: 54, fatG: 16, url: `${BASE}/sweet-chilli-glazed-salmon/` },
  { id: 'f4',  name: 'Homemade Fish Finger Sandwich',        category: 'fish',       calories: 685, proteinG: 38, carbsG: 86, fatG: 20, url: `${BASE}/homemade-fish-finger-sandwich-protein-plates-recipe-book/` },
  { id: 'f5',  name: 'Protein Pocket Onigiri',               category: 'fish',       calories: 239, proteinG: 9,  carbsG: 35, fatG: 7,  url: `${BASE}/protein-pocket-onigiri-protein-plates-recipe-book/` },
  { id: 'f6',  name: 'Crispy Sriracha Prawns with Black Rice',category: 'fish',      calories: 520, proteinG: 49, carbsG: 72, fatG: 15, url: `${BASE}/crispy-sriracha-prawns-with-black-rice/` },
  // MEAT
  { id: 'm1',  name: 'Low-Carb Loaf Tin Lasagne',            category: 'meat',       calories: 527, proteinG: 36, carbsG: 68, fatG: 22, url: `${BASE}/loaf-tin-lasagne-3-day-meal-prep/` },
  { id: 'm2',  name: 'Creamy Sausage Pasta',                 category: 'meat',       calories: 415, proteinG: 34, carbsG: 48, fatG: 5,  url: `${BASE}/healthy-pasta-recipes-sausage-pasta/` },
  { id: 'm3',  name: 'Sweet Potato & Chorizo Hash',          category: 'meat',       calories: 437, proteinG: 24, carbsG: 38, fatG: 23, url: `${BASE}/sweet-potato-hash-recipe/` },
  { id: 'm4',  name: 'Beef Ramen Noodles',                   category: 'meat',       calories: 482, proteinG: 26, carbsG: 61, fatG: 15, url: `${BASE}/beef-ramen-noodles-high-protein/` },
  { id: 'm5',  name: 'Homemade Beef Crunch Wraps',           category: 'meat',       calories: 467, proteinG: 32, carbsG: 37, fatG: 20, url: `${BASE}/homemade-beef-crunch-wraps-fakeaway/` },
  { id: 'm6',  name: 'Chicken & Bacon Bulking Salad',        category: 'meat',       calories: 1361,proteinG: 95, carbsG: 27, fatG: 99, url: `${BASE}/chicken-bacon-bulking-salad-high-protein-1350kcal/` },
  { id: 'm7',  name: 'Meatball Chilli Con Carne',            category: 'meat',       calories: 411, proteinG: 34, carbsG: 28, fatG: 15, url: `${BASE2}/meatball-chilli-con-carne/` },
  { id: 'm8',  name: 'Spicy Korean Beef Wraps',              category: 'meat',       calories: 750, proteinG: 70, carbsG: 105,fatG: 30, url: `${BASE}/spicy-korean-beef-wraps/` },
  { id: 'm9',  name: 'Chorizo & Bean Stew',                  category: 'meat',       calories: 257, proteinG: 13, carbsG: 18, fatG: 11, url: `${BASE}/chorizo-bean-stew/` },
  { id: 'm10', name: 'Homemade Smash Burgers',               category: 'meat',       calories: 590, proteinG: 44, carbsG: 53, fatG: 21, url: `${BASE}/homemade-smash-burgers-fakeaway-recipe/` },
  // VEGETARIAN
  { id: 'v1',  name: 'Roasted Veg & Feta Tart',             category: 'vegetarian', calories: 282, proteinG: 9,  carbsG: 23, fatG: 16, url: `${BASE}/roast-veg-feta-pastry-tart/` },
  { id: 'v2',  name: 'One-Tray Halloumi Wraps',             category: 'vegetarian', calories: 467, proteinG: 21, carbsG: 35, fatG: 25, url: `${BASE}/one-tray-halloumi-wraps-protein-plates-recipe-book/` },
  { id: 'v3',  name: 'One-Pan Halloumi & Harissa Bake',     category: 'vegetarian', calories: 409, proteinG: 16, carbsG: 22, fatG: 25, url: `${BASE}/one-pan-halloumi-harissa-bake/` },
  // VEGAN
  { id: 'vg1', name: 'One-Pot Lentil Dahl',                 category: 'vegan',      calories: 191, proteinG: 9,  carbsG: 14, fatG: 9,  url: `${BASE}/one-pot-lentil-dahl-easy-vegan-meal-prep/` },
  { id: 'vg2', name: 'Vegan "Meatball" Sub',                category: 'vegan',      calories: 498, proteinG: 29, carbsG: 65, fatG: 11, url: `${BASE}/vegan-meatball-sub/` },
  { id: 'vg3', name: 'Vegan Fajitas',                       category: 'vegan',      calories: 439, proteinG: 12, carbsG: 35, fatG: 15, url: `${BASE}/15-minute-vegan-meal-ultimate-fajitas/` },
  { id: 'vg4', name: 'Crispy Tofu & Teriyaki Noodles',      category: 'vegan',      calories: 462, proteinG: 17, carbsG: 67, fatG: 14, url: `${BASE}/crispy-tofu-teriyaki-noodle-meal-prep/` },
  { id: 'vg5', name: 'Vegan Lentil Bolognese',              category: 'vegan',      calories: 486, proteinG: 21, carbsG: 86, fatG: 6,  url: `${BASE}/vegan-lentil-bolognese-meal-prep-recipe/` },
  { id: 'vg6', name: 'Nourishing Gut Soup',                 category: 'vegan',      calories: 318, proteinG: 16, carbsG: 55, fatG: 2,  url: `${BASE}/nourishing-gut-health-soup/` },
  { id: 'vg7', name: 'Buffalo Cauliflower Tacos',           category: 'vegan',      calories: 278, proteinG: 11, carbsG: 23, fatG: 15, url: `${BASE}/vegan-buffalo-cauliflower-tacos/` },
  { id: 'vg8', name: "Vegan Mac 'N' Cheese",                category: 'vegan',      calories: 452, proteinG: 16, carbsG: 63, fatG: 13, url: `${BASE}/vegan-mac-n-cheese/` },
  // DESSERT
  { id: 'd1',  name: 'Protein Cheesecake',                  category: 'dessert',    calories: 180, proteinG: 25, carbsG: 10, fatG: 4,  url: `${BASE}/protein-cheesecake-recipe/` },
  { id: 'd2',  name: 'Ultimate High-Protein Cookie',        category: 'dessert',    calories: 425, proteinG: 65, carbsG: 24, fatG: 22, url: `${BASE}/the-ultimate-high-protein-cookie/` },
  { id: 'd3',  name: 'Fudgey Chocolate Protein Brownies',   category: 'dessert',    calories: 99,  proteinG: 10, carbsG: 10, fatG: 2,  url: `${BASE}/fudgey-chocolate-protein-brownies/` },
  { id: 'd4',  name: 'Vimto Ice Lollies',                   category: 'dessert',    calories: 57,  proteinG: 5,  carbsG: 8,  fatG: 0,  url: `${BASE}/fruity-vimto-ice-lollies/` },
  { id: 'd5',  name: 'Protein Balls',                       category: 'dessert',    calories: 84,  proteinG: 5,  carbsG: 8,  fatG: 4,  url: `${BASE}/only-protein-balls-recipe-you-need/` },
  // AIR FRYER
  { id: 'a1',  name: 'Air Fryer Pizza',                     category: 'airfryer',   calories: 404, proteinG: 24, carbsG: 70, fatG: 2,  url: `${BASE}/air-fryer-pizza-recipe/` },
  { id: 'a2',  name: 'Air Fryer Buffalo Chicken Wings',     category: 'airfryer',   calories: 243, proteinG: 20, carbsG: 7,  fatG: 16, url: `${BASE}/air-fryer-buffalo-chicken-wings/` },
  { id: 'a3',  name: 'Air Fryer Teriyaki Salmon',           category: 'airfryer',   calories: 600, proteinG: 40, carbsG: 75, fatG: 35, url: `${BASE}/easy-air-fryer-teriyaki-salmon/` },
  { id: 'a4',  name: 'Air Fryer Chicken Skewers',           category: 'airfryer',   calories: 356, proteinG: 35, carbsG: 47, fatG: 4,  url: `${BASE}/air-fryer-chicken-skewers/` },
  { id: 'a5',  name: 'Air Fryer Popcorn Chicken',           category: 'airfryer',   calories: 347, proteinG: 43, carbsG: 21, fatG: 9,  url: `${BASE}/air-fryer-popcorn-chicken-fakeaway/` },
];
