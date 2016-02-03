require('jquery');
const $ = window.jQuery;

const config = require('../config');

class EasyOpenClose {
	constructor(openListeners, closeListeners, openDuration, picker) {
		const box = picker.getDom();
		this.id = box.get(0);
		this.tag = config.eventChangesOpenStateTag;
		this.registerListeners(openListeners, evt => {
			if (!box.is(':visible') && !this.isOpenStateChangedBy(evt)) {
				this.markAsChangingOpenState(evt);
				picker.openDatePicker(openDuration, evt);
			}
		});
		this.registerListeners(closeListeners, evt => {
			if (box.is(':visible') && !this.isOpenStateChangedBy(evt)) {
				this.markAsChangingOpenState(evt);
				picker.closeDatePicker(evt);
			}
		});
		picker.getEventEmitter().on('datepicker-destroy', () => {
			this.unregisterListeners(openListeners);
			this.unregisterListeners(closeListeners);
		});
	}
	
	isOpenStateChangedBy(evt) {
		if (evt.originalEvent) {
			evt = evt.originalEvent;
		}
		return evt[this.tag] && evt[this.tag].indexOf(this.id) >= 0;
	}
	
	markAsChangingOpenState(evt) {
		if (evt.originalEvent) {
			evt = evt.originalEvent;
		}
		if (!evt[this.tag]) {
			evt[this.tag] = [];
		}
		evt[this.tag].push(this.id);
	}

	registerListeners(listeners, callback) {
		if (!listeners) {
			return;
		}
		const makeFilteredListener = filter => {
			return function(evt) {
				if (filter(evt)) {
					callback.call(this, evt);
				}
			};
		};
		for (let i = 0; i < listeners.length; ++i) {
			const listener = listeners[i];
			const evtName = listener.event + '.datepicker';
			const $elm = $(listener.target);
			if (typeof listener.filter === 'function') {
				$elm.on(evtName, makeFilteredListener(listener.filter));
			} else if (typeof listener.filter === 'string') {
				$elm.on(evtName, listener.filter, callback);
			} else {
				$elm.on(evtName, callback);
			}
		}
	}
	unregisterListeners(listeners) {
		if (!listeners) {
			return;
		}
		for (let i = 0; i < listeners.length; ++i) {
			const listener = listeners[i];
			const evtName = listener.event + '.datepicker';
			const $elm = $(listener.target);
			$elm.off(evtName);
		}
	}
	
	static addToPicker(picker) {
		const opt = picker.getOptions();
		if (!opt.openListeners && !opt.closeListeners) {
			return;
		}
		return new EasyOpenClose(opt.openListeners, opt.closeListeners, opt.duration, picker);
	}
	
	static addOptionDefaults(opts) {
		// example: [{ target: $elm, event: 'click', filter: (evt) => {return true} }]
		opts.openListeners = null;
		// example: [{ target: document, event: 'click', filter: (evt) => {return true} }]
		opts.closeListeners = null;
	}
}

module.exports = EasyOpenClose;
