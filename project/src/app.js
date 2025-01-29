/**
 * Define JSON
 * @typedef {string} JSON
 */

/**
 *
 * @param {sceneId} sceneId
 * @returns {Promise<JSON>}
 */
async function loadScene(sceneId) {
  try {
    const scenePath = `./assets/json/${sceneId}.json`;
    const response = await fetch(scenePath);
    return await response.json();
  } catch (e) {
    console.error(e);
    throw Error("Error while loading json scene: " + e);
  }
}

/**
 *
 * @param {string} path
 */
function loadMusic(path) {
  const music = $("#music");
  $("#music-src").attr('src', path);
  music[0].pause();
  music[0].load();//suspends and restores all audio element
}

async function renderSceneById(sceneId) {
  const jsonScene = await loadScene(sceneId);
  loadMusic(jsonScene.audio);
  window["scene"] = new Scene("canvas", sceneId, jsonScene);

  add_dat_gui(scene);
  scene.render();
}

async function main(){
  await renderSceneById('bomb');
}

document.getElementById('bomb').addEventListener("click", async () => {
  await renderSceneById('bomb');
});

document.getElementById('castle').addEventListener("click", async () => {
  await renderSceneById('castle');
});

document.getElementById('bowser').addEventListener("click", async () => {
  await renderSceneById('bowser');
});

$(document).ready(function(){
  const bomb = $("#bomb");
  const bombSpan = $("#bomb > span");
  const castle = $("#castle");
  const castleSpan = $("#castle > span");
  const bowser = $("#bowser");
  const bowserSpan = $("#bowser > span");

  function resetButtons() {
    bomb.removeClass("border border-amber-400");
    bombSpan.removeClass("bg-amber-500").addClass("bg-gray-200");

    castleSpan.removeClass("border border-amber-400");
    castleSpan.removeClass("bg-amber-500").addClass("bg-gray-200");

    bowser.removeClass("border border-amber-400");
    bowserSpan.removeClass("bg-amber-500").addClass("bg-gray-200");
  }

  bomb.click(function() {
    resetButtons();
    $(this).addClass("border border-amber-400");
    bombSpan.removeClass("bg-gray-200").addClass("bg-amber-500");
  });

  castle.click(function() {
    resetButtons();
    $(this).addClass("border border-amber-400");
    castleSpan.removeClass("bg-gray-200").addClass("bg-amber-500");
  });

  bowser.click(function() {
    resetButtons();
    $(this).addClass("border border-amber-400");
    bowserSpan.removeClass("bg-gray-200").addClass("bg-amber-500");
  });
});


await main();





