import gsap from "gsap";

let instance = null;
export default class BulletTimeline {
  constructor() {
    // Singleton
    if (instance) {
      return instance.timeline;
    }
    instance = this;

    this.timeline = gsap.timeline({ paused: true });

    return this.timeline;
  }
}
