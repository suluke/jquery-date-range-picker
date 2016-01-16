require('jquery');
const $ = window.jQuery;

class DoubleClickPreventer {
	constructor($container) {
		this.doubleClickTime = 400; // ms
		
		this.$overlay = $('<div class="plugin-dblclick-prevent" style="position: absolute;"></div>');
		
		$container.find('.month-wrapper').append(this.$overlay);
		this.$overlay.hide();
		
		this.timeout = 0;
		
		const self = this;
		$container.on('click.datepicker', '.day', function(evt) {
			self.onDayClicked($(this).parent(), evt);
			return true; // don't influence event propagation
		});
	}
	
	onDayClicked($elm) {
		if (this.timeout !== 0) {
			window.clearTimeout(this.timeout);
			this.timeout = 0;
		}
		const $o = this.$overlay;
		$o.show();
		$o.width($elm.width());
		$o.height($elm.height());
		const elmPos = $elm.position();
		$o.css({
			top: elmPos.top,
			left: elmPos.left
		});
		
		this.timeout = window.setTimeout(() => {
			this.$overlay.hide();
		}, this.doubleClickTime);
	}
	
	static addToPicker(box) {
		return new DoubleClickPreventer(box);
	}
}

module.exports = DoubleClickPreventer;
