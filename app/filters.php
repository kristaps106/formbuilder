<?php

/*
|--------------------------------------------------------------------------
| Application & Route Filters
|--------------------------------------------------------------------------
|
| Below you will find the "before" and "after" events for the application
| which may be used to do any work before or after a request into your
| application. Here you may also register your custom route filters.
|
*/

App::before(function($request)
{

});

/*
|----------------------------------------------------------------------------
| Prevent back login after logout by hitting the back button on your browser
|----------------------------------------------------------------------------
|
| http://laravel-tricks.com/tricks/prevent-back-login-after-logout-by-hitting-the-back-button-on-your-browser
|
*/
App::after(function ($request, $response) {

});

/*
|--------------------------------------------------------------------------
| Authentication Filters
|--------------------------------------------------------------------------
|
| The following filters are used to verify that the user of the current
| session is logged into this application. The "basic" filter easily
| integrates HTTP Basic authentication for quick, simple checking.
|
*/

Route::filter('auth', function()
{
});


Route::filter('auth.basic', function()
{
	return Auth::basic('username');
});

/*
|--------------------------------------------------------------------------
| Guest Filter
|--------------------------------------------------------------------------
|
| The "guest" filter is the counterpart of the authentication filters as
| it simply checks that the current user is not logged in. A redirect
| response will be issued if they are, which you may freely change.
|
*/

Route::filter('guest', function()
{
	//if (Auth::check()) return Redirect::to('/');
});

/*
|--------------------------------------------------------------------------
| CSRF Protection Filter
|--------------------------------------------------------------------------
|
| The CSRF filter is responsible for protecting your application against
| cross-site request forgery attacks. If this special token in a user
| session does not match the one given in this request, we'll bail.
|
*/

Route::filter('csrf', function()
{

});

Route::filter('acl.permitted', function($route)
{
    $permitted = false;

    $regulator_parametrs = array(
        'allowClassifier',
        'allowAcl',
        'allowForm',
        'allowReport',
        'allowRegistry',
		'allowClientManagement'
    );

    // Only when request regulator resources
    if (in_array($route->getName(), $regulator_parametrs)) {
        $permitted = Esynergy\DoctrineAuthProvider::checkRolePermission(Auth::user(), $route->getName());
    }
	
	if ($route->getName() == 'hasUserManagementRole') {
		if (Esynergy\DoctrineAuthProvider::checkRolePermission(Auth::user(), 'allowClientManagement')) {
			$permitted = true;
		}
		if (Esynergy\DoctrineAuthProvider::checkRolePermission(Auth::user(), 'allowAcl')) {
			$permitted = true;
		}
	}
	
    if ($route->getName() == 'isRegulator') {
        if (Auth::user()->getLdapUser()) {
            $permitted = true;
        }
    }

    if ($route->getName() == 'isMerchant') {
        if (Auth::user()->getClient()) {
            $permitted = true;
        }
    }

    if (!$permitted) {
        App::abort(403, 'Access denied');
    }

});