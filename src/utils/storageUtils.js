const MEDIA_PROGRESS_KEY = "story-media-progress";
const STORY_VIEWED_KEY = "story-viewed";

function getStorageItem(key, fallback = {}) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

// Media progress
export function getSavedProgress() {
  return getStorageItem(MEDIA_PROGRESS_KEY);
}

export function saveProgress(storyId, mediaIndex) {
  const progress = getSavedProgress();
  if (mediaIndex > 0) {
    progress[storyId] = mediaIndex;
  } else {
    delete progress[storyId];
  }
  localStorage.setItem(MEDIA_PROGRESS_KEY, JSON.stringify(progress));
}

// Story viewed state
export function getSavedViewed() {
  return getStorageItem(STORY_VIEWED_KEY);
}

export function saveViewed(storyId, viewed) {
  const state = getSavedViewed();
  if (viewed) {
    state[storyId] = true;
  } else {
    delete state[storyId];
  }
  localStorage.setItem(STORY_VIEWED_KEY, JSON.stringify(state));
}
