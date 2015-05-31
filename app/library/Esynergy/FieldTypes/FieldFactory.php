<?php namespace Esynergy\FieldTypes;

class FieldFactory {

	public static function make($type, array $options)
	{
		$type = ucfirst($type);
		$name = $options['name'];

		unset($options['name']);

		$refl = new \ReflectionClass("\\Esynergy\\FieldTypes\\{$type}Field");
		return $refl->newInstanceArgs([$name, $options]);
	}

}