class DraggableRangeBounds {
	constructor($container, setDateRange) {
		this.$container = $container;
		this.moveListener = null;
		this.setDateRange = setDateRange;
		
		this.registerListeners();
	}
	
	registerListeners() {
		const self = this;
		const $c = this.$container;
		const boundsClasses = ['first-date-selected', 'last-date-selected'];
		const draggingClass = 'dragging-date-range-delim';
		$c.on('mousedown.datepicker', $.map(boundsClasses, e => '.' + e).join(','), function(evt) {
			$c.addClass(draggingClass);
			const $nonDragged = $c.find('.' + boundsClasses[$(this).hasClass(boundsClasses[0]) ? 1 : 0]);
			self.unchangedTime = new Date(parseInt($nonDragged.attr('time')));
			self.moveListener = function() {
				const thisDate = new Date(parseInt($(this).attr('time')));
				self.setDateRange(self.unchangedTime, thisDate);
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
	
	static addToPicker(box, setDateRange) {
		box.addClass('draggable-range-bounds');
		return new DraggableRangeBounds(box.find('.month-wrapper'), setDateRange);
	}
}

module.exports = DraggableRangeBounds;
