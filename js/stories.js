"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, deleteBTN = false) {
 console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const fav = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
      ${deleteBTN ? theDeleteBtn() : ""}
        ${fav ? isFav(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a><br>
        <small class="story-hostname">(${hostName})</small><br>
        <small class="story-author">by ${story.author}</small><br>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  $favoriteStories.empty();
  $userStories.empty();
  $loginForm.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// Sending Story Data to the Backend API

async function addNewStory(e) {
  e.preventDefault;

  const title = $("#newTitle").val();
  const url = $("#newURL").val();
  const author = $("#newAuthor").val();
  const user = currentUser.username;
  const data = {title, url, author, user};

  const story = await storyList.addStory(currentUser, data);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $("#newStoryForm").addClass("hidden");
  $("#newStoryForm").trigger("reset");

}

$("#formSub").on("click", addNewStory);

function isFav(story, user) {
  const Fav = user.isFavorite(story);
  const ifFav = Fav ? "fas" : "far";

  return `
  <i class="fav fa-star ${ifFav}"></i>
  `
};


async function favoriteButton (e) {
  const $target = $(e.target);
  const $li = $target.closest("li");
  const id = $li.attr("id");
 const list = storyList.stories.find(x => x.storyId === id);

if ($target.hasClass("fas")) {
  await currentUser.removeFavorite(list);
  $target.toggleClass("fas far");
} else {
  await currentUser.addFavorite(list);
  $target.toggleClass("fas far");
}
};

$allStoriesList.on("click", ".fav", favoriteButton);

function toggleFavList(e) {
  e.preventDefault;

  $favoriteStories.empty();
  $allStoriesList.empty();
  $userStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoriteStories.append("<h5>No favorites yet!</h5>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoriteStories.append($story);
    }
  }
}

$("#favToggle").on("click", toggleFavList);

async function removeStory(e){
  const $target = $(e.target);
  console.log($target);
  const $li = $target.closest("li");
  const id = $li.attr("id");

  await storyList.removeStory(currentUser, id);
  putUserStoriesOnPage();
};

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $userStories.empty();
  $favoriteStories.empty();
  $allStoriesList.empty();

  if (currentUser.ownStories.length === 0) {
    $userStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $userStories.append($story);
    }
  }

  $userStories.show();
};

$('#userToggle').on("click", putUserStoriesOnPage);

function theDeleteBtn() {
  return `
  <span class="trash">
        <i class="fas fa-trash-alt"></i>
        </span>` ;
        
}

$userStories.on("click", ".trash", removeStory);


