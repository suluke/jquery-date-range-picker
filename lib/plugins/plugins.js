const plugins = [
	require('./i18n'), // This needs to be loaded as early as possible
	require('./hover-selection-preview'),
	require('./day-tooltip'),
	require('./shortcuts'),
	require('./daytime-selection'),
	require('./week-numbers'),
	require('./double-click-prevent'),
	require('./unselectable'),
	require('./draggable-range-bounds'),
	require('./mousewheel-month-scroll'),
	require('./easy-open-close-listeners'),
	require('./top-bar'),
	require('./custom-buttons'),
	require('./directional-selection'),
];

module.exports = {
	mergeAllOptionDefaults: () => {
		const opts = {};
		for (let i = 0; i < plugins.length; ++i) {
			if (plugins[i].addOptionDefaults) {
				plugins[i].addOptionDefaults(opts);
			}
		}
		return opts;
	},
	initializeAll: datepicker => {
		for (let i = 0; i < plugins.length; ++i) {
			if (plugins[i].addToPicker) {
				plugins[i].addToPicker(datepicker);
			}
		}
	}
};
