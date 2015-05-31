<?php

use Doctrine\ORM\Mapping as ORM;

/**
 * Forms
 *
 * @ORM\Table(name="forms_field", options={"comment":"Veidlapu lauku tabula"})
 * @ORM\Entity(repositoryClass="Repositories\FormsFieldRepository")
 */
class FormsField
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer", nullable=false, options={"comment":"Veidlapu lauku tabulas primārā atslēga"})
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="field_id", type="string", length=100, nullable=true, options={"comment":"Lauka identifikators"})
     */
    private $field_id;

    /**
     * @var string
     *
     * @ORM\Column(name="field_type", type="string", nullable=false, options={"comment":"Lauka tips"})
     */
    private $field_type;

    /**
     * @var string
     *
     * @ORM\Column(name="field_name", type="string", nullable=true, options={"comment":"Lauka nosaukums"})
     */
    private $field_name;

    /**
     * @var text
     *
     * @ORM\Column(name="field_formula", type="text", nullable=true, options={"comment":"Lauka formula"})
     */
    private $field_formula;

    /**
     * @var string
     *
     * @ORM\Column(name="field_format", type="string", nullable=true, options={"comment":"Lauka formāts"})
     */
    private $field_format;

    /**
     * @ORM\ManyToOne(targetEntity="FormsTemplate", inversedBy="fields", fetch="EAGER")
     */
    private $form;

    /**
     * @ORM\OneToMany(targetEntity="FormsPostValue", mappedBy="field")
     */
    private $values;

    /**
     * @var text
     *
     * @ORM\Column(name="field_options", type="text", nullable=true, options={"comment":"Lauka parametri"})
     */
    private $field_options;

    /**
     * @var string
     *
     * @ORM\Column(name="field_validation_level", type="string", nullable=true, options={"comment":"Lauka pārbaudes līmenis"})
     */
    private $field_validation_level;

    /**
     * @var string
     *
     * @ORM\Column(name="field_validation_message", type="string", nullable=true, options={"comment":"Lauka pārbaudes brīdinājuma teksts"})
     */
    private $field_validation_message;

    /**
     * @var string
     *
     * @ORM\Column(name="save_to", type="string", nullable=true, options={"comment":"Pēc apstiprināšanas lauka vērtības saglabāšanas definīcija"})
     */
    private $save_to;
    /**
     * Constructor
     */
    public function __construct()
    {
        $this->values = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set field_id
     *
     * @param string $fieldId
     * @return FormsField
     */
    public function setFieldId($fieldId)
    {
        $this->field_id = $fieldId;

        return $this;
    }

    /**
     * Get field_id
     *
     * @return string 
     */
    public function getFieldId()
    {
        return $this->field_id;
    }

    /**
     * Set field_type
     *
     * @param string $fieldType
     * @return FormsField
     */
    public function setFieldType($fieldType)
    {
        $this->field_type = $fieldType;

        return $this;
    }

    /**
     * Get field_type
     *
     * @return string 
     */
    public function getFieldType()
    {
        return $this->field_type;
    }

    /**
     * Set field_name
     *
     * @param string $fieldName
     * @return FormsField
     */
    public function setFieldName($fieldName)
    {
        $this->field_name = $fieldName;

        return $this;
    }

    /**
     * Get field_name
     *
     * @return string 
     */
    public function getFieldName()
    {
        return $this->field_name;
    }

    /**
     * Set field_formula
     *
     * @param string $fieldFormula
     * @return FormsField
     */
    public function setFieldFormula($fieldFormula)
    {
        $this->field_formula = $fieldFormula;

        return $this;
    }

    /**
     * Get field_formula
     *
     * @return string 
     */
    public function getFieldFormula()
    {
        return $this->field_formula;
    }

    /**
     * Set field_format
     *
     * @param string $fieldFormat
     * @return FormsField
     */
    public function setFieldFormat($fieldFormat)
    {
        $this->field_format = $fieldFormat;

        return $this;
    }

    /**
     * Get field_format
     *
     * @return string 
     */
    public function getFieldFormat()
    {
        return $this->field_format;
    }

    /**
     * Set field_options
     *
     * @param string $fieldOptions
     * @return FormsField
     */
    public function setFieldOptions($fieldOptions)
    {
        $this->field_options = $fieldOptions;

        return $this;
    }

    /**
     * Get field_options
     *
     * @return string 
     */
    public function getFieldOptions()
    {
        return $this->field_options;
    }

    /**
     * Set field_validation_level
     *
     * @param string $fieldValidationLevel
     * @return FormsField
     */
    public function setFieldValidationLevel($fieldValidationLevel)
    {
        $this->field_validation_level = $fieldValidationLevel;

        return $this;
    }

    /**
     * Get field_validation_level
     *
     * @return string 
     */
    public function getFieldValidationLevel()
    {
        return $this->field_validation_level;
    }

    /**
     * Set field_validation_message
     *
     * @param string $fieldValidationMessage
     * @return FormsField
     */
    public function setFieldValidationMessage($fieldValidationMessage)
    {
        $this->field_validation_message = $fieldValidationMessage;

        return $this;
    }

    /**
     * Get field_validation_message
     *
     * @return string 
     */
    public function getFieldValidationMessage()
    {
        return $this->field_validation_message;
    }

    /**
     * Set save_to
     *
     * @param string $saveTo
     * @return FormsField
     */
    public function setSaveTo($saveTo)
    {
        $this->save_to = $saveTo;

        return $this;
    }

    /**
     * Get save_to
     *
     * @return string 
     */
    public function getSaveTo()
    {
        return $this->save_to;
    }

    /**
     * Set form
     *
     * @param \FormsTemplate $form
     * @return FormsField
     */
    public function setForm(\FormsTemplate $form = null)
    {
        $this->form = $form;

        return $this;
    }

    /**
     * Get form
     *
     * @return \FormsTemplate 
     */
    public function getForm()
    {
        return $this->form;
    }

    /**
     * Add values
     *
     * @param \FormsPostValue $values
     * @return FormsField
     */
    public function addValue(\FormsPostValue $values)
    {
        $this->values[] = $values;

        return $this;
    }

    /**
     * Remove values
     *
     * @param \FormsPostValue $values
     */
    public function removeValue(\FormsPostValue $values)
    {
        $this->values->removeElement($values);
    }

    /**
     * Get values
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getValues()
    {
        return $this->values;
    }
}
