

export const withEvents = (self) => {
    self._events = self._events || {};
    self.on = function (event, listener) {
        if (typeof self._events[event] !== 'object') {
            self._events[event] = []
        }
        self._events[event].push(listener);
    }
    self.removeListener = function (event, listener) {
        let idx;
        if (typeof self._events[event] === 'object') {
            idx = self._events[event].indexOf(listener);
            if (idx > -1) {
                self._events[event].splice(idx, 1);
            }
        }
    }
    self.emit = function (event) {
        let i, listeners, length, args = [].slice.call(arguments, 1);
        if (typeof self._events[event] === 'object') {
            listeners = [].slice.call(self._events[event]);
            length = listeners.length;
            for (i = 0; i < length; i++) {
                listeners[i].apply(self, args);
            }
        }
    }

    self.once = function (event, listener) {
        self.on(event, function g() {
            self.removeListener(event, g);
            listener.apply(self, arguments);
        })
    }
    return self;
}