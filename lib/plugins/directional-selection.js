require('jquery');
const $ = window.jQuery;

class DirectionalSelection {
	constructor(picker, backward = false) {
		picker.getEventEmitter()
		.on('datepicker-first-date-selected', date => {
			const invalidatedDays = [];
			picker.getDom().find('.day.valid').each((idx, elm) => {
				if (!$(elm).hasClass('invalid')) {
					const time = $(elm).attr('time');
					const start = date.date1.valueOf();
					if (!backward && time < start) {
						invalidatedDays.push(elm);
					} else if (backward && time > start) {
						invalidatedDays.push(elm);
					}
				}
			});
			this.$invalidatedDays = $(invalidatedDays);
			this.$invalidatedDays.removeClass('valid').addClass('tmp invalid');
		})
		.on('datepicker-change', () => {
			if (this.$invalidatedDays) {
				this.$invalidatedDays.removeClass('invalid').addClass('valid');
			}
			this.$invalidatedDays = null;
		});
	}
	
	static addOptionDefaults(opts) {
		opts.selectForward = false;
		opts.selectBackward = false;
	}
	
	static addToPicker(picker) {
		const opt = picker.getOptions();
		if (opt.selectForward) {
			return new DirectionalSelection(picker);
		} else if (opt.selectBackward) {
			return new DirectionalSelection(picker, true);
		}
	}
}

module.exports = DirectionalSelection;
