export function setViewportDimensions() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  document.documentElement.style.setProperty("--vw", `${viewportWidth}px`);
  document.documentElement.style.setProperty("--vh", `${viewportHeight}px`);
}

export function setStoriesListHeight() {
  const storiesListElement = document.querySelector(".js-stories-list");
  if (storiesListElement) {
    const height = storiesListElement.offsetHeight;
    document.documentElement.style.setProperty(
      "--stories-list-height",
      `${height}px`
    );
  }
}

export function initializeViewport() {
  setViewportDimensions();

  // Set up resize listener
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(setViewportDimensions, 100);
  });
}
