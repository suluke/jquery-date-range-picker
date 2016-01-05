require('moment');
const moment = window.moment;

const templates = require('./templates');

class DaytimeRange {
	/**
	 * 
	 * #param time The object to store the time in
	 */
	constructor($domContainer, time, onChange, initialStartTime, initialEndTime, lang) {
		this.time = time;
		this.onChange = onChange;
		
		const $container1 = $domContainer.find('.time1');
		this.showTime($container1, lang);
		this.$hourRange1 = $container1.find('input[type=range].hour-range');
		this.$minuteRange1 = $container1.find('input[type=range].minute-range');
		this.$hourVal1 = $container1.find('.hour-val');
		this.$minuteVal1 = $container1.find('.minute-val');

		const $container2 = $domContainer.find('.time2');
		this.showTime($container2, lang);
		this.$hourRange2 = $container2.find('input[type=range].hour-range');
		this.$minuteRange2 = $container2.find('input[type=range].minute-range');
		this.$hourVal2 = $container2.find('.hour-val');
		this.$minuteVal2 = $container2.find('.minute-val');
		
		this.renderTime('time1', initialStartTime);
		this.renderTime('time2', initialEndTime);
		
		this.setupListeners();
	}

	renderTime(name, date) {
		let $hourRange, $minuteRange;
		if (name === 'time1') {
			$hourRange = this.$hourRange1;
			$minuteRange = this.$minuteRange1;
		} else {
			$hourRange = this.$hourRange2;
			$minuteRange = this.$minuteRange2;
		}

		$hourRange.val(moment(date).hours());
		$minuteRange.val(moment(date).minutes());
		this.setTime(name, moment(date).format('HH'), moment(date).format('mm'));
	}

	static changeTime(time, attr, date) {
		time[attr] = parseInt(
			moment(parseInt(date))
				.startOf('day')
				.add(moment(time[attr + 'Time']).format('HH'), 'h')
				.add(moment(time[attr + 'Time']).format('mm'), 'm').valueOf()
			);
	}

	swapTime(start, end) {
		this.renderTime('time1', start);
		this.renderTime('time2', end);
	}

	setTime(name, hour, minute) {
		let $hourVal, $minuteVal;
		if (name === 'time1') {
			$hourVal = this.$hourVal1;
			$minuteVal = this.$minuteVal1;
		} else {
			$hourVal = this.$hourVal2;
			$minuteVal = this.$minuteVal2;
		}

		if (hour) {
			$hourVal.text(hour);
		}
		if (minute) {
			$minuteVal.text(minute);
		}
		
		var setRange = (name, timePoint) => {
			var h = timePoint.format('HH'),
				m = timePoint.format('mm');
			this.time[name] = timePoint
				.startOf('day')
				.add(hour || h, 'h')
				.add(minute || m, 'm')
				.valueOf();
		};
		
		switch (name) {
			case 'time1':
				if (this.time.start) {
					setRange('start', moment(this.time.start));
				}
				setRange('startTime', moment(this.time.startTime || moment().valueOf()));
				break;
			case 'time2':
				if (this.time.end) {
					setRange('end', moment(this.time.end));
				}
				setRange('endTime', moment(this.time.endTime || moment().valueOf()));
				break;
		}
		this.onChange();
	}

	/**
	 * @private
	 */
	showTime($container, lang) {
		$container.append(templates.getTimeHTML(lang));
	}
	
	/**
	 * @private
	 */
	 setupListeners() {
		let $ranges1 = this.$hourRange1.add(this.$minuteRange1);
		$ranges1.on('change mousemove', (e) => {
			var target = e.target,
				hour = target.name === 'hour' ? $(target).val().replace(/^(\d{1})$/, '0$1') : undefined,
				min = target.name === 'minute' ? $(target).val().replace(/^(\d{1})$/, '0$1') : undefined;
			this.setTime('time1', hour, min);
		});
		
		let $ranges2 = this.$hourRange2.add(this.$minuteRange2);
		$ranges2.on('change mousemove', (e) => {
			var target = e.target,
				hour = target.name === 'hour' ? $(target).val().replace(/^(\d{1})$/, '0$1') : undefined,
				min = target.name === 'minute' ? $(target).val().replace(/^(\d{1})$/, '0$1') : undefined;
			this.setTime('time2', hour, min);
		});
	}
}

module.exports = DaytimeRange;
