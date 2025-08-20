/**
 * Generic function to generate any story-related media URL
 * @param {string} storyId - The story ID
 * @param {string} mediaPath - The media path
 * @returns {string} The complete media URL
 */
const apiUrl = import.meta.env.VITE_API_URL;

export function getMediaUrl(story, mediaPath) {
  return `${apiUrl}/story/${encodeURIComponent(story.id)}${mediaPath}?v=${
    story.lastUpdate
  }`;
}
