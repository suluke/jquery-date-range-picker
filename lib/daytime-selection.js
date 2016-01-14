require('moment');
const moment = window.moment;

const i18n = require('./i18n');

class DaytimeSelect {
	/**
	 *
	 * #param time The object to store the time in
	 */
	constructor($domContainer, classNames, onChange, initialTime, lang) {
		this.onChange = onChange;

		const $container = $('<div class="' + classNames + '"></div>');
		$domContainer.append($container);
		this.showTime($container, lang);
		this.$hourRange = $container.find('input[type=range].hour-range');
		this.$minuteRange = $container.find('input[type=range].minute-range');
		this.$hourVal = $container.find('.hour-val');
		this.$minuteVal = $container.find('.minute-val');

		this.renderTime(initialTime);

		this.setupListeners();
	}

	renderTime(date) {
		this.$hourRange.val(moment(date).hours());
		this.$minuteRange.val(moment(date).minutes());
		this.setTime(moment(date).format('HH'), moment(date).format('mm'));
	}

	setTime(hour, minute) {
		if (hour) {
			this.$hourVal.text(hour);
		}
		if (minute) {
			this.$minuteVal.text(minute);
		}

		this.onChange(hour, minute);
	}

	/**
	 * @private
	 */
	showTime($container, lang) {
		$container.append(this.getTimeHTML(lang));
	}

	/**
	 * @private
	 */
	 setupListeners() {
		let $ranges = this.$hourRange.add(this.$minuteRange);
		$ranges.on('change mousemove', (e) => {
			var target = e.target,
				hour = target.name === 'hour' ? $(target).val().replace(/^(\d{1})$/, '0$1') : undefined,
				min = target.name === 'minute' ? $(target).val().replace(/^(\d{1})$/, '0$1') : undefined;
			this.setTime(hour, min);
		});
	}
	getTimeHTML(lang) {
		return `<div>
					<span>${i18n.lang('Time', lang)}: <span class="hour-val">00</span>:<span class="minute-val">00</span></span>
				</div>
				<div class="hour">
					<label>${i18n.lang('Hour', lang)}: <input type="range" class="hour-range" name="hour" min="0" max="23"></label>
				</div>
				<div class="minute">
					<label>${i18n.lang('Minute', lang)}: <input type="range" class="minute-range" name="minute" min="0" max="59"></label>
				</div>`;
	}

	static changeTime(time, attr, date) {
		time[attr] = parseInt(
			moment(parseInt(date))
				.startOf('day')
				.add(moment(time[attr + 'Time']).format('HH'), 'h')
				.add(moment(time[attr + 'Time']).format('mm'), 'm').valueOf()
			);
	}

	static addToPicker(dateRange, lang, singleDate, defaultTime, box, invalidate) {
		let daytime1 = null;
		let daytime2 = null;

		const $wrapper = box.find('.month-wrapper');
		const $container = $('<div class="time"></div>');
		$wrapper.append($container);
		
		const changeDaytimeOf = (name, timePoint, hour, minute) => {
			const h = timePoint.format('HH');
			const m = timePoint.format('mm');
			dateRange[name] = timePoint
				.startOf('day')
				.add(hour || h, 'h')
				.add(minute || m, 'm')
				.valueOf();
		};
		const makeOnChange = (key, keyTime) => function(hour, minute) {
			if (dateRange[key]) {
				changeDaytimeOf(key, moment(dateRange[key]), hour, minute);
			}
			changeDaytimeOf(key + 'Time', moment(dateRange[key + 'Time'] || moment().valueOf()), hour, minute);
			invalidate();
		};
		
		daytime1 = new DaytimeSelect(
			$container,
			'time1',
			makeOnChange('start'),
			moment(dateRange.start || dateRange.startDate || defaultTime).toDate(),
			lang
		);
		if (!singleDate) {
			daytime2 = new DaytimeSelect(
				$container,
				'time2',
				makeOnChange('end'),
				moment(dateRange.end || dateRange.endDate || defaultTime).toDate(),
				lang
			);
		}
		return [daytime1, daytime2];
	}
}

module.exports = DaytimeSelect;
