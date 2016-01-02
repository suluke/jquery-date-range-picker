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
				}
			}
		},
		watch: {
			scripts: {
				files: ['lib/**/*.js', 'sass/**/*.scss'],
				tasks: [/*'jshint', */'broccoli:dev:build']
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-broccoli');

	grunt.registerTask('default', ['broccoli:production:build']);

};
