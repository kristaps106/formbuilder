<?php namespace Esynergy\FieldTypes;

/**
 * Class BaseField
 * @package Esynergy\FieldTypes
 */
abstract class BaseField {

    /**
     * HTML name attribute.
     *
     * @var string
     */
    protected $name;

    /**
     * All other relevant data.
     *
     * Including some HTML attributes.
     *
     * @var array
     */
    protected $options;

    /**
     * Get name of the view.
     *
     * @return string
     */
    abstract public function getViewName();

    /**
     * Render the field.
     *
     * @return \Illuminate\View\View
     */
    public function render()
	{
		return \View::make('fieldtypes/'.$this->getViewName(), [
			'name' => $this->getName(),
			'options' => $this->getOptions(),
			'id' => $this->getOption('id'),
            'uniqid' => uniqid(sha1($this->getName())."-", true),
			'value' => $this->getOption('value')
		]);
	}

    /**
     * @param $name
     * @param array $options
     */
    public function __construct($name, array $options = array())
	{
		$this->name = $name;
		$this->options = $options;

		$refl = new \ReflectionClass($this);
		if($refl->hasMethod('init'))
		{
			if($refl->getMethod('init')->getNumberOfParameters() == 0)
			{
				$this->init();
			}
		}
	}

    /**
     * @return mixed
     */
    public function getName()
	{
		return $this->name;
	}

    /**
     * @param $name
     * @return mixed
     */
    public function setName($name)
	{
		return $this->name = $name;
	}

    /**
     * @return array
     */
    public function getOptions()
	{
		return $this->options;
	}

    /**
     * @param $option
     * @param null $default
     * @return null
     */
    public function getOption($option, $default = null)
	{
		if(array_key_exists($option, $this->options))
			return $this->options[$option];
		else
			return $default;
	}

    /**
     * @param $option
     * @param $value
     * @return mixed
     */
    public function setOption($option, $value)
	{
		return $this->options[$option] = $value;
	}

}