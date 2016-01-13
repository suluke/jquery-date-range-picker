const features = require('./feature-detection');

class Gap {
	constructor($container) {
		this.$container = $container;
		this.$month1 = $container.find('.month1');
		this.$month2 = $container.find('.month2');
		this.$gap = this.$month1.after(this.createHtml());
	}
	
	createHtml() {
		if (features.supportsGradients()) {
			return '';
		}
		
		var html = ['<div class="gap-top-mask"></div><div class="gap-bottom-mask"></div><div class="gap-lines">'];
		for (let i = 0; i < 20; i++) {
			html.push(
				`<div class="gap-line">
					<div class="gap-1"></div>
					<div class="gap-2"></div>
					<div class="gap-3"></div>
				</div>`
			);
		}
		html.push('</div>');
		return html.join('');
	}
	
	show() {
		var h1 = box.find('table.month1').height();
		var h2 = box.find('table.month2').height();
		this.$gap
			.height(Math.max(h1, h2) + 10)
			.show();
		this.$container.addClass('has-gap').removeClass('no-gap');
	}
	
	hide() {
		box.removeClass('has-gap').addClass('no-gap').find('.gap').hide();
	}
	
	getDisplayWidth() {
		if (this.$gap.is(':visible')) {
			return this.$gap.width();
		} else {
			return 0;
		}
	}
	
	static addToPicker(box) {
		return new Gap(box);
	}
}

module.exports = Gap;
