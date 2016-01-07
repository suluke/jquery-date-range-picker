module.exports = function(grunt) {
	grunt.initConfig({
		broccoli: {
			dist: {
				dest: 'dist',
				env: 'production'
			},
			dev: {
				dest: 'dist',
				env: 'development'
			}
		},
		jshint: {
			files: ['lib/**/*.js'],
			options: {
				globals: {
					jQuery: true
				},
				jshintrc: 'jshintrc.json'
			}
		},
		jscs: {
			src: "lib/*.js",
			options: {
				config: "jscsrc.json",
				esnext: true, // If you use ES6 http://jscs.info/overview.html#esnext
				verbose: true, // If you need output with rule names http://jscs.info/overview.html#verbose
				fix: true // Autofix code style violations when possible.
			}
		},
		watch: {
			scripts: {
				files: ['lib/**/*.js', 'sass/**/*.scss'],
				tasks: ['jshint', /*'jscs',*/ 'broccoli:dev:build']
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jscs');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-broccoli');

	grunt.registerTask('default', ['jshint', 'jscs', 'broccoli:dist:build']);

};
