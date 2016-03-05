class BatchMode {
	
	static addToPicker(picker) {
		const opt = picker.getOptions();
		if (opt.batchmode) {
			
		}
	}
	
	static addOptionDefaults(opts) {
		opts.batchMode = false;
	}
}

module.exports = BatchMode;
