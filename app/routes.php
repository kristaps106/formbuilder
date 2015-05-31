<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/


    Route::get('/', 'FormTemplateController@index');

    Route::match(array('GET', 'POST'), 'komersanta-dokumenti', 'FormPostMerchantController@index');

    // Veidlapu sagataves
    Route::get('veidlapu-sagataves', array(
        'uses'      => 'FormTemplateController@index'
    ));
    Route::get('veidlapu-sagatave/labot/{id}', array(
        'uses'      => 'FormTemplateController@edit'
    ));
    Route::post('veidlapu-sagatave/izmainit/{id}', array(
        'uses'      => 'FormTemplateController@update'
    ));
    Route::get('veidlapu-sagatave/izveidot', array(
        'uses'      => 'FormTemplateController@create'
    ));
    Route::post('veidlapu-sagatave/saglabat', array(
        'uses'      => 'FormTemplateController@store'
    ));
    Route::delete('veidlapu-sagatave/dzest/{id}', array(
        'uses'      => 'FormTemplateController@destroy'
    ));
    Route::post('veidlapu-sagatave/apstiprinat/{id}', array(
        'uses'      => 'FormTemplateController@approve'
    ));
    Route::get('veidlapu-sagatave/apskatit/{id}', array(
        'uses'      => 'FormTemplateController@show'
    ));
    Route::put('veidlapu-sagatave/kopija/{id}', array(
        'uses'      => 'FormTemplateController@cloneItem'
    ));
    Route::post('veidlapu-sagatave/parbaudit/{id}', array(
        'uses'      => 'FormTemplateController@validate'
    ));
    Route::get('veidlapu-sagatave/{id}/drukat', array(
        'uses'      => 'FormTemplateController@printout'
    ));

    // Documents
    Route::match(array('GET', 'POST'), 'dokumenti', array(
        'uses'      => 'FormPostController@index'
    ));
    Route::get('dokumenti/jauns/{id}', array(
        'uses'      => 'FormPostController@create'
    ));
    Route::post('dokumenti/izveidot/{id}', array(
        'uses'      => 'FormPostController@store'
    ));
    Route::get('dokumenti/labot/{id}', array(
        'uses'      => 'FormPostController@edit'
    ));
    Route::get('dokumenti/{id}/drukat', array(
        'uses'      => 'FormPostController@printout'
    ));
    Route::post('dokumenti/saglabat/{id}', array(

        'uses'      => 'FormPostController@update'
    ));
    Route::delete('dokumenti/dzest/{id}', array(

        'uses'      => 'FormPostController@destroy'
    ));
    Route::post('dokumenti/dokumenta-sagatave', array(
        'uses'      => 'FormPostController@createDocument'
    ));

