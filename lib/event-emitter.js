class EventEmitter {
	constructor() {
		this.registry = {};
	}
	trigger(eventName, data) {
		const lstnrs = this.registry[eventName];
		if (!lstnrs) {
			return;
		}
		window.setTimeout(() => {
			for (let i = 0; i < lstnrs.length; ++i) {
				lstnrs[i](data);
			}
		}, 0);
	}
	addEventListener(eventName, callback) {
		const reg = this.registry;
		if (!reg[eventName]) {
			reg[eventName] = [];
		}
		reg[eventName].push(callback);
		return this;
	}
	on(eventName, callback) {
		return this.addEventListener(eventName, callback);
	}
}

module.exports = EventEmitter;
