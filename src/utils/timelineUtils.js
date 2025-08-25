export function getCurrentLabel(tl) {
  const time = tl.time();
  const labels = Object.entries(tl.labels).sort((a, b) => a[1] - b[1]); // sort by time

  let current = null;
  for (let i = 0; i < labels.length; i++) {
    const [name, labelTime] = labels[i];
    if (time >= labelTime) {
      current = name;
    } else {
      break;
    }
  }
  return current;
}
