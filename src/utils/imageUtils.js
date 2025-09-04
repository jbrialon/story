/**
 * Generic function to generate any story-related media URL
 * @param {string} storyId - The story ID
 * @param {string} mediaPath - The media path
 * @returns {string} The complete media URL
 */
const cdnURL = import.meta.env.VITE_CDN_URL;

export function getMediaUrl(story, mediaPath) {
  return `${cdnURL}/story/${encodeURIComponent(story.id)}${mediaPath}?v=${
    story.lastUpdate
  }`;
}
