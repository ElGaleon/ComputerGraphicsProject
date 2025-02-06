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
  music[0].load();
}

async function renderSceneById(sceneId) {
  const jsonScene = await loadScene(sceneId);
  loadMusic(jsonScene.audio);
  window["scene"] = new Scene("#canvas", sceneId, jsonScene);
  scene.gui = new GUI(scene);
  scene.controller2D = new Controller2D(scene);
  render(scene);
  return scene;
}

async function main() {
  await renderSceneById('bomb');
}

document.getElementById('bomb').addEventListener("click", async () => {
  scene.gui.closeOldController();
  await renderSceneById('bomb');
});

document.getElementById('castle').addEventListener("click", async () => {
  scene.gui.closeOldController();
  await renderSceneById('castle');
});

document.getElementById('bowser').addEventListener("click", async () => {
  scene.gui.closeOldController();
  await renderSceneById('bowser');
});

$(document).ready(function () {
  // Bomb Selectors
  let bomb = $("#bomb");
  let bombSpan = $("#bomb > span");
  // Castle Selectors
  let castle = $("#castle");
  let castleSpan = $("#castle > span");
  // Castle Selectors
  let bowser = $("#bowser");
  let bowserSpan = $("#bowser > span");
  // Touch selector
  let touchSelector = $(".peer");
  showTouchControllerOrKeyboard();


  $('input:checkbox').change(
    function() {
      showTouchControllerOrKeyboard();
    }
  )

  function showTouchControllerOrKeyboard() {
    if (touchSelector.is(':checked')) {
      // keyboard
      $('#controller2D').hide();
      $('#touch-keyboard').show();
    } else {
      // gamepad
      $('#controller2D').show();
      $('#touch-keyboard').hide();
    }
  }

  function resetButtons() {
    bomb.removeClass("border border-amber-400");
    bombSpan.removeClass("bg-amber-500").addClass("bg-gray-200");

    castleSpan.removeClass("border border-amber-400");
    castleSpan.removeClass("bg-amber-500").addClass("bg-gray-200");

    bowser.removeClass("border border-amber-400");
    bowserSpan.removeClass("bg-amber-500").addClass("bg-gray-200");
  }

  bomb.click(function () {
    resetButtons();
    bomb.addClass("border border-amber-400");
    bombSpan.removeClass("bg-gray-200").addClass("bg-amber-500");
  });

  castle.click(function () {
    resetButtons();
    castle.addClass("border border-amber-400");
    castleSpan.removeClass("bg-gray-200").addClass("bg-amber-500");
  });

  bowser.click(function () {
    resetButtons();
    bowser.addClass("border border-amber-400");
    bowserSpan.removeClass("bg-gray-200").addClass("bg-amber-500");
  });
});


await main();





