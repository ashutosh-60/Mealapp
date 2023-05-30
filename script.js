const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input')
const mealList = document.getElementById("meal");
const mealResult = document.getElementsByClassName('meal-result')[0];
const favFoodList = document.getElementsByClassName('fav-food-list')[0];
const mealRecipe = document.getElementById('recipe-btn');
const favFoodMenubtn = document.getElementById('fav-btn-menu');
const favFoodMenu= document.getElementsByClassName('fav-food-menu')[0];

let foodlist = [];
let favFood = JSON.parse(localStorage.getItem("favFood")) || [];
let html = '';


// Render Meal List
function addFoodToDOM(food, status){
    console.log(food)
    html += `
    <div class="meal-item" data-id = "${food.idMeal}">
        <div class = "fav-button">
            <i class="fa-${status ? "solid" : "regular"} fa-heart"></i>
        </div>
        <div class = "meal-img">
            <img src = '${food.strMealThumb}' alt = 'food'/>
        </div>
        <div class="meal-name">
            <h3>${food.strMeal}</h3>
            <a href= '#'class="recipe-btn" id="recipe-btn">Get Recipe</a>
        </div>
    </div>
    `
}

function renderList(list){
    html = ''
    for (let i = 0; i < list.length; i++){
        const storedFav = JSON.parse(localStorage.getItem("favFood")) || []
        const isAvailable = storedFav.filter(function(food){ 
            return food.idMeal === list[i].idMeal
        })
        list[i].status = isAvailable.length ? true : false;
        addFoodToDOM(list[i], list[i].status);
    }
    mealResult.classList.remove('hidden')
    mealList.innerHTML = html
}

function getMealList (e) {
    if (e.key === 'Enter' || e.target.id === 'search-btn' || e.target.parentElement.id === 'search-btn'){
        let searchTxt = document.getElementById('search-input').value.trim();
        fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTxt}`)
        .then(Response => Response.json())
        .then(data => {
            if (data.meals){
                console.log(data.meals)
            foodlist = data.meals;
            mealList.classList.remove('not-found')
            mealResult.classList.remove('hidden')
            renderList(foodlist);
            }else{
                mealList.innerHTML = 'Sorry, No Meals are Available';
                mealList.classList.add('not-found')
            }
        })
        .catch(function(error){
            console.log(error)
        })
    }  
}

// Render Recipe Page
function renderRecipe(recipe){
    recipe = recipe[0]
    let html = `
    <h2 class = "recipe-title">${recipe.strMeal}</h2>
    <p class = "recipe-category">${recipe.strCategory}</p>
    <div class = "recipe-instruction">
      <h3>Instructions:</h3>
      <p>${recipe.strInstructions}</p>
    </div>
    <div class = "recipe-meal-img">
      <img src = "${recipe.strMealThumb}" alt = "food">
    </div>
    <div class = "recipe-link">
        <a href="${recipe.strYoutube}" target='_blank'>Watch Video</a>
    </div>
    `
    let mealDetailsContent = document.getElementsByClassName('meal-details-content')[0];
    mealDetailsContent.innerHTML = html
    mealDetailsContent.parentElement.classList.add('show')
}

// Render Favourites Menu
function renderFav () {
    html = ''
    for (let i = 0; i < favFood.length; i++){
        html += `
        <div class="fav-food-list-item">
                <div class = "fav-meal-img">
                    <img src = '${favFood[i].strMealThumb}' alt = 'food'/>
                </div>
                <div class="fav-meal-name">
                    <h3>${favFood[i].strMeal}</h3>
                    <a href="${favFood[i].strYoutube}" target='_blank' class="fav-video-link">Watch Video</a>
                </div>
            <div class="remove-fav" id="remove-fav" data-id="${favFood[i].idMeal}">
                <i class="fa-solid fa-trash"></i>
            </div>
        </div>
    `
    }
    favFoodList.innerHTML = html
}

// Handle Click Request as per Click function
function handleClickRequest(e){
    const target = e.target
    console.log(target)
    if (target.className  === 'recipe-btn'){     
        let mealItem= e.target.parentElement.parentElement;
        
        const Recipe = foodlist.filter(function(food){
            return food.idMeal === mealItem.dataset.id
        });
        renderRecipe(Recipe)
    }
    else if (target.id === 'close-btn'){
        let closebtn= e.target.parentElement.parentElement
        closebtn.classList.remove('show')
    }

    else if (target.parentElement.className === 'fav-button'){
        // console.log(target.parentElement)
        let mealItem= e.target.parentElement.parentElement;
        const datasetObj = Object.assign({},mealItem.dataset)
        const Recipe = foodlist.filter(function(food){
            return food.idMeal === datasetObj.id
        });
        console.log(Recipe)
        if (Recipe[0].status){
            Recipe[0].status = false
            target.parentElement.innerHTML = '<i class="fa-regular fa-heart"></i>';
            const newfavFood = favFood.filter(function(food){
                return food.idMeal !== mealItem.dataset.id
            })
            favFood = newfavFood;
            renderFav () 
        }else{
            target.parentElement.innerHTML = '<i class="fa-solid fa-heart"></i>'
            Recipe[0].status = true
            favFood.push(Recipe[0])
            let storedFav = JSON.parse(localStorage.getItem("favFood"))
            if (!storedFav) storedFav = []
            storedFav.push(Recipe[0])
            localStorage.setItem("favFood", JSON.stringify(storedFav))
            renderFav ()
        }
    }

    else if (target?.id === 'fav-btn-menu' || target.parentElement?.id == 'fav-btn-menu'){
        favFoodMenubtn.classList.add('hidden')
        favFoodMenu.classList.remove('hidden')
        renderFav ()
    }

    else if (target.id === 'menu-close-btn'){
        favFoodMenubtn.classList.remove('hidden')
        favFoodMenu.classList.add('hidden')
    }

    else if (target.id === 'remove-fav' || target.parentElement.id == 'remove-fav'){
        if (target.id === 'remove-fav'){
            mealId = target.dataset.id
        }else{
            mealId = target.parentElement.dataset.id
        }
        
        const newfavFood = favFood.filter(function(food){
            return food.idMeal !== mealId
        })
        favFood = newfavFood;
        const storedFav = JSON.parse(localStorage.getItem("favFood"))
        localStorage.setItem("favFood", JSON.stringify(storedFav.filter(function(food){
            return food.idMeal !== mealId
        })))
        renderFav ()
        renderList (foodlist)
    }
}


// event Listener
searchBtn.addEventListener('click', getMealList);
searchInput.addEventListener('keyup', getMealList)
document.addEventListener('click', handleClickRequest);

