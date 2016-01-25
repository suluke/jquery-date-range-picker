require('jquery');
const $ = window.jQuery;

require('moment');
const moment = window.moment;

class TopBar {
	constructor($container, stringProvider, autoClose, singleDate, intervalLimits, customMarkup, dateSeparator, dateFormat, customCloseBtnClass, onClose) {
		this.$container = $container;
		this.format = dateFormat;
		const html = this.createHtml(stringProvider, autoClose, singleDate, customMarkup, dateSeparator, customCloseBtnClass, intervalLimits);
		this.$element = $(html);
		$container.prepend(this.$element);

		this.onClose = onClose;
		this.registerListeners();
	}

	createHtml(stringProvider, autoClose, singleDate, customMarkup, dateSeparator, customCloseBtnClass, intervalLimits) {
		let html = '<div class="drp_top-bar">';

		if (customMarkup) {
			if (typeof customMarkup == 'function') {
				customMarkup = customMarkup();
			}
			html += '<div class="custom-top">' + customMarkup + '</div>';
		} else {
			let defaultTopText = '';
			if (singleDate) {
				defaultTopText = stringProvider('default-single');
			} else if (intervalLimits.minDays && intervalLimits.maxDays) {
				defaultTopText = stringProvider('default-range').replace(/\%d/, intervalLimits.minDays).replace(/\%d/, intervalLimits.maxDays);
			} else if (intervalLimits.minDays) {
				defaultTopText = stringProvider('default-more').replace(/\%d/, intervalLimits.minDays);
			} else if (intervalLimits.maxDays) {
				defaultTopText = stringProvider('default-less').replace(/\%d/, intervalLimits.maxDays);
			} else {
				defaultTopText = stringProvider('default-default');
			}
			
			html += `<div class="normal-top">
					<span style="color:#333">
						${stringProvider('selected')}
					</span><b class="start-day">...</b>`;
			if (!singleDate) {
				html += `<span class="separator-day">
					${dateSeparator}
				</span>
				<b class="end-day">...</b>
				<i class="selected-days">
					(<span class="selected-days-num">3</span>${stringProvider('days')})
				</i>`;
			}
			html += '</div>';
			html += `<div class="error-top">error</div>
				<div class="default-top">${defaultTopText}</div>`;
		}

		html += '<input type="button" ' +
					'class="' + this.getApplyBtnClass(autoClose, customCloseBtnClass) + '" ' +
					'value="' + stringProvider('apply') + '"' +
				'/>';
		html += '</div>';
		return html;
	}

	getApplyBtnClass(autoClose, extraClass) {
		var klass = 'apply-btn disabled';
		if (autoClose === true) {
			klass += ' hide';
		}
		if (extraClass !== '') {
			klass += ' ' + extraClass;
		}
		return klass;
	}

	enableCloseBtn() {
		this.$element.find('.apply-btn').removeClass('disabled');
	}
	disableCloseBtn() {
		this.$element.find('.apply-btn').addClass('disabled');
	}
	hideCloseBtn() {
		this.$element.find('.apply-btn').hide();
	}

	registerListeners() {
		this.$element.find('.apply-btn').click(this.onClose);
	}

	setState(evt) {
		const startText = evt.date1 ? moment(evt.date1).format(this.format) : '...';
		const endText = evt.date2 ? moment(evt.date2).format(this.format) : '...';
		const selectedText = evt.length || '';
		
		this.$element.find('.start-day').html(startText);
		this.$element.find('.end-day').html(endText);
		if (selectedText !== '') {
			this.$element.find('.selected-days').show().find('.selected-days-num').html(selectedText);
		} else {
			this.$element.find('.selected-days').hide();
		}
		if (evt.valid) {
			this.enableCloseBtn();
		} else {
			this.disableCloseBtn();
		}
	}
	
	static addToPicker(picker) {
		const opt = picker.getOptions();
		if (!opt.topBar.enabled) {
			return;
		}
		const topbar = new TopBar(
			picker.getDom(), picker.getString, opt.autoclose, opt.singleDate, 
			opt, opt.topBar.customText, opt.separator, opt.format, opt.topBar.applyBtnClass,
			() => {
				picker.closeDatePicker();
				var dateRange = (
					moment(opt.start).format(opt.format) +
					opt.separator +
					moment(opt.end).format(opt.format)
				);
				picker.getEventEmitter().trigger('datepicker-apply', {
					'value': dateRange,
					'date1': new Date(opt.start),
					'date2': new Date(opt.end)
				});
			}
		);
		if (opt.alwaysOpen) {
			topbar.hideCloseBtn();
		}
		picker.getEventEmitter().on('datepicker-change-incomplete', data => {
			topbar.setState(data);
		});
		picker.getEventEmitter().on('datepicker-change', data => {
			topbar.setState(data);
		});
		picker.getEventEmitter().on('datepicker-update-validity', 
			valid => {
				if (valid) {
					topbar.enableCloseBtn();
				} else {
					topbar.disableCloseBtn();
				}
			}
		);
		return topbar;
	}
	
	static addOptionDefaults(opt) {
		opt.topBar = {
			enabled: true,
			customText: false,
			applyBtnClass: ''
		};
	}
}

module.exports = TopBar;
