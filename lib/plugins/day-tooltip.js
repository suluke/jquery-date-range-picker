require('jquery');
const $ = window.jQuery;

const calendar = require('../calendar');
const utils = require('../utils');

class DayTooltip {
	constructor($container, dateRange, singleDate, tooltipText, getString, eventEmitter) {
		this.$container = $container;
		this.dateRange = dateRange;
		this.singleDate = singleDate;
		this.tooltipText = tooltipText;
		this.getString = getString;

		this.$tooltip = $('<div class="date-range-length-tip"></div>');
		$container.append(this.$tooltip);
		this.registerListeners(eventEmitter);
	}

	registerListeners(eventEmitter) {
		const box = this.$container;
		const self = this;
		
		const hoverInEvents = 'mouseenter.datepicker focusin.datepicker';
		box.on(hoverInEvents, '.day', function() {
			self.dayHovering($(this));
		});
		const hoverOutEvents = 'mouseleave.datepicker focusout.datepicker';
		box.on(hoverOutEvents, '.day', () => {
			self.$tooltip.hide();
		});
		eventEmitter
		.on('datepicker-first-date-selected', () => this.dayHovering(box.find('.first-date-selected')))
		.on('datepicker-change', () => this.$tooltip.hide());
	}

	dayHovering(day) {
		const range = this.dateRange;
		const start = range.start;

		var hoverTime = parseInt(day.attr('time'));
		var text = '';

		if (day.hasClass('has-tooltip') && day.attr('data-tooltip')) {
			text = '<span style="white-space:nowrap">' + day.attr('data-tooltip') + '</span>';
		} else if (!day.hasClass('invalid')) {
			if (!this.singleDate && start && !range.end) {
				var days = calendar.countDays(hoverTime, start);
				if (this.tooltipText) {
					if (typeof this.tooltipText === 'function') {
						text = this.tooltipText(days, start, hoverTime, this.getString);
					} else if (this.tooltipText === true && days > 1) {
						text = days + ' ' + this.getString('days');
					}
				}
			}
		}

		if (text) {
			var posDay = day.offset();
			var posBox = this.$container.offset();

			var left = posDay.left - posBox.left;
			var top = posDay.top - posBox.top;
			left += day.width() / 2;

			var $tip = this.$tooltip;
			var w = $tip.css({ 'visibility': 'hidden', 'display': 'none' }).html(text).width();
			var h = $tip.height();
			left -= w / 2;
			top -= h;
			setTimeout(function() {
				$tip.css({ left: left, top: top, display: 'block', 'visibility': 'visible' });
			}, 10);
		} else {
			this.$tooltip.hide();
		}
	}
	
	static addOptionDefaults(opt) {
		opt.tooltip = {
			enabled: true,
			getText: (days, startTime, hoveringTime, getString) => {
				return days > 1 ? days + ' ' + getString('days') : '';
			}
		};
	}

	static addToPicker(picker) {
		const opt = picker.getOptions();
		if (!opt.tooltip.enabled || utils.isTouchDevice()) {
			return;
		}
		return new DayTooltip(picker.getDom(), picker.getDateRange(), opt.singleDate, opt.tooltip.getText, picker.getString, picker.getEventEmitter());
	}
}

module.exports = DayTooltip;
