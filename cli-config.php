<?php
use Doctrine\ORM\Tools\Console\ConsoleRunner;
use Illuminate\Foundation\Application;
use \Doctrine\ORM\EntityManager;

require __DIR__.'/bootstrap/autoload.php';

/** @var Application $app */
$app = require_once __DIR__.'/bootstrap/start.php';

/** @var EntityManager $entityManager */
$entityManager = $app['doctrine'];

return ConsoleRunner::createHelperSet($entityManager);