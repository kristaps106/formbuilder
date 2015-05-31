<?php
return [
	'domain'            => 'cs.local',
	'loging_enabled'    => TRUE,
	'ews_version'       => 'Exchange2010',
	'exchange'          => array(
        'host'     => 'mail.csolutions.lv',
        'from'     => 'sprk@esynergy.lv',       // Exchange user email - required
        'test_to'  => 'sprk@esynergy.lv',     // Set email address to receive all system emails when develop
        'username' => 'sprk',
        'password' => 'fatRuF3xuBrA'
    )
];