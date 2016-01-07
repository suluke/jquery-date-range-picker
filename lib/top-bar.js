const i18n = require('./i18n');

class TopBar {
	constructor($container, lang, autoClose, singleDate, customMarkup, dateSeparator, customCloseBtnClass, onClose) {
		const html = this.createHtml(lang, autoClose, singleDate, customMarkup, dateSeparator, customCloseBtnClass);
		this.$element = $(html);
		$container.prepend(this.$element);
		this.registerListeners();
		this.onClose = onClose;
	}

	createHtml(lang, autoClose, singleDate, customMarkup, dateSeparator, customCloseBtnClass) {
		let html = '<div class="drp_top-bar">';

			if (customMarkup) {
				if (typeof customMarkup == 'function') {
					customMarkup = customMarkup();
				}
				html += '<div class="custom-top">' + customMarkup + '</div>';
			} else {
				html += `<div class="normal-top">
						<span style="color:#333">
							${i18n.lang('selected', lang)}
						</span><b class="start-day">...</b>`;
				if (!singleDate) {
					html += `<span class="separator-day">
						${dateSeparator}
					</span>
					<b class="end-day">...</b>
					<i class="selected-days">
						(<span class="selected-days-num">3</span>${i18n.lang('days', lang)})
					</i>`;
				}
				html += '</div>';
				html += `<div class="error-top">error</div>
					<div class="default-top">default</div>`;
			}

			html += '<input type="button" ' +
						'class="' + this.getApplyBtnClass(autoClose, customCloseBtnClass) + '" ' +
						'value="' + i18n.lang('apply', lang) + '"' +
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
}

module.exports = TopBar;
