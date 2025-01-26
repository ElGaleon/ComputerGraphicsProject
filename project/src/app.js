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
  console.log(sceneId);
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
  console.log(jsonScene);
  loadMusic(jsonScene.audio);
  window["scene"] = new Scene("canvas", sceneId, jsonScene);

  // canvas2DController()
  add_dat_gui(scene);
  // add_touch_canvas(scene);
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
  function resetButtons() {
    $("#bomb").removeClass("border border-amber-400");
    $("#bomb > span").removeClass("bg-amber-500").addClass("bg-gray-200");

    $("#castle").removeClass("border border-amber-400");
    $("#castle > span").removeClass("bg-amber-500").addClass("bg-gray-200");

    $("#bowser").removeClass("border border-amber-400");
    $("#bowser > span").removeClass("bg-amber-500").addClass("bg-gray-200");
  }

  $("#bomb").click(function() {
    console.log("Scene is bomb");
    resetButtons();
    $(this).addClass("border border-amber-400");
    $("#bomb > span").removeClass("bg-gray-200").addClass("bg-amber-500");
  });

  $("#castle").click(function() {
    console.log("Scene is castle");
    resetButtons();
    $(this).addClass("border border-amber-400");
    $("#castle > span").removeClass("bg-gray-200").addClass("bg-amber-500");
  });

  $("#bowser").click(function() {
    console.log("Scene is bowser");
    resetButtons();
    $(this).addClass("border border-amber-400");
    $("#bowser > span").removeClass("bg-gray-200").addClass("bg-amber-500");
  });
});

await main();





