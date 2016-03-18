/**
 * This file contains various functions to check the schema
 */

var optionSchema = window.DateRangePicker.OptionsSchema;
var options = DateRangePicker.getDefaultOptions();

inverseCompare(options, optionSchema);
testHasTitles(optionSchema);
testHasDescriptions(optionSchema);

function check(condition, msg) {
	if (!condition) {
		console.warn(msg);
	}
	return condition;
}

function inverseCompare(value, schema, path) {
	if (!path) {
		path = '';
	}
	if ((typeof value === 'object') && (value !== null) && !isSpecialObject(value, schema)) {
		// TODO schema could also be allOf/oneOf/anyOf
		if (check(schema.type === 'object', 'Given element ' + path + ' is an object, but the schema says it isn\'t')) {
			for (var key in value) {
				if (!value.hasOwnProperty(key)) {
					continue;
				}
				if (!check(schema.properties, 'Object ' + path + ' has properties, but the schema does not describe any')) {
					break;
				}
				if (check(key in schema.properties, 'Schema for object ' + path + ' does not describe the existing property ' + key)) {
					inverseCompare(value[key], schema.properties[key], path + '.' + key);
				}
			}
		}
	} else if (Array.isArray(value)) {
		// TODO schema could also be allOf/oneOf/anyOf
		if (check(schema.type === 'array', 'Schema for element ' + path + ' does not describe it to be an array')) {
			if (schema.items) {
				if (Array.isArray(schema.items)) {
					for (var item = value[0], i = 0; i < value.length; i++, item = value[i]) {
						inverseCompare(item, schema.items[i], path + '[' + i + ']');
					}
				} else {
					for (var item = value[0], i = 0; i < value.length; i++, item = value[i]) {
						inverseCompare(item, schema.items, path + '[' + i + ']');
					}
				}
			}
		}
	} 
}

function isSpecialObject(obj, schema) {
	return Array.isArray(obj) || schema.$ref;
}

function testHasTitles(schema) {
	
}

function testHasDescriptions(schema) {
	
}
