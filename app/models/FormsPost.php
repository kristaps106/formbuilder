<?php

use Doctrine\ORM\Mapping as ORM;

/**
 * Forms
 *
 * @ORM\Table(name="forms_post", options={"comment":"Dokumentu tabula"})
 * @ORM\Entity(repositoryClass="Repositories\FormsPostRepository")
 */
class FormsPost
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer", nullable=false, options={"comment":"Dokumentu tabulas primārā atslēga"})
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="status", type="string", nullable=false, options={"comment":"Dokumenta statuss"})
     */
    private $status;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="created_at", type="datetime", nullable=false, options={"comment":"Ieraksta pievienošanas datums"})
     */
    private $created_at;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="modified_at", type="datetime", nullable=false, options={"comment":"Ieraksta rediģēšanas datums"})
     */
    private $modified_at;


    /**
     * @ORM\ManyToOne(targetEntity="FormsTemplate", inversedBy="posts", fetch="EAGER")
     */
    private $form;

    /**
     * @ORM\OneToMany(targetEntity="FormsPostValue", mappedBy="post")
     */
    private $values;
    
    /**
     * @var string
     *
     * @ORM\Column(name="rejection_reason", type="string", length=256, nullable=true, options={"comment":"Dokumenta noraidīšanas iemesls"})
     */
    private $rejection_reason;

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
     * Set status
     *
     * @param string $status
     * @return FormsPost
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
     * @return FormsPost
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
     * Set modified_at
     *
     * @param \DateTime $modifiedAt
     * @return FormsPost
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
     * Set form
     *
     * @param \FormsTemplate $form
     * @return FormsPost
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
     * @return FormsPost
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

    /**
     * Set rejection_reason
     *
     * @param string $rejectionReason
     * @return FormsPost
     */
    public function setRejectionReason($rejectionReason)
    {
        $this->rejection_reason = $rejectionReason;

        return $this;
    }

    /**
     * Get rejection_reason
     *
     * @return string 
     */
    public function getRejectionReason()
    {
        return $this->rejection_reason;
    }
}
