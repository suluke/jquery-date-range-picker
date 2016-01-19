/**
 * Daterangepicker.js
 * version : 1.0.0
 * author : mindscreen GmbH
 * original author : Chunlong Liu
 * last updated at: 2016-1-2
 * license : MIT
 * www.mindscreen.de
 */

'use strict';

// FIXME This is a workaround for undefined 'module' variable (strict mode)
// when calling moment.loadLocale/moment.locale
if (!window.module) {
	window.module = undefined;
}

const DatePicker = require('./daterange-picker');

const JqueryPlugin = require('./plugins/jquery-plugin');

if (JqueryPlugin.register) {
	JqueryPlugin.register(DatePicker);
}
