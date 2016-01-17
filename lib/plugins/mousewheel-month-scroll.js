require('jquery');
const $ = window.jQuery;

/* Based on stackoverflow.com/a/24707712/1468532 */
class ScrollThroughMonths {
	constructor($eventArea, onBackward, onForward, eventData) {
		this.$eventArea = $eventArea;
		this.onBackward = onBackward;
		this.onForward = onForward;
		this.eventData = eventData;
		
		this.registerListeners();
	}
	
	registerListeners() {
		const event = 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';
		this.$eventArea.on(event + '.datepicker', (evt) => {
			this.onScroll(this.normalizeScrollEvent(evt));
			return false;
		});
	}
	
	normalizeScrollEvent(evt) {
		evt = evt.originalEvent;
		let normalized = 0;
		if (evt.wheelDelta) {
			normalized = (evt.wheelDelta % 120 - 0) == -0 ? evt.wheelDelta / 120 : evt.wheelDelta / 12;
		} else {
			var rawAmmount = evt.deltaY ? evt.deltaY : evt.detail;
			normalized = -(rawAmmount % 3 ? rawAmmount * 10 : rawAmmount / 3);
		}
		return normalized;
	}
	
	onScroll(distance) {
		if (distance > 0) {
			this.onBackward(this.eventData);
		} else {
			this.onForward(this.eventData);
		}
	}
	
	static addToPicker(box, options, onBackward, onForward) {
		let instances = [];
		box.find('.month1, .month2').each((i, elm) => {
			const $caption = $(elm).find('.caption');
			instances.push(new ScrollThroughMonths($caption, onBackward, onForward, $caption));
		});
		return instances;
	}
}

module.exports = ScrollThroughMonths;