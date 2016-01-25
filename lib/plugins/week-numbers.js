require('jquery');
const $ = window.jQuery;

require('moment');
const moment = window.moment;

const weekNumberClicked = (box, $weekNumberDom, dateRange, startOfWeek) => {
	var thisTime = parseInt($weekNumberDom.attr('data-start-time'), 10);
	let date1;
	if (!dateRange.startWeek) {
		dateRange.startWeek = thisTime;
		$weekNumberDom.addClass('week-number-selected');
		date1 = new Date(thisTime);
		dateRange.start = moment(date1).day(startOfWeek === 'monday' ? 1 : 0).toDate();
		dateRange.end = moment(date1).day(startOfWeek === 'monday' ? 7 : 6).toDate();
	} else {
		box.find('.week-number-selected').removeClass('week-number-selected');
		date1 = new Date(thisTime < dateRange.startWeek ? thisTime : dateRange.startWeek);
		var date2 = new Date(thisTime < dateRange.startWeek ? dateRange.startWeek : thisTime);
		dateRange.startWeek = false;
		dateRange.start = moment(date1).day(startOfWeek === 'monday' ? 1 : 0).toDate();
		dateRange.end = moment(date2).day(startOfWeek === 'monday' ? 7 : 6).toDate();
	}
};

class WeekNumbers {
	constructor($monthContainer, getWeekName, weekNumberString) {
		this.$monthContainer = $monthContainer;
		this.getWeekName = getWeekName;
		$monthContainer.find('.week-name').prepend('<th>' + weekNumberString + '</th>');
		this.createWeekNumberColumn();
	}

	createWeekNumberColumn() {
		this.$monthContainer.find('tbody tr').each((idx, elm) => {
			const $this = $(elm);
			const startTime = $this.children().first().children().attr('time');
			$this.prepend(
				`<td>
					<div class="week-number" data-start-time="${startTime}">
						${this.getWeekName(new Date(parseInt(startTime)))}
					</div>
				</td>`
			);
		});
	}

	update() {
		if (this.$monthContainer.find('.week-number').length === 0) {
			this.createWeekNumberColumn();
		}
	}

	markStartWeek(startWeek) {
		this.$monthContainer.find('.week-number').each(function() {
			if ($(this).attr('data-start-time') === startWeek) {
				$(this).addClass('week-number-selected');
			}
		});
	}

	static addToPicker(picker) {
		const opt = picker.getOptions();
		if (!opt.weekNumbers.enabled) {
			return;
		}
		
		const box = picker.getDom();
		const instances = [];
		box.find('table[class^="month"]').each(function() {
			const $this = $(this);
			const inst = new WeekNumbers($this, opt.weekNumbers.getWeekName, picker.getString('week-number'));
			instances.push(inst);
			$this.on('click', '.week-number', function() {
				weekNumberClicked(box, $(this), opt, opt.startOfWeek);
				picker.updateSelectableRange();
				picker.invalidate();
				picker.autoclose();
			});
			picker.getEventEmitter().on('datepicker-show-month', $view => {
				if ($this.is($view)) {
					inst.update();
				}
			});
			picker.getEventEmitter().on('datepicker-show-selected-range', range => {
				inst.markStartWeek(range.startWeek);
			});
		});
		return instances;
	}
	
	static addOptionDefaults(opts) {
		opts.weekNumbers = {
			enabled: false,
			getWeekName: function(date) /* date will be the first day of a week */ {
				return moment(date).format('w');
			}
		};
	}
}

module.exports = WeekNumbers;
