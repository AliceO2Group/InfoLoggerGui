// Simple Observable class to notify others listening for changes

class Observable {
  observe(callback) {
    if (!this.observers) {
      this.observers = [];
    }

    this.observers.push(callback);
  }

  unobserve(callback) {
    this.observers = this.observers.filter(observer => {
      return observer !== callback
    });
  }

  notify() {
    this.observers.forEach(observer => {
      observer(this);
    });
  }
}
