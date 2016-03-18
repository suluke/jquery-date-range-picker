window.DateRangePicker.OptionsSchema = {
	id: 'http://github.com/suluke/jquery-date-rannge-picker/options',
	$schema: 'http://json-schema.org/schema#',
	definitions: {
		'function': {
			type: 'string'
		},
		dom: {
			type: 'string'
		},
		date: {
			type: 'string'
		},
		undef: {
			enum: [false, null, undefined]
		}
	},
	type: 'object',
	properties: {
		alwaysOpen: {type: 'boolean'},
		autoClose: {type: 'boolean'},
		batchMode: {oneOf: [{type: 'string'}, {type: 'boolean'}]},
		beforeShowDay: {$ref: '#definitions/function'},
		closeListeners: {
			oneOf: [
				{
					type: 'object',
					properties: {
						event: {type: 'string'},
						target: {$ref: '#definitions/dom'},
						filter: {$ref: '#definitions/function'}
					}
				},
				{$ref: '#definitions/undef'}
			]
		},
		container: {$ref: '#definitions/dom'},
		customShortcuts: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					name: {type: 'string'},
					dates: {$ref: '#definitions/function'}
				}
			}
		},
		customValues: {
			type: 'object',
			properties: {
				enabled: {type: 'boolean'},
				values: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							value: {type: 'string'},
							name: {type: 'string'}
						}
					}
				},
				label: {
					anyOf: [{$ref: '#definitions/undef'}, {type: 'string'}]
				}
			}
		},
		dayDivAttrs: {type: 'array', items: {type: 'string'}},
		dayTdAttrs: {type: 'array', items: {type: 'string'}},
		defaultTime: {$ref: '#definitions/date'},
		draggableRangeBounds: {type: 'boolean'},
		duration: {type: 'integer'},
		endDate: {$ref: '#definitions/date'},
		extraClass: {anyOf: [{type: 'string'}, {$ref: '#definitions/undef'}]},
		format: {type: 'string'},
		functions: {
			type: 'object', 
			properties: {
				calcPosition: {$ref: '#definitions/function'}
			}
		},
		inline: {type: 'boolean'},
		language: {type: 'string'},
		lookBehind: {type: 'boolean'},
		maxDays: {type: 'integer'},
		minDays: {type: 'integer'},
		openListeners: {
			oneOf: [
				{
					type: 'object',
					properties: {
						event: {type: 'string'},
						target: {$ref: '#definitions/dom'},
						filter: {$ref: '#definitions/function'}
					}
				},
				{$ref: '#definitions/undef'}
			]
		},
		preventDoubleClicks: {type: 'boolean'},
		scrollThroughMonths: {
			type: 'object',
			properties: {
				enabled: {type: 'boolean'}
			}
		},
		selectForward: {type: 'boolean'},
		selectBackward: {type: 'boolean'},
		separator: {type: 'string'},
		shortcuts: {
			type: 'object',
			properties: {
				'prev-days': {type: 'array', items: {type: 'integer'}},
				'next-days': {type: 'array', items: {type: 'integer'}},
				prev: {enum: ['week', 'month', 'year']},
				next: {enum: ['week', 'month', 'year']}
			}
		},
		showDateFilter: {$ref: '#definitions/function'},
		showShortcuts: {type: 'boolean'},
		singleDate: {type: 'boolean'},
		singleMonth: {oneOf: [{type: 'boolean'}, {enum: ['auto']}]},
		startDate: {$ref: '#definitions/date'},
		startOfWeek: {enum: ['monday', 'sunday']},
		stickyMonths: {type: 'boolean'},
		swapTime: {type: 'boolean'},
		time: {
			type: 'object',
			properties: {
				enabled: {type: 'boolean'},
				defaultStart: {type: 'boolean'},
				defaultEnd: {type: 'boolean'},
				hours: {
					type: 'object',
					properties: {
						enabled: {type: 'boolean'},
						max: {type: 'integer'},
						min: {type: 'integer'},
						step: {type: 'integer'}
					}
				},
				minutes: {
					type: 'object',
					properties: {
						enabled: {type: 'boolean'},
						max: {type: 'integer'},
						min: {type: 'integer'},
						step: {type: 'integer'}
					}	
				}
			}
		},
		tooltip: {
			type: 'object',
			properties: {
				enabled: {type: 'boolean'},
				getText: {anyOf: [{type: 'string'}, {$ref: '#definitions/function'}]}
			}
		},
		topBar: {
			type: 'object',
			properties: {
				applyBtnClass: {type: 'string'},
				customText: {anyOf: [{type: 'string'}, {$ref: '#definitions/function'}, {$ref: '#definitions/undef'}]},
				enabled: {type: 'boolean'}
			}
		},
		weekNumbers: {
			type: 'object',
			properties: {
				enabled: {type: 'boolean'},
				getWeekName: {$ref: '#definitions/function'}
			}
		}
	}
};
