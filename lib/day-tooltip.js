require('jquery');
const $ = window.jQuery;

const calendar = require('./calendar');

class DayTooltip {
	constructor($container, dateRange, singleDate, tooltipText, getString) {
		this.$container = $container;
		this.dateRange = dateRange;
		this.singleDate = singleDate;
		this.tooltipText = tooltipText;
		this.getString = getString;

		this.$tooltip = $('<div class="date-range-length-tip"></div>');
		$container.append(this.$tooltip);
		this.registerListeners();
	}

	registerListeners() {
		const box = this.$container;
		const self = this;
		box.on('mouseleave', '.day', () => {
			this.$tooltip.hide();
		});
		box.on('mouseenter', '.day', function() {
			self.dayHovering($(this));
		});
	}

	hide() {
		this.$container.find('.day.hovering').removeClass('hovering');
		this.$tooltip.hide();
	}

	dayHovering(day) {
		const box = this.$container;
		const range = this.dateRange;
		const start = range.start;
		const end = range.end;

		var hoverTime = parseInt(day.attr('time'));
		var text = '';

		if (day.hasClass('has-tooltip') && day.attr('data-tooltip')) {
			text = '<span style="white-space:nowrap">' + day.attr('data-tooltip') + '</span>';
		} else if (!day.hasClass('invalid')) {
			if (this.singleDate) {
				box.find('.day.hovering').removeClass('hovering');
				day.addClass('hovering');
			} else {
				box.find('.day').each(function() {
					var time = parseInt($(this).attr('time'));

					if (time === hoverTime) {
						$(this).addClass('hovering');
					} else {
						$(this).removeClass('hovering');
					}

					if (
						(start && !end) &&
						((start < time && hoverTime >= time) ||
						(start > time && hoverTime <= time))
					) {
						$(this).addClass('hovering');
					} else {
						$(this).removeClass('hovering');
					}
				});

				if (start && !end) {
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
		}

		if (text) {
			var posDay = day.offset();
			var posBox = box.offset();

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
			this.hide();
		}
	}

	static addToPicker(picker) {
		const opt = picker.getOptions();
		if (!opt.tooltip.enabled) {
			return;
		}
		
		return new DayTooltip(picker.getDom(), picker.getDateRange(), opt.singleDate, opt.tooltip.getText, picker.getString);
	}
}

module.exports = DayTooltip;
