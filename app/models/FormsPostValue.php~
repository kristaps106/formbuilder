<?php

use Doctrine\ORM\Mapping as ORM;

/**
 * Forms
 *
 * @ORM\Table(name="forms_post_value", options={"comment":"Dokumentu vērtību tabula"})
 * @ORM\Entity(repositoryClass="Repositories\FormsPostValueRepository")
 */
class FormsPostValue
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer", nullable=false, options={"comment":"Dokumentu vērtību tabulas primārā atslēga"})
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="value", type="string", nullable=true, options={"comment":"Dokumentu vērtību tabulas primārā atslēga"})
     */
    private $value;

    /**
     * @ORM\ManyToOne(targetEntity="FormsPost", inversedBy="values")
     */
    private $post;

    /**
     * @ORM\ManyToOne(targetEntity="FormsField", inversedBy="values")
     */
    private $field;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="modified_at", type="datetime", nullable=false, options={"comment":"Ieraksta rediģēšanas datums"})
     */
    private $modified_at;



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
     * Set value
     *
     * @param string $value
     * @return FormsPostValue
     */
    public function setValue($value)
    {
        $this->value = $value;

        return $this;
    }

    /**
     * Get value
     *
     * @return string 
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * Set modified_at
     *
     * @param \DateTime $modifiedAt
     * @return FormsPostValue
     */
    public function setModifiedAt($modifiedAt)
    {
        $this->modified_at = $modifiedAt;

        return $this;
    }

    /**
     * Get modified_at
     *
     * @return \DateTime 
     */
    public function getModifiedAt()
    {
        return $this->modified_at;
    }

    /**
     * Set post
     *
     * @param \FormsPost $post
     * @return FormsPostValue
     */
    public function setPost(\FormsPost $post = null)
    {
        $this->post = $post;

        return $this;
    }

    /**
     * Get post
     *
     * @return \FormsPost 
     */
    public function getPost()
    {
        return $this->post;
    }

    /**
     * Set field
     *
     * @param \FormsField $field
     * @return FormsPostValue
     */
    public function setField(\FormsField $field = null)
    {
        $this->field = $field;

        return $this;
    }

    /**
     * Get field
     *
     * @return \FormsField 
     */
    public function getField()
    {
        return $this->field;
    }
}
