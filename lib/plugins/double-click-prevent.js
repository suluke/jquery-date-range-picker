class DoubleClickPreventer {
	constructor($container) {
		this.doubleClickTime = 400; // ms
		
		this.timeout = 0;
		
		const self = this;
		$container.on('click.datepicker', '.day', function(evt) {
			self.onDayClicked(this, evt);
			return true; // don't influence event propagation
		});
	}
	
	onDayClicked(elm, evt) {
		if (this.timeout !== 0) {
			window.clearTimeout(this.timeout);
			this.timeout = 0;
		}
		this.timeout = window.setTimeout(() => {
			
		}, this.doubleClickTime);
	}
	
	static addToPicker(box) {
		return new DoubleClickPreventer(box);
	}
}

module.exports = DoubleClickPreventer;
