<?php namespace Esynergy\FieldTypes;

class MultiselectField extends SelectField {

	public function init()
	{
		$this->setOption('multiple', true);
	}

}