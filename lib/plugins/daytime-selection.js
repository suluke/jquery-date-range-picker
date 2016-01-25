require('jquery');
const $ = window.jQuery;

require('moment');
const moment = window.moment;

/**
 * TODO input type="range" is supported only in ie >= 10
 */
class DaytimeSelect {
	/**
	 * @param {jQuery} $domContainer
	 * @param {object} config
	 * @param {string} classNames
	 * @param {function} onChange
	 * @param {Date} initialTime A Date object to initialize the selection controls with
	 * @param {string} lang The locale identifier to be used by this plugin
	 */
	constructor($domContainer, config, classNames, onChange, initialTime, stringProvider) {
		this.onChange = onChange;
		this.config = config;

		const $container = $('<div class="' + classNames + '"></div>');
		$domContainer.append($container);
		this.createDom($container, stringProvider);
		this.$hourRange = $container.find('input[type=range].hour-range');
		this.$minuteRange = $container.find('input[type=range].minute-range');
		this.$hourVal = $container.find('.hour-val');
		this.$minuteVal = $container.find('.minute-val');

		this.renderTime(initialTime);

		this.setupListeners();
	}

	renderTime(date) {
		date = moment(date);
		const h = date.hours();
		const m = date.minutes();
		this.setTimeControls(h, m);
		this.setTimeDisplay(h, m);
	}
	
	setTimeControls(h, m) {
		const $h = this.$hourRange;
		const $m = this.$minuteRange;
		if ($h.val() !== h) {
			$h.val(h);
		}
		if ($m.val() !== m) {
			$m.val(m);
		}
	}
	setTimeDisplay(h, m) {
		this.$hourVal.text(h);
		this.$minuteVal.text(m);
	}
	
	/**
	 * @private only called when sliders change
	 */
	setTime(hour, minute) {
		this.setTimeDisplay(hour, minute);
		this.onChange(hour, minute);
	}

	/**
	 * @private
	 */
	createDom($container, stringProvider) {
		$container.append(this.getTimeHTML(stringProvider));
	}

	/**
	 * @private
	 */
	 setupListeners() {
		let $ranges = this.$hourRange.add(this.$minuteRange);
		$ranges.on('change touchmove mousemove', () => {
			const hour = this.$hourRange.val();
			const min = this.$minuteRange.val();
			this.setTime(hour, min);
		});
	}
	getTimeHTML(stringProvider) {
		const cfg = this.config;
		let html = 
				`<div>
					<span>${stringProvider('Time')}: <span class="hour-val">00</span>:<span class="minute-val">00</span></span>
				</div>`;
		if (this.config.hours.enabled) {
			html += 
				`<div class="hour">
					<label>${stringProvider('Hour')}: 
						<input type="range" class="hour-range" name="hour" min="${cfg.hours.min}" max="${cfg.hours.max}" step="${cfg.hours.step}">
					</label>
				</div>`;
		}
		if (this.config.minutes.enabled) {
			html += 
				`<div class="minute">
					<label>${stringProvider('Minute')}: 
						<input type="range" class="minute-range" name="minute" min="${cfg.minutes.min}" max="${cfg.minutes.max}" step="${cfg.minutes.step}">
					</label>
				</div>`;
		}
		return html;
	}

	static addToPicker(picker) {
		const opt = picker.getOptions();
		const config = opt.time;
		if (!config.enabled) {
			return;
		}
		
		const dateRange = picker.getDateRange();
		let daytime1 = null;
		let daytime2 = null;

		const $wrapper = picker.getDom().find('.month-wrapper');
		const $container = $('<div class="time"></div>');
		$wrapper.append($container);
		
		const changeDaytimeOf = (name, timePoint, hour, minute) => {
			dateRange[name] = timePoint
				.startOf('day')
				.add(hour, 'h')
				.add(minute, 'm')
				.valueOf();
		};
		
		const makeOnChange = (key) => function(hour, minute) {
			if (dateRange[key]) {
				changeDaytimeOf(key, moment(dateRange[key]), hour, minute);
			}
			changeDaytimeOf(key + 'Time', moment(dateRange[key + 'Time'] || moment().valueOf()), hour, minute);
			picker.invalidate(); // To trigger 'datepicker-change', so inputs can update their values
		};
		
		daytime1 = new DaytimeSelect(
			$container,
			config,
			'time1',
			makeOnChange('start'),
			moment(opt.time.defaultStart || dateRange.start || dateRange.startDate || opt.defaultTime).toDate(),
			picker.getString
		);
		if (!opt.singleDate) {
			daytime2 = new DaytimeSelect(
				$container,
				config,
				'time2',
				makeOnChange('end'),
				moment(opt.time.defaultEnd || dateRange.end || dateRange.endDate || opt.defaultTime).toDate(),
				picker.getString
			);
		}
		
		//picker.getEventEmitter().on('datepicker-first-date-selected', () => daytime1.renderTime(dateRange.start));
		const onChange = () => {
			daytime1.renderTime(dateRange.start);
			if (daytime2) {
				daytime2.renderTime(dateRange.end);
			}
		};
		picker.getEventEmitter().on('datepicker-change', onChange);
		picker.getEventEmitter().on('datepicker-time-change', onChange);
		
		return [daytime1, daytime2];
	}
	
	static addOptionDefaults(opt) {
		opt.time = {
			enabled: false,
			hours: {
				enabled: true,
				min: 0,
				max: 23,
				step: 1
			},
			minutes: {
				enabled: true,
				min: 0,
				max: 59,
				step: 1
			},
			defaultStart: false,
			defaultEnd: false
		};
	}
}

module.exports = DaytimeSelect;
