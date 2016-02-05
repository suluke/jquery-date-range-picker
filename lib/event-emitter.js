class EventEmitter {
	constructor() {
		this.registry = {};
		this.immediateReg = {};
	}
	trigger(eventName, data) {
		const lstnrs = this.registry[eventName];
		if (lstnrs) {
			window.setTimeout(() => {
				for (let i = 0; i < lstnrs.length; ++i) {
					lstnrs[i](data);
				}
			}, 0);
		}
		const imms = this.immediateReg[eventName];
		if (imms) {
			for (let i = 0; i < imms.length; ++i) {
				imms[i](data);
			}
		}
	}
	addEventListener(eventName, callback, immediate) {
		const reg = immediate ? this.immediateReg : this.registry;
		if (!reg[eventName]) {
			reg[eventName] = [];
		}
		reg[eventName].push(callback);
		return this;
	}
	on(eventName, callback, immediate) {
		return this.addEventListener(eventName, callback, immediate);
	}
}

module.exports = EventEmitter;
