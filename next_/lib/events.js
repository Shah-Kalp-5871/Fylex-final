// lib/events.js
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(data));
  }
}

export const eventBus = new EventEmitter();

export const EVENTS = {
  USER_UPDATED: 'USER_UPDATED',
  CART_UPDATED: 'CART_UPDATED',
  WISHLIST_UPDATED: 'WISHLIST_UPDATED',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
};
