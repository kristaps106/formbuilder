<?php

// Displays sql queries into an SQL queries view using DebugBar\Bridge\DoctrineCollector
$debugStack = new Doctrine\DBAL\Logging\DebugStack();
$app['doctrine']->getConnection()->getConfiguration()->setSQLLogger($debugStack);
$app['debugbar']->addCollector(new DebugBar\Bridge\DoctrineCollector($debugStack));