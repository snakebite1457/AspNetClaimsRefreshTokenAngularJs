'use strict';

function AuthHttpResponseInterceptor($q, $location, $injector, localStorageService) {
    var refreshDefered = null;
    var refreshOnTheFly = false;

    var fillConfig = function (config) {
        config.headers = config.headers || {};

        var authData = localStorageService.get('authorizationData');
        if (authData) {
            config.headers.Authorization = 'Bearer ' + authData.token;
        }

        return config;
    }

    return {
        request: function (config) {

            var deferred = $q.defer();

            var authService = $injector.get('AuthFactory');
            var authData = localStorageService.get('authorizationData');

            if (!authData) {
                deferred.resolve(fillConfig(config));
            } else {
                // Check if token is expired
                var expiredDate = new Date(authData.issued);
                expiredDate.setSeconds(expiredDate.getSeconds() + authData.expires);

                if (expiredDate <= new Date($.now())) {
                    if (refreshOnTheFly) {
                        refreshDefered.then(function () {
                            deferred.resolve(fillConfig(config));
                        },
                            function (err) {
                                refreshOnTheFly = false;
                                deferred.reject(err);
                                authService.logOut();
                                $location.path('/login').search('returnUrl', $location.path());
                            });
                    } else {

                        refreshDefered = authService.refreshToken();
                        refreshOnTheFly = true;

                        refreshDefered.then(function () {
                            refreshOnTheFly = false;
                            deferred.resolve(fillConfig(config));
                        },
                            function (err) {
                                refreshOnTheFly = false;
                                deferred.reject(err);
                                authService.logOut();
                                $location.path('/login').search('returnUrl', $location.path());
                            });
                    }
                } else {
                    deferred.resolve(fillConfig(config));
                }
            }

            return deferred.promise;
        }
    };


}

AuthHttpResponseInterceptor.$inject = ['$q', '$location', '$injector', 'localStorageService'];

