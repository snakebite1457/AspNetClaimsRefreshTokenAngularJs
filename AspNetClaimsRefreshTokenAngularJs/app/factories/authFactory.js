'use strict';

var AuthFactory = function ($http, $q, localStorageService, ngAuthSettings) {

    var authenticationBase = ngAuthSettings.authenticationBase;
    var authServiceFactory = {};

    var _authentication = {
        isAuth: false,
        username: "",
        email: "",
        roles: []
    };

    var _externalAuthData = {
        provider: "",
        userName: "",
        externalAccessToken: ""
    };

    var _saveRegistration = function (registration) {

        _logOut();

        return $http.post(authenticationBase + 'api/account/register', registration).then(function (response) {
            return response;
        });
    };

    var _login = function (loginData) {

        var deferred = $q.defer();

        var data = "grant_type=password&username=" + loginData.Email + "&password=" + loginData.Password + "&client_id=" + ngAuthSettings.clientId;

        $http.post(authenticationBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

            localStorageService.set('authorizationData', {
                token: response.access_token,
                username: response.username,
                email: response.email,
                refreshToken: response.refresh_token,
                expires: response.expires_in - 5,
                issued: new Date($.now()),
                roles: $.parseJSON(response.roles)
            });

            _authentication.isAuth = true;
            _authentication.username = response.username;
            _authentication.email = loginData.Email;

            var parsedRoles = $.parseJSON(response.roles);
            for (var i = 0; i < parsedRoles.length; i++) {
                _authentication.roles.push(parsedRoles[i]);
            }

            deferred.resolve(response);

        }).error(function (err, status) {
            _logOut();
            deferred.reject(err);
        });

        return deferred.promise;

    };

    var _forgotPassword = function (forgotPasswordData) {

        var deferredObject = $q.defer();

        $http.post(
                authenticationBase + 'api/account/forgotPassword', forgotPasswordData
            ).
            success(function (response) {
                deferredObject.resolve(response);
            }).
            error(function (err) {
                deferredObject.reject(err);
            });

        return deferredObject.promise;
    };

    var _resetPassword = function (resetPasswordData) {

        var deferredObject = $q.defer();

        $http.post(
                authenticationBase + 'api/account/resetPassword', resetPasswordData
            ).
            success(function (response) {
                deferredObject.resolve(response);
            }).
            error(function (err) {
                deferredObject.reject(err);
            });

        return deferredObject.promise;
    };

    var _confirmEmail = function (confirmEmailData) {

        var deferredObject = $q.defer();

        $http.post(
                authenticationBase + 'api/account/confirmEmail', confirmEmailData
            ).
            success(function (response) {
                deferredObject.resolve(response);
            }).
            error(function (err) {
                deferredObject.reject(err);
            });

        return deferredObject.promise;
    };

    var _logOut = function () {

        localStorageService.remove('authorizationData');

        _authentication.isAuth = false;
        _authentication.email = "";
        _authentication.roles.length = 0;
    };


    var _refreshToken = function () {
        var deferred = $q.defer();

        var authData = localStorageService.get('authorizationData');

        if (authData) {
            var data = "grant_type=refresh_token&refresh_token=" + authData.refreshToken + "&client_id=" + ngAuthSettings.clientId;

            localStorageService.remove('authorizationData');

            $http.post(authenticationBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

                localStorageService.set('authorizationData', {
                    token: response.access_token,
                    username: response.username,
                    email: response.email,
                    refreshToken: response.refresh_token,
                    // Set the expired time.
                    // Notice, that the expiring time is not a date it's a timespan
                    // To overcome the issue of different time zones for server and client, the issued time will be set only in client
                    expires: response.expires_in - 5,
                    issued: new Date($.now()),
                    roles: response.roles
                });

                _authentication.roles.length = 0;
                var parsedRoles = $.parseJSON(response.roles);
                for (var i = 0; i < parsedRoles.length; i++) {
                    _authentication.roles.push(parsedRoles[i]);
                }

                deferred.resolve(response);

            }).error(function (err, status) {
                _logOut();
                deferred.reject(err);
            });
        }

        return deferred.promise;
    };

    var _fillAuthData = function () {

        var authData = localStorageService.get('authorizationData');
        if (authData) {
            _authentication.isAuth = true;
            _authentication.username = authData.username;
            _authentication.email = authData.email;

            // Reset the issued date from the existing storage object
            _authentication.issued = authData.issued;

            for (var i = 0; i < authData.roles.length; i++) {
                _authentication.roles.push(authData.roles[i]);
            }
        }
    };



    var _obtainAccessToken = function (externalData) {

        var deferred = $q.defer();

        $http.get(authenticationBase + 'api/account/ObtainLocalAccessToken', {
            params: { provider: externalData.provider, externalAccessToken: externalData.externalAccessToken }
        }).success(function (response) {

            localStorageService.set('authorizationData', { token: response.access_token, email: response.userName, refreshToken: "", useRefreshTokens: false });

            _authentication.isAuth = true;
            _authentication.email = response.userName;
            _authentication.useRefreshTokens = false;

            deferred.resolve(response);

        }).error(function (err, status) {
            _logOut();
            deferred.reject(err);
        });

        return deferred.promise;

    };

    var _registerExternal = function (registerExternalData) {

        var deferred = $q.defer();

        $http.post(authenticationBase + 'api/account/registerexternal', registerExternalData).success(function (response) {

            localStorageService.set('authorizationData', {
                token: response.access_token, email: response.userName, refreshToken: "", useRefreshTokens: false
            });

            _authentication.isAuth = true;
            _authentication.email = response.userName;
            _authentication.useRefreshTokens = false;

            deferred.resolve(response);

        }).error(function (err, status) {
            _logOut();
            deferred.reject(err);
        });

        return deferred.promise;

    };

    authServiceFactory.saveRegistration = _saveRegistration;
    authServiceFactory.login = _login;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.forgotPassword = _forgotPassword;
    authServiceFactory.resetPassword = _resetPassword;
    authServiceFactory.confirmEmail = _confirmEmail;
    authServiceFactory.fillAuthData = _fillAuthData;
    authServiceFactory.authentication = _authentication;
    authServiceFactory.refreshToken = _refreshToken;

    authServiceFactory.obtainAccessToken = _obtainAccessToken;
    authServiceFactory.externalAuthData = _externalAuthData;
    authServiceFactory.registerExternal = _registerExternal;

    return authServiceFactory;
};


AuthFactory.$inject = ['$http', '$q', 'localStorageService', 'ngAuthSettings'];


