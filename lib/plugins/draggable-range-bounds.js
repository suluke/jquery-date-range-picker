require('jquery');
const $ = window.jQuery;
require('moment');
const moment = window.moment;

class DraggableRangeBounds {
	constructor($container, setDateRange, getDateRange) {
		this.$container = $container;
		this.getDateRange = getDateRange;
		this.moveListener = null;
		this.setDateRange = setDateRange;
		
		this.registerListeners();
	}
	
	registerListeners() {
		const self = this;
		const $c = this.$container;
		const boundsClasses = ['first-date-selected', 'last-date-selected'];
		const draggingClass = 'dragging-date-range-delim';
		$c.on('mousedown.datepicker', $.map(boundsClasses, e => '.' + e).join(','), function() {
			const range = self.getDateRange();
			$c.addClass(draggingClass);
			const $nonDragged = $c.find('.' + boundsClasses[$(this).hasClass(boundsClasses[0]) ? 1 : 0]);
			let unchangedTime = parseInt($nonDragged.attr('time'));
			let changedTime = parseInt($(this).attr('time'));
			if (moment(changedTime).startOf('day').isSame(moment(range.start).startOf('day'))) {
				changedTime = range.start;
				unchangedTime = range.end;
			} else {
				changedTime = range.end;
				unchangedTime = range.start;
			}
			const changeMom = moment(changedTime);
			self.moveListener = function() {
				const thisDate = moment(parseInt($(this).attr('time')));
				thisDate.startOf('day').add(changeMom.hours(), 'h').add(changeMom.minutes(), 'm');
				self.setDateRange(new Date(unchangedTime), thisDate.toDate());
			};
			$c.on('mouseenter.datepicker', '.day', self.moveListener);
		});
		const endDragging = () => {
			if (this.moveListener !== null) {
				$c.removeClass(draggingClass);
				$c.off('mouseenter.datepicker', '.day', this.moveListener);
				this.moveListener = null;
			}
		};
		$c.on('mouseup.datepicker', endDragging);
		$c.on('mouseleave.datepicker', endDragging);
	}
	
	static addToPicker(picker) {
		if (!picker.getOptions().draggableRangeBounds) {
			return;
		}
		
		const box = picker.getDom();
		box.addClass('draggable-range-bounds');
		return new DraggableRangeBounds(box.find('.month-wrapper'), (start, end) => {
			picker.setDateRange(start, end, false, true);
		}, () => picker.getDateRange());
	}
	
	static addOptionDefaults(opts) {
		opts.draggableRangeBounds = false;
	}
}

module.exports = DraggableRangeBounds;
