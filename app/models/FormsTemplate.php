<?php

use Doctrine\ORM\Mapping as ORM;

/**
 * Forms
 *
 * @ORM\Table(name="forms_template", options={"comment":"Veidlapu sagatavju tabula"})
 * @ORM\Entity
 */
class FormsTemplate
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer", nullable=false, options={"comment":"Veidlapu sagatavju tabulas primārā atslēga"})
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;
    
    /**
     * @var integer
     *
     * @ORM\Column(name="parent_id", type="integer", nullable=true, options={"comment":"Sagataves vecāka identifikators"})
     */
    private $parent_id;
    
    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255, nullable=false, options={"comment":"Sagataves nosaukums"})
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="content", type="text", nullable=false, options={"comment":"Sagatave saturs JSON formātā"})
     */
    private $content;

    /**
     * @var string
     *
     * @ORM\Column(name="status", type="string", nullable=false, options={"comment":"Sagataves statuss"})
     */
    private $status;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="created_at", type="datetime", nullable=false, options={"comment":"Ieraksta pievienošanas datums"})
     */
    private $created_at;

    /**
     * @var integer
     *
     * @ORM\Column(name="version", type="integer", nullable=false, options={"comment":"Sagataves versija"})
     */
    private $version;


    /**
     * @var \DateTime
     *
     * @ORM\Column(name="modified_at", type="datetime", nullable=false, options={"comment":"Ieraksta rediģēšanas datums"})
     */
    private $modified_at;
    
    /**
     * @ORM\OneToMany(targetEntity="FormsField", mappedBy="form")
     */
    private $fields;

    /**
     * @ORM\OneToMany(targetEntity="FormsPost", mappedBy="form")
     */
    private $posts;


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
     * Set parent_id
     *
     * @param integer $parentId
     * @return FormsTemplate
     */
    public function setParentId($parentId)
    {
        $this->parent_id = $parentId;

        return $this;
    }

    /**
     * Get parent_id
     *
     * @return integer 
     */
    public function getParentId()
    {
        return $this->parent_id;
    }

    /**
     * Set name
     *
     * @param string $name
     * @return FormsTemplate
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string 
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set content
     *
     * @param string $content
     * @return FormsTemplate
     */
    public function setContent($content)
    {
        $this->content = $content;

        return $this;
    }

    /**
     * Get content
     *
     * @return string 
     */
    public function getContent()
    {
        return $this->content;
    }

    /**
     * Set status
     *
     * @param string $status
     * @return FormsTemplate
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get status
     *
     * @return string 
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Set created_at
     *
     * @param \DateTime $createdAt
     * @return FormsTemplate
     */
    public function setCreatedAt($createdAt)
    {
        $this->created_at = $createdAt;

        return $this;
    }

    /**
     * Get created_at
     *
     * @return \DateTime 
     */
    public function getCreatedAt()
    {
        return $this->created_at;
    }

    /**
     * Set version
     *
     * @param integer $version
     * @return FormsTemplate
     */
    public function setVersion($version)
    {
        $this->version = $version;

        return $this;
    }

    /**
     * Get version
     *
     * @return integer 
     */
    public function getVersion()
    {
        return $this->version;
    }

    /**
     * Set modified_at
     *
     * @param \DateTime $modifiedAt
     * @return FormsTemplate
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
     * Constructor
     */
    public function __construct()
    {
        $this->fields = new \Doctrine\Common\Collections\ArrayCollection();
        $this->posts = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Add fields
     *
     * @param \FormsField $fields
     * @return FormsTemplate
     */
    public function addField(\FormsField $fields)
    {
        $this->fields[] = $fields;

        return $this;
    }

    /**
     * Remove fields
     *
     * @param \FormsField $fields
     */
    public function removeField(\FormsField $fields)
    {
        $this->fields->removeElement($fields);
    }

    /**
     * Get fields
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getFields()
    {
        return $this->fields;
    }

    /**
     * Add posts
     *
     * @param \FormsPost $posts
     * @return FormsTemplate
     */
    public function addPost(\FormsPost $posts)
    {
        $this->posts[] = $posts;

        return $this;
    }

    /**
     * Remove posts
     *
     * @param \FormsPost $posts
     */
    public function removePost(\FormsPost $posts)
    {
        $this->posts->removeElement($posts);
    }

    /**
     * Get posts
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getPosts()
    {
        return $this->posts;
    }
}
