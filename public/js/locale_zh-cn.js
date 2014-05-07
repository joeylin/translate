'use strict';
/*global angular*/

angular.module('jsGen.locale', ['ngLocale']).
run(['$locale',
    function($locale) {
        angular.extend($locale, {
            COMPONENTS: {
                login: 'login',
            }
        });
    }
]);