const plugins = [
	require('./plugins/shortcuts'),
	require('./plugins/daytime-selection'),
	require('./plugins/week-numbers'),
	require('./plugins/double-click-prevent'),
	require('./plugins/unselectable'),
	require('./plugins/draggable-range-bounds'),
	require('./plugins/mousewheel-month-scroll'),
	require('./plugins/easy-open-close-listeners'),
	require('./plugins/top-bar'),
	require('./plugins/custom-buttons'),
	require('./plugins/directional-selection'),
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
