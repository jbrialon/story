/**
 * Generic function to generate any story-related media URL
 * @param {string} storyId - The story ID
 * @param {string} mediaPath - The media path
 * @returns {string} The complete media URL
 */
export function getMediaUrl(storyId, mediaPath) {
  return `https://api.jerem.cool/story/${encodeURIComponent(
    storyId
  )}${mediaPath}`;
}
