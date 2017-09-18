/**
 * Simple Observable class to notify others listening for changes
 */
class Observable {
  /**
   * Add an observer
   * @param {function} callback - will be called for each notification
   */
  observe(callback) {
    if (!this.observers) {
      this.observers = [];
    }

    this.observers.push(callback);
  }

  /**
   * Remove an observer
   * @param {function} callback - the callback to remove
   */
  unobserve(callback) {
    this.observers = this.observers.filter((observer) => {
      return observer !== callback;
    });
  }

  /**
   * Notify every observer that something changed
   */
  notify() {
    this.observers.forEach((observer) => {
      observer(this);
    });
  }
}
