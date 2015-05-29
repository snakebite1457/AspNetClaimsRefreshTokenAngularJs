'use strict';

var LoginController = function ($scope, $routeParams, $q, $location, AuthFactory) {
    $scope.form = {
        Email: "",
        Password: "",
        RememberMe: false,
        returnUrl: $routeParams.returnUrl
    };

    $scope.loginFailure = false;

    $scope.login = function () {
        var deferred = $q.defer();

        $scope.validationErrors = [];
        $scope.loginFailure = false;

        AuthFactory.login($scope.form).then(function (response) {
            $location.path('/dashboard');
            deferred.resolve();

        }, function (error) {
            $scope.validationErrors.push(error.error_description);
            $scope.loginFailure = true;
            deferred.resolve();
        });


        return deferred.promise;
    }
};

LoginController.$inject = ['$scope', '$routeParams', '$q', '$location', 'AuthFactory'];


var RegisterController = function ($scope, $routeParams, $q, $location, AuthFactory, $timeout, ngAuthSettings) {
    $scope.form = {
        Email: "",
        Username: "",
        Password: "",
        ConfirmPassword: "",
        ClientId: ngAuthSettings.clientId
    };

    $scope.showRegisterForm = true;
    $scope.registrationFailure = false;

    $scope.register = function () {
        var deferred = $q.defer();

        $scope.validationErrors = [];
        $scope.registrationFailure = false;


        AuthFactory.saveRegistration($scope.form).then(function (response) {
            $scope.showRegisterForm = false;
            $scope.successMessage = response;
            startTimer();

            deferred.resolve();
        },
         function (response) {
             for (var key in response.data.modelState) {
                 for (var i = 0; i < response.data.modelState[key].length; i++) {
                     $scope.validationErrors.push(response.data.modelState[key][i]);
                 }
             }

             $scope.registrationFailure = true;
             deferred.resolve();
         });

        return deferred.promise;
    }


    var startTimer = function () {
        var timer = $timeout(function () {
            $timeout.cancel(timer);
            $location.path('/login');
        }, 2000);
    }


};

RegisterController.$inject = ['$scope', '$routeParams', '$q', '$location', 'AuthFactory', '$timeout', 'ngAuthSettings'];


var ForgotPasswordController = function ($scope, $location, $q, AuthFactory, ngAuthSettings) {
    $scope.form = {
        Email: "",
        ClientId: ngAuthSettings.clientId
    };

    $scope.validationErrors = [];
    $scope.failure = false;
    $scope.showForgotPasswordForm = true;

    $scope.linkEmail = function () {
        var deferred = $q.defer();

        $scope.validationErrors = [];
        $scope.failure = false;
        $scope.showForgotPasswordForm = true;

        AuthFactory.forgotPassword($scope.form).then(function (response) {
            $scope.showForgotPasswordForm = false;
            $scope.successMessage = response;
            deferred.resolve();
        },
        function (response) {
            for (var key in response.modelState) {
                for (var i = 0; i < response.modelState[key].length; i++) {
                    $scope.validationErrors.push(response.modelState[key][i]);
                }
            }

            $scope.showForgotPasswordForm = true;
            deferred.resolve();
        });

        return deferred.promise;
    }
};

ForgotPasswordController.$inject = ['$scope', '$location', '$q', 'AuthFactory', 'ngAuthSettings'];


var ResetPasswordController = function ($scope, $location, $q, AuthFactory) {
    $scope.form = {
        Email: "",
        Password: "",
        ConfirmPassword: "",
        Code: $location.search().code
    };

    $scope.validationErrors = [];
    $scope.failure = false;
    $scope.showResetPasswordForm = true;

    $scope.resetPassword = function () {
        var deferred = $q.defer();

        $scope.validationErrors = [];
        $scope.failure = false;
        $scope.showResetPasswordForm = true;

        AuthFactory.resetPassword($scope.form).then(function (response) {
            $scope.showResetPasswordForm = false;
            $scope.successMessage = response;
            deferred.resolve();
        },
        function (response) {
            for (var key in response.modelState) {
                for (var i = 0; i < response.modelState[key].length; i++) {
                    $scope.validationErrors.push(response.modelState[key][i]);
                }
            }

            $scope.showResetPasswordForm = true;
            $scope.failure = true;
            deferred.resolve();
        });

        return deferred.promise;
    }
};

ResetPasswordController.$inject = ['$scope', '$location', '$q', 'AuthFactory'];

var ConfirmEmailController = function ($scope, $location, $q, AuthFactory) {
    $scope.form = {
        userId: $location.search().userId,
        code: $location.search().code
    };

    $scope.validationErrors = [];

    AuthFactory.confirmEmail($scope.form).then(function (response) {
        $scope.confirmEmailFailure = false;
        $scope.successMessage = response;
    },
    function (response) {
        for (var key in response.data.modelState) {
            for (var i = 0; i < response.data.modelState[key].length; i++) {
                $scope.validationErrors.push(response.data.modelState[key][i]);
            }
        }

        $scope.confirmEmailFailure = true;
    });
};

ConfirmEmailController.$inject = ['$scope', '$location', '$q', 'AuthFactory'];

/* Utility Functions */
function _showValidationErrors($scope, errors) {
    $(errors).each(function (index, value) {
        $scope.validationErrors.push(value);
    });
}
