"use strict";

import * as model from "./model.js";
import { MODAL_CLOSE_SEC } from "./config.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import AddRecipeView from "./views/addRecipeView";

import "core-js/stable";
import "regenerator-runtime/runtime";
import addRecipeView from "./views/addRecipeView";

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    recipeView.renderSpinner();

    // COMMENT 1. Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // COMMENT 2. Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // COMMENT 3. Loading recipe
    await model.loadRecipe(id);

    // COMMENT 4. Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // COMMENT 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // COMMENT 2) Load search results
    await model.loadSearchResults(query);

    // COMMENT 3) Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // COMMENT 4) Render inital pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // COMMENT 1) Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // COMMENT 2) Render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // COMMENT Update the recipe servings (in state)
  model.updateServings(newServings);
  // COMMENT Update the view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // COMMENT 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // COMMENT 2) Update recipe view
  recipeView.update(model.state.recipe);

  // COMMENT Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // COMMENT SHow loading spinner
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);

    // COMMENT Render recipe
    recipeView.render(model.state.recipe);

    // COMMENT Success Message
    addRecipeView.renderMessage();

    // COMMENT Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // COMMENT Change ID in url
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // COMMENT Close form window
    setTimeout(function () {
      addRecipeView.ToggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error("💥💥", err);
    addRecipeView.renderError(err.message);
  }
};

const newFeautre = function () {
  console.log("Welcome to the application!");
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeautre();
};
init();
