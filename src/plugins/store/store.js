import { withEvents } from "./../../utils/events";


const buildState = (state, getters = {}) => {
  let allState = { ...state };
  let computedState = Object.keys(getters).reduce((prev, curr) => {
    prev[curr] = getters[curr](allState);
    return prev;
  }, {});

  return { ...allState, ...computedState };
};

let Store = (state = {}, changeEvent = "change", ctx) => {
  return withEvents({
    _changeEvent: changeEvent,
    _useCachedState: true,
    _replaying: false,
    _events: {},
    _state: {...state},
    _cache: { state: { ...state }, events: [] },
    mutations: {},
    getters: {},
    replaceState(state, clearEvents = false) {
      this._state = state;
      this._cache.state = {...state};
      this._useCachedState = true;
      this.emitChange();
      if (clearEvents) {
        this._cache.events = [];
      }
    },
    state(key) {
      let currentState = this._useCachedState
        ? this._cache.state
        : buildState(this._state, this.getters);
      this._cache.state = { ...currentState };
      this._useCachedState = true;
      return key ? currentState[key] : currentState;
    },
    replay(events = []) {
      this._state = {};
      this._cache.events = [];
      this._replaying = true;
      events.forEach(event => {
        this.commit(event.type, event.payload);
      });
      this._replaying = false;
      this._useCachedState = false;    
    },
    async commit(type, payload) {
      if (Object.keys(this.mutations).indexOf(type) === -1) {
        throw new Error(`Unknown action type "${type}"?`);
      }
      let mutation = this.mutations[type];

      let action = mutation;
      let evt = undefined;
      let stateFn = undefined;

      if (Array.isArray(mutation)) {
        action = mutation[0];
        if (mutation.length > 1) {
          evt = mutation[1];
        }
        if (mutation.length > 2) {
          stateFn = mutation[2];
        }
      }

      let localCtx = ctx ? (typeof ctx === 'function' ? ctx() : ctx) : {};

      let newState = await action(this.state(), payload, localCtx);
      
      this._cache.events.push({type, payload, replayed: this._replaying, result: newState});

      if (newState && typeof newState === "object") {
        this._state = { ...this._state, ...newState };
        this._useCachedState = false;
        if (!this._replaying) {
          this.emitChange();
          if (evt && typeof evt === 'string') {
            let eventState = stateFn ? stateFn(payload, newState, localCtx) : newState;
            this.emit(evt, eventState, this.state());
          }
        }
      }
      
    },
    listen(callback) {
      if (callback && typeof callback === "function") {
        this.on(this._changeEvent, callback);
      }
    },
    emitChange() {
      this.emit(this._changeEvent, this.state());
      return this;
    },
    extend(proto = {}) {
      const { changeEvent, state = {}, ...api } = proto;

      let computedState = buildState(state, proto.getters);

      var newStore = 
        Object.assign(Store(computedState || Store._state, changeEvent || Store._changeEvent), api);

      delete newStore.extend;
      return newStore;
    },
    uncommittedEvents() {
      return (this._cache.events || []).filter(x => !x.replayed);
    }
  });
};

export default Store;
