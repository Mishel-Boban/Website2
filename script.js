document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('ingredient-input');
    const addBtn = document.getElementById('add-btn');
    const ingredientsContainer = document.getElementById('ingredients-container');
    // Setup API Key Management
    let geminiApiKey = localStorage.getItem('gemini_api_key') || '';
    
    // Add API key input to UI dynamically
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const apiKeyDiv = document.createElement('div');
        apiKeyDiv.style.marginTop = '20px';
        apiKeyDiv.style.padding = '15px';
        apiKeyDiv.style.background = 'rgba(255, 107, 53, 0.1)';
        apiKeyDiv.style.borderRadius = '12px';
        apiKeyDiv.style.fontSize = '0.9rem';
        
        apiKeyDiv.innerHTML = `
            <div style="margin-bottom: 8px; font-weight: 600;">
                <i class="fa-solid fa-key" style="color: var(--primary);"></i> Gemini API Key Required
            </div>
            <div style="display: flex; gap: 10px;">
                <input type="password" id="api-key-input" placeholder="Enter your Gemini API Key..." 
                    style="flex: 1; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--glass-border); background: var(--bg-card); color: var(--text-main);"
                    value="${geminiApiKey}">
                <button id="save-key-btn" style="padding: 8px 16px; border-radius: 6px; background: var(--primary); color: white; border: none; cursor: pointer; font-weight: 600;">Save</button>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">
                Your key is only stored locally in your browser. Get one <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: var(--primary);">here</a>.
            </div>
        `;
        heroContent.appendChild(apiKeyDiv);
        
        document.getElementById('save-key-btn').addEventListener('click', () => {
            const newKey = document.getElementById('api-key-input').value.trim();
            if (newKey) {
                geminiApiKey = newKey;
                localStorage.setItem('gemini_api_key', newKey);
                alert('API Key saved successfully!');
            }
        });
    }

    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        const themeIcon = themeToggleBtn.querySelector('i');
        
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        }

        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeIcon.classList.replace('fa-sun', 'fa-moon');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            }
        });
    }

    // State to keep track of ingredients
    let ingredients = [];

    // Make an initial render
    const init = () => {
        renderIngredients();
    };

    // Add ingredient function
    const addIngredient = (ingredient) => {
        // Clean up the ingredient string
        ingredient = ingredient.trim().toLowerCase();
        
        // Prevent empty or duplicate ingredients
        if (ingredient === '' || ingredients.includes(ingredient)) {
            // Optional: Show some duplicate animation feedback
            if (ingredients.includes(ingredient)) {
                shakeInput();
            }
            return;
        }

        // Add to state
        ingredients.push(ingredient);
        
        // Update UI
        renderIngredients();
        
        // Clear input
        inputField.value = '';
        inputField.focus();
    };

    // Remove ingredient function
    const removeIngredient = (ingredientToRemove) => {
        ingredients = ingredients.filter(ing => ing !== ingredientToRemove);
        renderIngredients();
    };

    // Helper for invalid input shake
    const shakeInput = () => {
        const wrapper = inputField.parentElement;
        wrapper.style.transform = 'translateX(-10px)';
        setTimeout(() => wrapper.style.transform = 'translateX(10px)', 100);
        setTimeout(() => wrapper.style.transform = 'translateX(-10px)', 200);
        setTimeout(() => wrapper.style.transform = 'translateX(0)', 300);
    };

    // Render ingredients to the DOM
    const renderIngredients = () => {
        // Clear the container
        ingredientsContainer.innerHTML = '';

        if (ingredients.length === 0) {
            ingredientsContainer.innerHTML = '<div class="empty-state">No ingredients added yet. Try adding "chicken" or "tomatoes"...</div>';
            return;
        }

        ingredients.forEach(ingredient => {
            // Create chip element
            const chip = document.createElement('div');
            chip.className = 'ingredient-chip';
            
            // Capitalize first letter for display
            const displayText = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
            
            chip.innerHTML = `
                ${displayText}
                <button class="remove-btn" aria-label="Remove ${displayText}">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;

            // Add event listener to the remove button
            const removeBtn = chip.querySelector('.remove-btn');
            removeBtn.addEventListener('click', () => {
                // Fade out animation before removing
                chip.style.transform = 'scale(0.8) translateY(5px)';
                chip.style.opacity = '0';
                chip.style.transition = 'all 0.2s ease-out';
                
                setTimeout(() => {
                    removeIngredient(ingredient);
                }, 200);
            });

            ingredientsContainer.appendChild(chip);
        });
    };

    // Event Listeners for adding ingredients
    addBtn.addEventListener('click', () => {
        addIngredient(inputField.value);
    });

    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addIngredient(inputField.value);
        }
    });

    const recipeResultsSection = document.getElementById('recipe-results-section');
    const recipesGrid = document.getElementById('recipes-grid');

    // Modal elements
    const modal = document.getElementById('recipe-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.querySelector('.close-modal');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    const openModal = (recipe) => {
        // Create ingredients HTML
        const allIngredients = recipe.ingredients.map(ing => {
            const isMissing = recipe.missingIngredients.includes(ing.toLowerCase());
            const icon = isMissing ? '<i class="fa-solid fa-xmark-circle"></i>' : '<i class="fa-solid fa-check-circle"></i>';
            const className = isMissing ? 'missing' : 'have';
            return `<li class="${className}">${icon} ${ing.charAt(0).toUpperCase() + ing.slice(1)}</li>`;
        }).join('');

        // Create instructions HTML
        const instructionsHtml = recipe.instructions.map(inst => `<li>${inst}</li>`).join('');

        modalBody.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" class="modal-img">
            <h2 class="modal-title">${recipe.title}</h2>
            <div class="modal-meta">
                <span><i class="fa-solid fa-clock"></i> ${recipe.time}</span>
                <span><i class="fa-solid fa-chart-simple"></i> ${recipe.difficulty}</span>
            </div>
            
            <div class="modal-section">
                <h4>Ingredients Needed</h4>
                <ul class="modal-list">
                    ${allIngredients}
                </ul>
            </div>
            
            <div class="modal-section">
                <h4>Instructions</h4>
                <ol class="modal-instructions">
                    ${instructionsHtml}
                </ol>
            </div>
        `;
        
        modal.classList.remove('hidden');
    };

    // Navigation Logic
    const navRecipes = document.getElementById('nav-recipes');
    const navHome = document.getElementById('nav-home');
    const heroSection = document.querySelector('.hero-container');
    const aiResultsSection = document.getElementById('recipe-results-section');
    const cuisinesSection = document.getElementById('popular-cuisines-section');

    const showHome = () => {
        heroSection.style.display = 'grid';
        cuisinesSection.classList.add('hidden');
        if (ingredients.length > 0 && Number(aiResultsSection.dataset.hasResults) === 1) {
            aiResultsSection.classList.remove('hidden');
        }
    };

    const showRecipesTab = () => {
        heroSection.style.display = 'none';
        aiResultsSection.classList.add('hidden');
        cuisinesSection.classList.remove('hidden');
        renderCuisineTabs();
    };

    if (navRecipes) navRecipes.addEventListener('click', (e) => { e.preventDefault(); showRecipesTab(); });
    if (navHome) navHome.addEventListener('click', (e) => { e.preventDefault(); showHome(); });

    // Cuisines Database
    const CUISINES_DB = {
        "Italian": [
            { id: "it1", title: "Margherita Pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80", time: "2 hrs", difficulty: "Medium", ingredients: ["pizza dough", "tomatoes", "mozzarella", "basil", "olive oil"], instructions: ["Preheat oven to 500°F (260°C).", "Stretch dough into a circle.", "Spread crushed tomatoes over dough.", "Top with sliced mozzarella and fresh basil.", "Bake for 10-12 minutes until crust is blistered."] },
            { id: "it2", title: "Spaghetti Carbonara", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=500&q=80", time: "25 mins", difficulty: "Medium", ingredients: ["spaghetti", "guanciale", "eggs", "pecorino romano", "black pepper"], instructions: ["Boil pasta in salted water.", "Fry guanciale in a pan until crispy.", "Whisk eggs and cheese in a bowl.", "Toss hot pasta with guanciale.", "Off the heat, quickly stir in egg mixture and lots of pepper."] },
            { id: "it3", title: "Lasagna al Forno", image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=500&q=80", time: "1.5 hrs", difficulty: "Hard", ingredients: ["lasagna noodles", "ragu", "béchamel sauce", "parmesan"], instructions: ["Make a rich meat ragu and creamy béchamel sauce.", "Boil lasagna noodles until al dente.", "Layer pasta, ragu, and béchamel in a baking dish.", "Top with generous parmesan.", "Bake at 375°F for 40 mins until bubbly."] },
            { id: "it4", title: "Risotto alla Milanese", image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7cf?auto=format&fit=crop&w=500&q=80", time: "45 mins", difficulty: "Medium", ingredients: ["arborio rice", "saffron", "chicken broth", "butter", "parmesan", "onion"], instructions: ["Sauté finely chopped onion in butter.", "Toast rice, then add a splash of white wine.", "Gradually add hot broth, stirring constantly.", "Dissolve saffron in broth and add to rice.", "Finish with cold butter and parmesan off heat."] },
            { id: "it5", title: "Tiramisu", image: "https://images.unsplash.com/photo-1571115177098-24c42d5e0511?auto=format&fit=crop&w=500&q=80", time: "4 hrs", difficulty: "Medium", ingredients: ["ladyfingers", "mascarpone", "eggs", "sugar", "espresso", "cocoa powder"], instructions: ["Whisk egg yolks with sugar, fold in mascarpone.", "Whip egg whites and fold into the mixture gently.", "Dip ladyfingers briefly in espresso.", "Layer ladyfingers and cream in a dish.", "Chill for at least 3 hours, dust with cocoa before serving."] },
            { id: "it6", title: "Pesto Genovese", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80", time: "15 mins", difficulty: "Easy", ingredients: ["fresh basil", "pine nuts", "garlic", "parmesan", "pecorino", "olive oil"], instructions: ["Toast pine nuts lightly.", "Pound garlic and a pinch of salt in a mortar.", "Add basil leaves and pound to a paste.", "Stir in the nuts and grated cheeses.", "Slowly drizzle in olive oil until emulsified."] },
            { id: "it7", title: "Ossobuco", image: "https://images.unsplash.com/photo-1544025162-811c7fa15f7b?auto=format&fit=crop&w=500&q=80", time: "2.5 hrs", difficulty: "Hard", ingredients: ["veal shanks", "white wine", "broth", "onions", "carrots", "celery", "gremolata"], instructions: ["Dust veal in flour and brown in a heavy pot.", "Remove meat, sauté diced vegetables.", "Deglaze with white wine, add broth.", "Return meat, cover, and braise for 2 hours.", "Serve garnished with gremolata (lemon zest, garlic, parsley)."] },
            { id: "it8", title: "Focaccia", image: "https://images.unsplash.com/photo-1599339768652-3269b6db9498?auto=format&fit=crop&w=500&q=80", time: "3 hrs", difficulty: "Medium", ingredients: ["bread flour", "yeast", "olive oil", "flaky salt", "rosemary"], instructions: ["Mix flour, water, yeast, and salt into a wet dough.", "Let it rise until doubled.", "Stretch into an oiled pan and let rise again.", "Dimple the dough with oiled fingers.", "Top with rosemary and flaky salt, bake until golden."] },
            { id: "it9", title: "Cacio e Pepe", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=500&q=80", time: "20 mins", difficulty: "Medium", ingredients: ["bucatini", "pecorino romano", "black pepper"], instructions: ["Boil pasta in slightly less water than usual.", "Toast crushed black peppercorns in a pan.", "Mix a little starchy pasta water with finely grated pecorino to make a paste.", "Toss pasta in the pepper pan with more pasta water.", "Off heat, rapidly stir in the cheese paste until creamy."] },
            { id: "it10", title: "Bruschetta", image: "https://images.unsplash.com/photo-1572695157366-5e585e054179?auto=format&fit=crop&w=500&q=80", time: "15 mins", difficulty: "Easy", ingredients: ["crusty bread", "tomatoes", "garlic", "basil", "olive oil"], instructions: ["Dice tomatoes and toss with basil, salt, and olive oil.", "Grill or toast thick slices of bread.", "Rub the warm bread with a raw garlic clove.", "Spoon the tomato mixture generously over the bread.", "Serve immediately."] }
        ],
        "Mexican": [
            { id: "mx1", title: "Tacos al Pastor", image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=500&q=80", time: "3 hrs", difficulty: "Hard", ingredients: ["pork shoulder", "achiote", "pineapple", "corn tortillas", "cilantro", "onion"], instructions: ["Marinate pork slices in achiote and spices.", "Stack pork with pineapple slices on a skewer.", "Roast vertically if possible, or grill the slices.", "Slice thinly onto warm corn tortillas.", "Garnish with diced onion, cilantro, and roasted pineapple."] },
            { id: "mx2", title: "Guacamole", image: "https://images.unsplash.com/photo-1512291313931-d4291048e7b6?auto=format&fit=crop&w=500&q=80", time: "10 mins", difficulty: "Easy", ingredients: ["avocados", "lime", "onion", "cilantro", "jalapeño", "salt"], instructions: ["Halve and pit the avocados, scoop out flesh.", "Mash roughly with a fork, leaving some chunks.", "Stir in finely diced onion, jalapeño, and cilantro.", "Squeeze fresh lime juice over the top.", "Season generously with salt and mix."] },
            { id: "mx3", title: "Enchiladas Verdes", image: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=500&q=80", time: "45 mins", difficulty: "Medium", ingredients: ["corn tortillas", "shredded chicken", "tomatillos", "jalapeños", "crema", "cheese"], instructions: ["Boil tomatillos and jalapeños, blend to make salsa verde.", "Warm tortillas to make them pliable.", "Fill tortillas with chicken and roll them up.", "Place in a dish, cover with salsa and cheese.", "Bake until cheese is bubbly, top with crema."] },
            { id: "mx4", title: "Chiles Rellenos", image: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&w=500&q=80", time: "1 hr", difficulty: "Hard", ingredients: ["poblano peppers", "cheese", "eggs", "flour", "tomato broth"], instructions: ["Roast poblanos until skin blisters, peel and deseed.", "Stuff each pepper with a block of melting cheese.", "Whip egg whites to stiff peaks, fold in yolks.", "Dust peppers in flour, dip in egg batter.", "Fry until golden, serve in a light tomato broth."] },
            { id: "mx5", title: "Pico de Gallo", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=500&q=80", time: "15 mins", difficulty: "Easy", ingredients: ["tomatoes", "onion", "jalapeño", "cilantro", "lime juice", "salt"], instructions: ["Finely dice the tomatoes, onion, and jalapeño.", "Chop the cilantro.", "Combine all ingredients in a bowl.", "Toss with salt and lime juice.", "Let sit for 10 minutes to meld flavors before serving."] },
            { id: "mx6", title: "Mole Poblano", image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=500&q=80", time: "3 hrs", difficulty: "Hard", ingredients: ["chicken", "dried chilies", "chocolate", "almonds", "sesame seeds"], instructions: ["Toast and rehydrate a mix of dried chilies.", "Blend chilies with toasted nuts, seeds, and spices.", "Simmer the sauce slowly, adding a disk of Mexican chocolate.", "Poach chicken separately.", "Serve chicken smothered in the rich mole sauce."] },
            { id: "mx7", title: "Quesadillas", image: "https://images.unsplash.com/photo-1615870237502-2b36e3c04ce1?auto=format&fit=crop&w=500&q=80", time: "15 mins", difficulty: "Easy", ingredients: ["flour tortillas", "oaxaca cheese", "butter", "salsa"], instructions: ["Place a tortilla in a warm, buttered skillet.", "Cover half the tortilla with shredded Oaxaca cheese.", "Fold the tortilla in half over the cheese.", "Cook until golden, flip and repeat.", "Cut into wedges and serve with salsa."] },
            { id: "mx8", title: "Tamales", image: "https://images.unsplash.com/photo-1565557623262-b012cecb60ac?auto=format&fit=crop&w=500&q=80", time: "3 hrs", difficulty: "Hard", ingredients: ["masa harina", "pork", "red chile sauce", "corn husks", "lard"], instructions: ["Soak corn husks in warm water until pliable.", "Whip lard into masa harina and broth to form a fluffy dough.", "Spread a thin layer of masa on a husk.", "Add a spoonful of pork mixed in red chile sauce.", "Fold the husk to enclose, steam for 1-2 hours."] },
            { id: "mx9", title: "Elote (Street Corn)", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=500&q=80", time: "20 mins", difficulty: "Easy", ingredients: ["corn on the cob", "mayonnaise", "cotija cheese", "chili powder", "lime"], instructions: ["Grill corn until charred in spots.", "Brush generously with mayonnaise.", "Roll the corn in crumbled cotija cheese.", "Sprinkle with chili powder.", "Serve with lime wedges to squeeze over top."] },
            { id: "mx10", title: "Churros", image: "https://images.unsplash.com/photo-1624371414325-e20793b589f5?auto=format&fit=crop&w=500&q=80", time: "40 mins", difficulty: "Medium", ingredients: ["flour", "water", "butter", "sugar", "cinnamon", "oil"], instructions: ["Boil water, butter, and salt, then stir in flour forcefully.", "Let dough cool slightly, pipe through a star tip into hot oil.", "Fry until golden and crispy.", "Drain briefly on paper towels.", "Roll warm churros in cinnamon sugar."] }
        ],
        "Indian": [
            { id: "in1", title: "Butter Chicken", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80", time: "1 hr", difficulty: "Medium", ingredients: ["chicken thighs", "yogurt", "garam masala", "tomato puree", "cream", "butter"], instructions: ["Marinate chicken in yogurt and spices, then grill.", "Simmer tomato puree with spices and lots of butter.", "Blend the sauce until completely smooth.", "Stir in cream and the cooked chicken.", "Simmer for 10 minutes, serve with naan."] },
            { id: "in2", title: "Palak Paneer", image: "https://images.unsplash.com/photo-1601050690597-df0568a70950?auto=format&fit=crop&w=500&q=80", time: "40 mins", difficulty: "Medium", ingredients: ["paneer", "spinach", "onions", "tomatoes", "garam masala", "cream"], instructions: ["Blanch spinach and blend into a bright green puree.", "Sauté onions, tomatoes, and spices until soft.", "Add spinach puree and simmer.", "Pan-fry paneer cubes lightly and add to the gravy.", "Finish with a splash of cream."] },
            { id: "in3", title: "Chicken Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80", time: "2 hrs", difficulty: "Hard", ingredients: ["basmati rice", "chicken", "yogurt", "saffron", "fried onions", "whole spices"], instructions: ["Marinate chicken in yogurt, mint, and spices.", "Parboil basmati rice with whole spices (cardamom, cloves).", "Layer partially cooked chicken and rice in a heavy pot.", "Top with saffron milk and fried onions.", "Seal pot tightly and slow cook (dum) for 45 minutes."] },
            { id: "in4", title: "Dal Makhani", image: "https://images.unsplash.com/photo-1585937421612-70a008356136?auto=format&fit=crop&w=500&q=80", time: "8 hrs", difficulty: "Medium", ingredients: ["black lentils", "kidney beans", "butter", "cream", "tomato puree", "garlic"], instructions: ["Soak lentils and beans overnight.", "Pressure cook until extremely soft.", "Simmer slowly with tomato puree, garlic, and spices.", "Mash some of the lentils against the pot to thicken.", "Stir in generous amounts of butter and cream, simmer for hours."] },
            { id: "in5", title: "Samosas", image: "https://images.unsplash.com/photo-1601050690597-df0568a70950?auto=format&fit=crop&w=500&q=80", time: "1.5 hrs", difficulty: "Medium", ingredients: ["potatoes", "peas", "pastry dough", "cumin", "coriander", "oil"], instructions: ["Make a stiff dough with flour, oil, and water. Rest.", "Boil and mash potatoes roughly.", "Sauté spices, peas, and potatoes for the filling.", "Roll dough, cut in half, form cones, and fill.", "Deep fry on low-medium heat until crisp and golden."] },
            { id: "in6", title: "Chole Bhature", image: "https://images.unsplash.com/photo-1601050690597-df0568a70950?auto=format&fit=crop&w=500&q=80", time: "2 hrs", difficulty: "Medium", ingredients: ["chickpeas", "tea leaves", "onions", "tomatoes", "flour", "yogurt"], instructions: ["Boil chickpeas with a tea bag for dark color.", "Cook a rich, spicy tomato-onion gravy and mix with chickpeas.", "For bhature, mix flour, yogurt, and leaving agents into a dough.", "Roll dough into discs.", "Deep fry discs until they puff up like balloons. Serve hot with chole."] },
            { id: "in7", title: "Aloo Gobi", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80", time: "35 mins", difficulty: "Easy", ingredients: ["potatoes", "cauliflower", "turmeric", "cumin seeds", "ginger"], instructions: ["Cut potatoes and cauliflower into similar-sized florets/cubes.", "Temper cumin seeds in hot oil.", "Add vegetables, turmeric, and ginger.", "Cover and cook slowly in its own steam until tender.", "Garnish with fresh cilantro."] },
            { id: "in8", title: "Garlic Naan", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=500&q=80", time: "2 hrs", difficulty: "Medium", ingredients: ["flour", "yeast", "yogurt", "garlic", "butter", "cilantro"], instructions: ["Knead a soft dough with flour, yeast, and yogurt. Let rise.", "Roll into an oval shape.", "Press minced garlic and cilantro onto the surface.", "Cook on a smoking hot tawa (skillet) or in a tandoor.", "Brush generously with melted butter immediately."] },
            { id: "in9", title: "Rogan Josh", image: "https://images.unsplash.com/photo-1585937421612-70a008356136?auto=format&fit=crop&w=500&q=80", time: "2 hrs", difficulty: "Hard", ingredients: ["lamb", "kashmiri chili powder", "fennel powder", "yogurt", "whole spices"], instructions: ["Brown the lamb pieces in oil/ghee.", "Add whole spices (cloves, cardamom) and Kashmiri chili.", "Whisk yogurt and add slowly to prevent curdling.", "Simmer with fennel powder and ginger until meat is tender.", "The dish should have a deep red color and rich gravy."] },
            { id: "in10", title: "Gulab Jamun", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80", time: "45 mins", difficulty: "Medium", ingredients: ["milk powder", "flour", "ghee", "sugar", "cardamom", "rose water"], instructions: ["Make a sugar syrup infused with cardamom and rose water.", "Knead milk powder, a little flour, and ghee into a soft dough.", "Roll into small, smooth balls without cracks.", "Deep fry slowly on low heat until dark brown.", "Soak hot balls in warm syrup for a few hours."] }
        ],
        "Japanese": [
            { id: "jp1", title: "Sushi Rolls (Maki)", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80", time: "1 hr", difficulty: "Hard", ingredients: ["sushi rice", "nori", "salmon", "cucumber", "avocado", "soy sauce"], instructions: ["Wash and cook sushi rice, season with rice vinegar.", "Place nori on a bamboo mat.", "Spread a thin layer of rice over the nori.", "Add slices of salmon, cucumber, and avocado.", "Roll tightly using the mat, slice, and serve."] },
            { id: "jp2", title: "Chicken Teriyaki", image: "https://images.unsplash.com/photo-1615486171448-42217f2a1708?auto=format&fit=crop&w=500&q=80", time: "30 mins", difficulty: "Easy", ingredients: ["chicken thighs", "soy sauce", "mirin", "sake", "sugar", "rice"], instructions: ["Mix soy sauce, mirin, sake, and sugar for the sauce.", "Pan-fry chicken thighs skin-side down until crispy.", "Pour the sauce over the chicken and simmer until glazed.", "Slice the chicken and serve over steamed rice.", "Garnish with sesame seeds and green onions."] },
            { id: "jp3", title: "Tonkotsu Ramen", image: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=500&q=80", time: "12 hrs", difficulty: "Hard", ingredients: ["pork bones", "ramen noodles", "chashu pork", "soft boiled egg", "green onions"], instructions: ["Boil pork bones intensely for 12 hours to make a milky broth.", "Prepare the tare (seasoning base) in your serving bowl.", "Boil the ramen noodles for 1-2 minutes.", "Add hot broth to the tare, then the noodles.", "Top with sliced chashu, a marinated egg, and green onions."] },
            { id: "jp4", title: "Katsu Curry", image: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?auto=format&fit=crop&w=500&q=80", time: "1 hr", difficulty: "Medium", ingredients: ["pork loin", "panko", "curry blocks", "potatoes", "carrots", "rice"], instructions: ["Bread the pork loin with flour, egg, and panko.", "Deep fry the pork until golden and cooked through.", "Sauté onions, carrots, and potatoes in a pot.", "Add water and simmer until vegetables are tender, stir in curry blocks.", "Serve the sliced katsu over rice with the rich curry sauce."] },
            { id: "jp5", title: "Okonomiyaki", image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=500&q=80", time: "40 mins", difficulty: "Medium", ingredients: ["cabbage", "flour", "eggs", "pork belly", "okonomiyaki sauce", "kewpie mayo"], instructions: ["Mix flour, eggs, water, and lots of shredded cabbage.", "Pour the batter onto a hot griddle to form a pancake.", "Top with thin slices of pork belly.", "Flip and cook until both sides are browned and pork is crispy.", "Smother with sweet sauce, mayo, bonito flakes, and seaweed powder."] },
            { id: "jp6", title: "Miso Soup", image: "https://images.unsplash.com/photo-1604908176841-f7addfb3202e?auto=format&fit=crop&w=500&q=80", time: "15 mins", difficulty: "Easy", ingredients: ["dashi", "miso paste", "tofu", "wakame", "green onions"], instructions: ["Heat dashi stock in a pot (do not boil).", "Rehydrate the wakame seaweed.", "Cut tofu into small cubes.", "Turn off heat and whisk in the miso paste.", "Add tofu, wakame, and garnish with green onions."] },
            { id: "jp7", title: "Gyudon (Beef Bowl)", image: "https://images.unsplash.com/photo-1633504581786-316880026e63?auto=format&fit=crop&w=500&q=80", time: "20 mins", difficulty: "Easy", ingredients: ["thinly sliced beef", "onions", "soy sauce", "mirin", "dashi", "rice"], instructions: ["Simmer sliced onions in a mixture of dashi, soy sauce, and mirin.", "Add the thinly sliced beef and cook until just done.", "The mixture should be slightly sweet and savory.", "Serve the beef and juices over a large bowl of hot rice.", "Top with pickled ginger or a raw/poached egg."] },
            { id: "jp8", title: "Tempura", image: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?auto=format&fit=crop&w=500&q=80", time: "45 mins", difficulty: "Medium", ingredients: ["shrimp", "sweet potato", "tempura flour", "ice water", "oil"], instructions: ["Prepare the shrimp and slice vegetables.", "Mix tempura flour lightly with ice-cold water (do not overmix).", "Heat oil to 340°F (170°C).", "Dip ingredients in the cold batter and fry immediately.", "Serve with tentsuyu dipping sauce or matcha salt."] },
            { id: "jp9", title: "Takoyaki", image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=500&q=80", time: "1 hr", difficulty: "Hard", ingredients: ["octopus", "takoyaki batter", "tenkasu", "green onion", "takoyaki pan"], instructions: ["Pour batter into a heated takoyaki pan.", "Drop a piece of boiled octopus into each hole.", "Sprinkle green onions and tenkasu (tempura scraps).", "Use a pick to continually flip the balls as they cook until round and golden.", "Top with sauce, mayo, and bonito flakes."] },
            { id: "jp10", title: "Yakitori", image: "https://images.unsplash.com/photo-1604908176841-f7addfb3202e?auto=format&fit=crop&w=500&q=80", time: "40 mins", difficulty: "Medium", ingredients: ["chicken", "green onions", "soy sauce", "mirin", "sugar", "bamboo skewers"], instructions: ["Alternate pieces of chicken and green onion on skewers.", "Make a tare by reducing soy sauce, mirin, and sugar.", "Grill the skewers over hot charcoal.", "Dip or brush the skewers with the tare multiple times while cooking.", "Serve immediately while hot and smoky."] }
        ],
        "Chinese": [
            { id: "cn1", title: "Kung Pao Chicken", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=500&q=80", time: "30 mins", difficulty: "Medium", ingredients: ["chicken", "peanuts", "dried chilies", "Sichuan peppercorns", "soy sauce", "vinegar"], instructions: ["Marinate diced chicken in soy sauce and cornstarch.", "Stir-fry peanuts until golden, set aside.", "Fry chilies and Sichuan peppercorns in oil.", "Add chicken and stir-fry aggressively.", "Add the sauce (soy sauce, sugar, vinegar) and peanuts, toss to coat."] },
            { id: "cn2", title: "Peking Duck", image: "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=500&q=80", time: "2 days", difficulty: "Hard", ingredients: ["whole duck", "maltose", "hoisin sauce", "pancakes", "cucumber", "scallions"], instructions: ["Air-dry the duck in the fridge for 24-48 hours.", "Coat with a maltose glaze and roast until the skin is shatteringly crisp.", "Carve the skin and meat thinly.", "Serve with thin mandarin pancakes.", "Roll meat, cucumber, and scallions in a pancake with hoisin sauce."] },
            { id: "cn3", title: "Mapo Tofu", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=500&q=80", time: "25 mins", difficulty: "Medium", ingredients: ["soft tofu", "ground pork", "doubanjiang", "Sichuan peppercorns", "garlic", "chili oil"], instructions: ["Blanch cubed soft tofu in salted water.", "Fry ground pork until crispy.", "Sauté doubanjiang (broad bean chili paste), garlic, and ginger in chili oil.", "Add water/broth and the tofu, simmer gently.", "Thicken with cornstarch and top with numbing Sichuan peppercorn powder."] },
            { id: "cn4", title: "Dim Sum (Har Gow)", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80", time: "2 hrs", difficulty: "Hard", ingredients: ["shrimp", "bamboo shoots", "wheat starch", "tapioca starch", "sesame oil"], instructions: ["Mix wheat and tapioca starch with boiling water to make a translucent dough.", "Chop shrimp and bamboo shoots, season lightly.", "Roll dough into very thin wrappers.", "Pleat the wrappers around the filling to form small pouches.", "Steam in a bamboo basket for 6 minutes until wrappers are clear."] },
            { id: "cn5", title: "Sweet and Sour Pork", image: "https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?auto=format&fit=crop&w=500&q=80", time: "45 mins", difficulty: "Medium", ingredients: ["pork shoulder", "pineapple", "bell peppers", "vinegar", "sugar", "ketchup"], instructions: ["Coat pieces of pork in a thick cornstarch batter.", "Deep fry the pork twice for extra crispiness.", "Mix vinegar, sugar, ketchup, and soy sauce for the sauce.", "Stir-fry bell peppers and pineapple chunks.", "Toss the crispy pork in the wok with the sweet and sour sauce."] },
            { id: "cn6", title: "Chow Mein", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=80", time: "20 mins", difficulty: "Easy", ingredients: ["egg noodles", "cabbage", "carrots", "green onions", "soy sauce", "sesame oil"], instructions: ["Boil the noodles until barely cooked.", "Pan-fry the noodles in a wok until slightly crispy and charred.", "Push noodles aside and stir-fry the shredded vegetables.", "Toss together with dark and light soy sauce.", "Finish with a drizzle of sesame oil."] },
            { id: "cn7", title: "Xiaolongbao (Soup Dumplings)", image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=500&q=80", time: "4 hrs", difficulty: "Hard", ingredients: ["pork skin", "ground pork", "flour", "ginger", "soy sauce", "black vinegar"], instructions: ["Make a rich pork skin broth and chill it until it sets into a firm jelly.", "Mix ground pork with the jellied broth and seasonings.", "Roll dough into thin wrappers with thicker centers.", "Place filling inside and pleat closed (traditionally exactly 18 folds).", "Steam until the jelly melts into soup inside the dough. Eat carefully!"] },
            { id: "cn8", title: "Hot Pot", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=500&q=80", time: "1 hr", difficulty: "Easy", ingredients: ["broth", "thinly sliced meat", "leafy greens", "mushrooms", "tofu", "dipping sauce"], instructions: ["Prepare a simmering pot of flavorful broth (spicy or mild) in the center of the table.", "Arrange a variety of thinly sliced meats and vegetables on platters.", "Diners cook their own ingredients by dipping them into the boiling broth.", "Mix your own dipping sauce with sesame paste, garlic, soy, and cilantro.", "Eat the cooked items immediately."] },
            { id: "cn9", title: "Char Siu (BBQ Pork)", image: "https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?auto=format&fit=crop&w=500&q=80", time: "24 hrs", difficulty: "Medium", ingredients: ["pork shoulder", "hoisin sauce", "honey", "five-spice powder", "soy sauce"], instructions: ["Cut pork into long strips.", "Marinate overnight in hoisin, honey, five-spice, and soy sauce.", "Roast in a hot oven, basting frequently with the marinade.", "Broil for the last few minutes to get a sticky, charred exterior.", "Slice thinly and serve with rice."] },
            { id: "cn10", title: "Dan Dan Noodles", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=500&q=80", time: "30 mins", difficulty: "Medium", ingredients: ["noodles", "ground pork", "sui mi ya cai", "chili oil", "sesame paste", "Sichuan peppercorns"], instructions: ["Prepare the sauce base in the serving bowl with chili oil, sesame paste, and soy sauce.", "Stir-fry ground pork with sui mi ya cai (preserved mustard greens).", "Boil the noodles and add them to the bowl with the sauce.", "Top with the crispy pork mixture and green onions.", "Mix thoroughly before eating to coat the noodles in the fiery, nutty sauce."] }
        ],
        "Middle Eastern": [
            { id: "me1", title: "Hummus", image: "https://images.unsplash.com/photo-1577906096429-f73c2c312435?auto=format&fit=crop&w=500&q=80", time: "15 mins", difficulty: "Easy", ingredients: ["chickpeas", "tahini", "lemon juice", "garlic", "olive oil"], instructions: ["Blend chickpeas until smooth.", "Add tahini, lemon juice, garlic, and salt.", "Slowly stream in ice water while blending to make it fluffy.", "Spread on a plate, creating a well in the center.", "Drizzle generously with high-quality olive oil."] },
            { id: "me2", title: "Falafel", image: "https://images.unsplash.com/photo-1593006526979-8f8115ebfbce?auto=format&fit=crop&w=500&q=80", time: "24 hrs", difficulty: "Medium", ingredients: ["dried chickpeas", "parsley", "cilantro", "onion", "cumin", "coriander"], instructions: ["Soak dried chickpeas overnight (do not use canned).", "Pulse chickpeas with herbs, onion, garlic, and spices in a food processor.", "Form the coarse mixture into balls or patties.", "Deep fry in hot oil until deeply browned and crispy outside.", "Serve in pita bread with tahini sauce and salad."] },
            { id: "me3", title: "Shawarma", image: "https://images.unsplash.com/photo-1632778149955-e80f8ce89eb5?auto=format&fit=crop&w=500&q=80", time: "4 hrs", difficulty: "Hard", ingredients: ["chicken/lamb", "yogurt", "lemon", "shawarma spices", "pita", "garlic sauce"], instructions: ["Marinate thin slices of meat heavily in yogurt, lemon, and spices.", "Stack the meat on a vertical spit (or pack tightly in a roasting pan).", "Roast slowly until the edges are crispy.", "Shave off the crispy outer layers of meat.", "Wrap in pita with garlic sauce (toum) and pickles."] },
            { id: "me4", title: "Shakshuka", image: "https://images.unsplash.com/photo-1590412200988-a430588647ac?auto=format&fit=crop&w=500&q=80", time: "30 mins", difficulty: "Easy", ingredients: ["eggs", "tomatoes", "bell peppers", "onions", "cumin", "paprika"], instructions: ["Sauté onions and bell peppers until soft.", "Add garlic, cumin, and paprika.", "Pour in crushed tomatoes and simmer into a thick sauce.", "Make small wells in the sauce and crack an egg into each.", "Cover and cook until the egg whites are set but yolks are runny. Serve with bread."] },
            { id: "me5", title: "Tabbouleh", image: "https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=500&q=80", time: "20 mins", difficulty: "Easy", ingredients: ["parsley", "bulgur", "tomatoes", "mint", "lemon juice", "olive oil"], instructions: ["Soak fine bulgur briefly until tender.", "Finely chop huge amounts of fresh parsley and mint.", "Dice tomatoes and onions very small.", "Toss everything together with the bulgur.", "Dress heavily with fresh lemon juice and olive oil."] },
            { id: "me6", title: "Baba Ganoush", image: "https://images.unsplash.com/photo-1627056093881-42cb91b8d2eb?auto=format&fit=crop&w=500&q=80", time: "45 mins", difficulty: "Medium", ingredients: ["eggplant", "tahini", "garlic", "lemon juice", "olive oil"], instructions: ["Char whole eggplants over an open flame until completely blackened and soft.", "Peel away the burnt skin and scoop out the smoky flesh.", "Mash the eggplant with a fork (do not blend).", "Stir in tahini, minced garlic, lemon juice, and salt.", "Serve chilled with a drizzle of olive oil."] },
            { id: "me7", title: "Mansaf", image: "https://images.unsplash.com/photo-1565557623262-b012cecb60ac?auto=format&fit=crop&w=500&q=80", time: "3 hrs", difficulty: "Hard", ingredients: ["lamb", "jameed (dried yogurt)", "rice", "pine nuts", "shrak bread", "almonds"], instructions: ["Rehydrate jameed to create a tangy yogurt sauce.", "Boil large chunks of lamb until falling-apart tender.", "Simmer the lamb in the jameed sauce.", "Cook rice with turmeric.", "Layer thin bread, rice, lamb, and toasted nuts on a large communal tray. Pour sauce over top."] },
            { id: "me8", title: "Knafeh", image: "https://images.unsplash.com/photo-1601050690597-df0568a70950?auto=format&fit=crop&w=500&q=80", time: "1 hr", difficulty: "Hard", ingredients: ["kataifi dough", "akkawi cheese", "butter", "sugar syrup", "pistachios"], instructions: ["Shred the kataifi dough and rub thoroughly with melted butter.", "Press half the dough into a pan.", "Spread a thick layer of desalted cheese over the dough.", "Top with the remaining dough and bake until golden brown.", "Invert onto a plate, drench immediately with hot sugar syrup, and top with crushed pistachios."] },
            { id: "me9", title: "Fatayer", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80", time: "2 hrs", difficulty: "Medium", ingredients: ["dough", "spinach", "onions", "sumac", "lemon juice"], instructions: ["Make a simple yeast dough and let it rise.", "Chop spinach, salt it to draw out water, and squeeze it completely dry.", "Mix spinach with onions, a heavy dose of sumac, and lemon juice.", "Cut dough into circles, place filling in the center, and pinch into triangles.", "Bake until golden."] },
            { id: "me10", title: "Kabsa", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80", time: "1.5 hrs", difficulty: "Medium", ingredients: ["chicken", "basmati rice", "tomatoes", "kabsa spices", "dried lime", "raisins"], instructions: ["Brown chicken pieces, then set aside.", "Sauté onions, garlic, and complex kabsa spices in the same pot.", "Add tomatoes, dried limes, and broth.", "Simmer chicken in the broth until cooked, then remove and roast to crisp the skin.", "Cook the rice in the incredibly flavorful spiced broth."] }
        ],
        "American": [
            { id: "am1", title: "Classic Cheeseburger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80", time: "20 mins", difficulty: "Easy", ingredients: ["ground beef", "hamburger buns", "american cheese", "lettuce", "tomato", "onion"], instructions: ["Form ground beef into patties, press a small dimple in the center.", "Season aggressively with salt and pepper.", "Grill or pan-fry on high heat to develop a deep crust.", "Add American cheese during the last minute of cooking to melt perfectly.", "Serve on a toasted bun with crisp lettuce, tomato, and onion."] },
            { id: "am2", title: "BBQ Ribs", image: "https://images.unsplash.com/photo-1544025162-811c7fa15f7b?auto=format&fit=crop&w=500&q=80", time: "6 hrs", difficulty: "Medium", ingredients: ["pork ribs", "dry rub", "bbq sauce", "apple juice"], instructions: ["Remove the membrane from the back of the ribs.", "Coat heavily with a sweet and spicy dry rub.", "Smoke at 225°F (107°C) for 3 hours.", "Wrap tightly in foil with a splash of apple juice and cook 2 more hours.", "Unwrap, brush with BBQ sauce, and cook 1 hour until sticky and tender."] },
            { id: "am3", title: "Macaroni and Cheese", image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=500&q=80", time: "45 mins", difficulty: "Medium", ingredients: ["macaroni", "cheddar cheese", "gruyere", "milk", "butter", "flour"], instructions: ["Boil macaroni until slightly underdone.", "Make a roux by cooking butter and flour together.", "Slowly whisk in warm milk to create a smooth béchamel sauce.", "Off the heat, stir in freshly grated cheeses until melted.", "Mix with pasta, top with breadcrumbs, and bake until bubbly and golden."] },
            { id: "am4", title: "Fried Chicken", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80", time: "24 hrs", difficulty: "Hard", ingredients: ["chicken pieces", "buttermilk", "flour", "spices", "oil"], instructions: ["Marinate chicken pieces in seasoned buttermilk overnight.", "Dredge chicken heavily in seasoned flour.", "Let the dredged chicken rest for 15 minutes so the crust adheres.", "Deep fry at 325°F (160°C) until golden brown and cooked through.", "Drain on a wire rack to keep the crust crispy."] },
            { id: "am5", title: "Clam Chowder", image: "https://images.unsplash.com/photo-1604908176841-f7addfb3202e?auto=format&fit=crop&w=500&q=80", time: "1 hr", difficulty: "Medium", ingredients: ["clams", "potatoes", "bacon", "heavy cream", "onions", "celery"], instructions: ["Fry diced bacon until crispy, remove bits but keep fat in the pot.", "Sauté onions and celery in the bacon fat.", "Add diced potatoes, clam juice, and simmer until potatoes are tender.", "Stir in chopped clams and heavy cream.", "Simmer gently (do not boil) and serve with oyster crackers."] },
            { id: "am6", title: "Philly Cheesesteak", image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=500&q=80", time: "25 mins", difficulty: "Easy", ingredients: ["ribeye steak", "hoagie rolls", "provolone", "onions"], instructions: ["Freeze the ribeye slightly to make it easy to slice paper-thin.", "Sauté sliced onions on a hot griddle until deeply caramelized.", "Cook the steak slices quickly on the griddle, chopping them with a spatula.", "Mix meat and onions, lay provolone cheese on top to melt.", "Scoop the mixture into a split hoagie roll."] },
            { id: "am7", title: "Apple Pie", image: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=500&q=80", time: "3 hrs", difficulty: "Hard", ingredients: ["apples", "pie crust", "sugar", "cinnamon", "nutmeg", "butter"], instructions: ["Make a flaky all-butter pie crust and chill it.", "Peel, core, and slice tart apples.", "Toss apples with sugar, cinnamon, nutmeg, and a little flour.", "Fill the pie crust, dot with butter, and cover with a top crust.", "Cut vents in the top and bake until the filling is bubbling and crust is deep brown."] },
            { id: "am8", title: "Buffalo Wings", image: "https://images.unsplash.com/photo-1524114664604-cd8133cd67ad?auto=format&fit=crop&w=500&q=80", time: "40 mins", difficulty: "Easy", ingredients: ["chicken wings", "hot sauce", "butter", "blue cheese dressing", "celery"], instructions: ["Deep fry or bake chicken wings until extremely crispy.", "Melt butter in a pan and whisk in vinegar-based hot sauce.", "Toss the hot crispy wings in the warm buffalo sauce.", "Serve immediately alongside celery sticks.", "Provide blue cheese dressing for dipping."] },
            { id: "am9", title: "Texas Chili", image: "https://images.unsplash.com/photo-1548128120-192f4c0ce302?auto=format&fit=crop&w=500&q=80", time: "3 hrs", difficulty: "Medium", ingredients: ["beef chuck", "dried chilies", "onions", "garlic", "cumin", "oregano"], instructions: ["Toast and rehydrate a mix of dried chilies, blend into a smooth paste.", "Brown cubes of beef chuck in a heavy pot.", "Sauté onions and garlic.", "Combine meat, chili paste, spices, and beef broth (no beans or tomatoes!).", "Simmer slowly for hours until the meat is fork-tender."] },
            { id: "am10", title: "Chocolate Chip Cookies", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=500&q=80", time: "1 hr", difficulty: "Easy", ingredients: ["flour", "butter", "brown sugar", "white sugar", "chocolate chips", "vanilla"], instructions: ["Cream softened butter with brown and white sugars until light and fluffy.", "Beat in eggs one at a time, then add vanilla.", "Mix in dry ingredients (flour, baking soda, salt) until just combined.", "Fold in generous amounts of chocolate chips.", "Drop spoonfuls onto a tray and bake at 375°F (190°C) until golden edges but soft centers."] }
        ]
    };

    const renderCuisineTabs = () => {
        const tabsContainer = document.getElementById('cuisine-tabs');
        tabsContainer.innerHTML = '';
        
        const cuisines = Object.keys(CUISINES_DB);
        
        cuisines.forEach((cuisine, index) => {
            const tab = document.createElement('button');
            tab.className = `cuisine-tab ${index === 0 ? 'active' : ''}`;
            tab.textContent = cuisine;
            
            tab.addEventListener('click', () => {
                document.querySelectorAll('.cuisine-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderCuisineRecipes(cuisine);
            });
            
            tabsContainer.appendChild(tab);
        });

        // initial render
        if (cuisines.length > 0) {
            renderCuisineRecipes(cuisines[0]);
        }
    };

    const renderCuisineRecipes = (cuisine) => {
        const grid = document.getElementById('cuisine-recipes-grid');
        grid.innerHTML = '';
        const recipes = CUISINES_DB[cuisine];

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card glass-panel';
            
            card.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-img">
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span><i class="fa-solid fa-clock"></i> ${recipe.time}</span>
                        <span><i class="fa-solid fa-chart-simple"></i> ${recipe.difficulty}</span>
                    </div>
                    <div class="recipe-missing">
                        <span style="color: var(--text-main); font-weight: normal;">Authentic ${cuisine} recipe</span>
                    </div>
                    <button class="view-recipe-btn">View Recipe</button>
                </div>
            `;
            
            const viewBtn = card.querySelector('.view-recipe-btn');
            viewBtn.addEventListener('click', () => {
                // Formatting recipe for openModal which expects matched/missing arrays
                openModal({
                    ...recipe,
                    missingIngredients: [], // Assume we aren't matching for this view
                    matchedIngredients: recipe.ingredients
                });
            });
            
            grid.appendChild(card);
        });
    };

    // Modal elements
    findRecipesBtn.addEventListener('click', async () => {
        if (ingredients.length === 0) {
            shakeInput();
            inputField.focus();
            return;
        }

        if (!geminiApiKey) {
            alert('Please enter your Gemini API Key first!');
            const keyInput = document.getElementById('api-key-input');
            if(keyInput) keyInput.focus();
            return;
        }

        // Simulate searching state
        const originalText = findRecipesBtn.innerHTML;
        findRecipesBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Asking Gemini AI...';
        findRecipesBtn.style.opacity = '0.9';
        findRecipesBtn.disabled = true;
        findRecipesBtn.style.cursor = 'wait';
        
        recipeResultsSection.classList.add('hidden');
        recipeResultsSection.dataset.hasResults = "1";
        
        try {
            await fetchRecipesFromGemini();
            // Show results section and scroll to it
            recipeResultsSection.classList.remove('hidden');
            setTimeout(() => {
                recipeResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } catch (error) {
            console.error(error);
            alert('Error fetching recipes. Please check your API key and try again.\n\nDetails: ' + error.message);
        } finally {
            // Reset button state
            findRecipesBtn.innerHTML = originalText;
            findRecipesBtn.style.opacity = '1';
            findRecipesBtn.disabled = false;
            findRecipesBtn.style.cursor = 'pointer';
        }
    });

    const fetchRecipesFromGemini = async () => {
        const prompt = `
        I have the following ingredients in my pantry: ${ingredients.join(', ')}.
        
        Act as an expert chef. Give me 3-6 amazing recipes I can make primarily using these exact ingredients. 
        It is okay if the recipe requires a few extra basic ingredients, but try to prioritize recipes that mostly use what I have.
        
        CRUCIAL: Make the instructions highly specific and extremely detailed. Include precise measurements in the ingredients list if possible. For the instructions, explain the exact cooking techniques, temperatures (e.g., medium-high heat, 375°F), and estimated times for each individual step to ensure foolproof cooking. Provide at least 5-8 detailed steps per recipe.
        
        Respond ONLY with a valid JSON array of objects. Do not include markdown formatting like \`\`\`json.
        Each object must have exactly this structure:
        {
            "id": "generate_a_random_number",
            "title": "Recipe Name",
            "image": "Use a relevant descriptive Unsplash image URL like https://source.unsplash.com/600x400/?food,recipe_name",
            "time": "e.g. 30 mins",
            "difficulty": "Easy, Medium, or Hard",
            "ingredients": ["1 cup of x", "2 tbsp of y", "etc"],
            "instructions": ["Highly detailed step 1: Heat 1 tbsp oil in a large skillet over medium-high heat for 2 mins.", "Specific step 2: Add chopped onions and sauté for 5 mins until translucent.", "Detailed step 3..."]
        }
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch from Gemini API');
        }

        const data = await response.json();
        
        try {
            const recipeText = data.candidates[0].content.parts[0].text;
            const parsedRecipes = JSON.parse(recipeText);
            
            // Post-process the recipes to calculate match percentage
            const processedRecipes = parsedRecipes.map(recipe => {
                const recipeIngsLower = recipe.ingredients.map(i => i.toLowerCase());
                const userIngsLower = ingredients.map(i => i.toLowerCase());
                
                const matchedIngredients = recipeIngsLower.filter(i => 
                    userIngsLower.some(ui => i.includes(ui) || ui.includes(i))
                );
                
                const missingIngredients = recipeIngsLower.filter(i => 
                    !userIngsLower.some(ui => i.includes(ui) || ui.includes(i))
                );
                
                // Fallback image since source.unsplash.com is mostly deprecated
                // We'll use random food images from Unsplash standard URLs
                const foodieImages = [
                    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=500&q=80",
                    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=500&q=80",
                    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=80",
                    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=500&q=80",
                    "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=500&q=80",
                    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80"
                ];
                
                const imageSrc = recipe.image.includes('source.unsplash.com') 
                    ? foodieImages[Math.floor(Math.random() * foodieImages.length)] 
                    : recipe.image;

                const matchPercentage = (matchedIngredients.length / recipeIngsLower.length) * 100;

                return {
                    ...recipe,
                    image: imageSrc,
                    matchedIngredients,
                    missingIngredients,
                    matchPercentage: isNaN(matchPercentage) ? 100 : matchPercentage
                };
            });

            // Sort by match percentage
            processedRecipes.sort((a, b) => b.matchPercentage - a.matchPercentage);
            
            renderRecipes(processedRecipes);
            
        } catch (e) {
            console.error("Failed to parse Gemini response:", e);
            throw new Error('AI returned invalid recipe data format.');
        }
    };

    const renderRecipes = (recipes) => {
        recipesGrid.innerHTML = '';
        
        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card glass-panel';
            
            let missingText = '';
            if (recipe.missingIngredients.length > 0) {
                missingText = `Missing: <span>${recipe.missingIngredients.slice(0, 2).join(', ')}${recipe.missingIngredients.length > 2 ? ' + more' : ''}</span>`;
            } else {
                missingText = `<span style="color: var(--success);"><i class="fa-solid fa-check-circle"></i> You have all ingredients!</span>`;
            }
            
            card.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-img">
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span><i class="fa-solid fa-clock"></i> ${recipe.time}</span>
                        <span><i class="fa-solid fa-chart-simple"></i> ${recipe.difficulty}</span>
                        <span style="margin-left:auto; font-weight:600; color:var(--primary)">
                            ${Math.round(recipe.matchPercentage)}% Match
                        </span>
                    </div>
                    <div class="recipe-missing">
                        ${missingText}
                    </div>
                    <button class="view-recipe-btn">View Recipe</button>
                </div>
            `;
            
            const viewBtn = card.querySelector('.view-recipe-btn');
            viewBtn.addEventListener('click', () => {
                openModal(recipe);
            });
            
            recipesGrid.appendChild(card);
        });
    };

    init();
});
