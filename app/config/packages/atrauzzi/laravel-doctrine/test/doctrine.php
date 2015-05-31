<?php

return array(

	/*
	|--------------------------------------------------------------------------
	| Database Connection
	|--------------------------------------------------------------------------
	|
	| This array passes right through to the EntityManager factory.
	|
	| http://www.doctrine-project.org/documentation/manual/2_0/en/dbal
	|
	*/

	'connection' => array(

        'driverClass'	=> 'Lsw\DoctrinePdoDblib\Doctrine\DBAL\Driver\PDODblib\Driver',
        'user'			=> 'sprk',
        'password'		=> 'sprk12',
        'dbname'		=> 'sprk',
        'host'			=> '192.168.3.1',
        'prefix'		=> ''

	),

	/*
	|--------------------------------------------------------------------------
	| Metadata Sources
	|--------------------------------------------------------------------------
	|
	| This array passes right through to the EntityManager factory.
	|
	| http://docs.doctrine-project.org/projects/doctrine-orm/en/latest/reference/configuration.html
	|
	*/
	'metadata' => array(
		__DIR__.'/../../../../../../app/models'
	),

	/*
	|--------------------------------------------------------------------------
	| Sets the directory where Doctrine generates any proxy classes, including
	| with which namespace.
	|--------------------------------------------------------------------------
	|
	| http://docs.doctrine-project.org/projects/doctrine-orm/en/latest/reference/configuration.html
	|
	*/
	'proxy_classes' => array(
		'auto_generate' => false,
		'directory' => __DIR__ . '/../../../../../storage/proxy_classes',
		'namespace' => null,
	),
 
 	/*
	|--------------------------------------------------------------------------
	| Cache providers, supports apc, xcache, memcache, redis
	| Only redis and memcache have additionals configurations
	|--------------------------------------------------------------------------
	*/
	'cache' => array(
		'provider' => 'redis',

		'redis' => array(
			'host'     => '127.0.0.1',
			'port'     => 6379,
			'database' => 1
		),

		'memcache' => array(
			'host' => '127.0.0.1', 
			'port' => 11211
		)
	),

	'migrations' => array(
		'directory' => '/database/doctrine-migrations',
		'table_name' => 'doctrine_migration_versions'
	),

 	/*
	|--------------------------------------------------------------------------
	| Use to specify the default repository
    | http://docs.doctrine-project.org/en/2.1/reference/configuration.html item 3.7
	|--------------------------------------------------------------------------
	*/
   'defaultRepository' => '\Doctrine\ORM\EntityRepository',

 	/*
	|--------------------------------------------------------------------------
	| Use to specify the SQL Logger
    | http://docs.doctrine-project.org/en/2.1/reference/configuration.html item 3.2.6
    | To use with \Doctrine\DBAL\Logging\EchoSQLLogger, do:
    | 'sqlLogger' => new \Doctrine\DBAL\Logging\EchoSQLLogger();
	|--------------------------------------------------------------------------
	*/
   'sqlLogger' => null,
);
