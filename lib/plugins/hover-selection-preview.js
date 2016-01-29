require('jquery');
const $ = window.jQuery;

class SelectionPreview {
	constructor($container, eventEmitter, singleDate, dateRange) {
		this.$container = $container;
		this.dateRange = dateRange;
		
		const hoverInEvents = 'mouseenter.datepicker focusin.datepicker';
		const hoverOutEvents = 'mouseleave.datepicker focusout.datepicker';
		
		let hoverInListener = null;
		let hoverOutListener = () => {
			$container.find('.day.hovering').removeClass('hovering');
		};
		
		if (singleDate) {
			$container
			.on(hoverInEvents, '.day', function() {
				$container.find('.day.hovering').removeClass('hovering');
				$(this).addClass('hovering');
			})
			.on(hoverOutEvents, '.day', hoverOutListener);
		} else {
			eventEmitter
			.on('datepicker-first-date-selected', () => {
				const self = this;
				hoverInListener = function() {
					self.onDayHovering($(this));
				};
				$container
				.on(hoverInEvents, '.day', hoverInListener)
				.on(hoverOutEvents, '.day', hoverOutListener);
			})
			.on('datepicker-change', () => {
				if (hoverInListener !== null) {
					$container
					.off(hoverInEvents, '.day', hoverInListener)
					.off(hoverOutEvents, '.day', hoverOutListener);
					$container.find('.day.hovering').removeClass('hovering');
					hoverInListener = null;
				}
			});
		}
	}
	
	onDayHovering($day) {
		if (!$day.hasClass('invalid')) {
			const start = this.dateRange.start;
			const hoverTime = parseInt($day.attr('time'));
			this.$container.find('.day').each(function() {
				const time = parseInt($(this).attr('time'));
				if (
					(start <= time && hoverTime >= time) ||
					(start > time && hoverTime <= time)
				) {
					$(this).addClass('hovering');
				} else {
					$(this).removeClass('hovering');
				}
			});
		}
	}
	
	static addToPicker(picker) {
		return new SelectionPreview(picker.getDom(), picker.getEventEmitter(), picker.getOptions().singleDate, picker.getDateRange());
	}
	static addOptionDefaults(/* opt */) {
		
	}
}

module.exports = SelectionPreview;
