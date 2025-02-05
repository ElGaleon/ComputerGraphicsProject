/**
 *
 * @param {string} srcPath
 * @returns {Promise<JSON>}
 */
async function loadJsonFile(srcPath) {
  try {
    const response = await fetch(srcPath);
    return await response.json();
  } catch (e) {
    console.error(e);
    throw Error("Error while loading json scene: " + e);
  }
}
