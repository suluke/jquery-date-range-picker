class EventEmitter {
	constructor() {
		this.registry = {};
	}
	trigger(eventName, data) {
		const lstnrs = this.registry[eventName];
		if (!lstnrs) {
			return;
		}
		for (let i = 0; i < lstnrs.length; ++i) {
			lstnrs[i](data);
		}
	}
	addEventListener(eventName, callback) {
		const reg = this.registry;
		if (!reg[eventName]) {
			reg[eventName] = [];
		}
		reg[eventName].push(callback);
	}
	on(eventName, callback) {
		this.addEventListener(eventName, callback);
	}
}

module.exports = EventEmitter;
