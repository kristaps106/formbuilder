<?php
	// Using the ini_set()
	ini_set("SMTP", "192.168.0.7");
	ini_set("sendmail_from", "iiastest@sprk.gov.lv");
	ini_set("smtp_port", "25");

	// The message
	$message = "Testing email";

	// Send
	$headers = "From: iiastest@sprk.gov.lv";

	mail('strazdins106@gmail.com', 'My Subject', $message, $headers);

	echo "Check your email now….<BR>";