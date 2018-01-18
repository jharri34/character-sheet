'use strict';

angular.module('sheetApp', [
	'ngCookies',
	'ngResource',
	'ngSanitize',
	'ngRoute',
	'ngTouch',
	'ngAnimate',
	'ngDialog',
	'chieffancypants.loadingBar',
	'angularFileUpload'
])
	.config(function ($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'views/main.html',
				controller: 'MainCtrl'
			})
			.when('/sheet/:characterId?', {
				templateUrl: 'views/sheet.html',
				controller: 'SheetCtrl'
			})
			.when('/statblock/:characterId', {
				templateUrl: 'views/statblock.html',
				controller: 'StatBlockCtrl'
			})
			.when('/sandbox', {
				templateUrl: 'views/sandbox.html',
				controller: 'SandboxCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});
	})
	.config(function ($httpProvider) {
		var inci = function ($q, $location) {
			return {
				'responseError': function (rejection) {
					// treat all errors as 401 for now
					$location.path('#/');
					console.log(rejection)
					return $q.reject(rejection);
				}
			};
		};

		inci.$inject = ['$q', '$location'];

		$httpProvider.interceptors.push(inci);
	})
	.value('cache', {})
	.filter('range', function() {
		return function (input, total) {
			total = parseInt(total);
			for (var i = 0; i < total; i++) {
				input.push(i);
			}
			return input;
		};
	})
	.filter('ordinal', function () {
		return function (number) {
			var suffix = 'th';
			if (number === 1) {
				suffix = 'st';
			} else if (number === 2) {
				suffix = 'nd';
			}
			return number + suffix;
		};
	})
	.filter('expandGender', function () {
		return function (abbr) {
			var map = {
				'F': 'Female',
				'M': 'Male'
			};
			return map[abbr];
		};
	})
	.filter('expandSize', function () {
		return function (abbr) {
			var map = {
				'T': 'Tiny',
				'S': 'Small',
				'M': 'Medium',
				'L': 'Large',
				'H': 'Huge'
			};
			return map[abbr];
		};
	})
	.filter('orDash', function () {
		return function (value) {
			return value || '&mdash;';
		};
	})
	.filter('skillName', function () {
		return function (name) {
			return name.replace(/(\d)$/, '').replace(/([a-z])([A-Z])/g, '$1 $2');
		};
	})
	.run(function ($rootScope, $location, cache) {
		$rootScope.$on('$routeChangeSuccess', function(ev, data) {
			if (data.$$route && data.$$route.controller) {
				$rootScope.controllerName = data.$$route.controller;
			}
		});
	});
