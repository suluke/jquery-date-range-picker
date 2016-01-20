/**
 * Daterangepicker.js
 * version : 1.0.0
 * author : mindscreen GmbH
 * original author : Chunlong Liu
 * last updated at: 2016-01-20
 * license : MIT
 * www.mindscreen.de
 */

'use strict';

// FIXME This is a workaround for undefined 'module' variable (strict mode)
// when calling moment.loadLocale/moment.locale
if (!window.module) {
	window.module = undefined;
}
const config = require('./config');
const DatePicker = require('./daterange-picker');
config.export(DatePicker);

const JqueryPlugin = require('./plugins/jquery-plugin');
if (JqueryPlugin.register) {
	JqueryPlugin.register(DatePicker);
}
