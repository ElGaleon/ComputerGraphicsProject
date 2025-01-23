/**
 *
 * @param {string} srcPath
 * @returns {Promise<any>}
 */
async function loadJsonFile(srcPath) {
  const response = await fetch(srcPath);
  return await response.json();
}
