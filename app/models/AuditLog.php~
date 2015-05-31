<?php

use Doctrine\ORM\Mapping as ORM;

/**
 * AuditLog
 *
 * @ORM\Table(name="audit_log", options={"comment":"Auditu ierakstu tabula"})
 * @ORM\Entity
 */
class AuditLog
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer", nullable=false, options={"comment":"Auditu ierakstu tabulas primārā atslēga"})
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="event", type="string", nullable=false, options={"comment":"Notikuma nosaukums"})
     */
    private $event;

    /**
     * @var string
     *
     * @ORM\Column(name="info", type="text", nullable=true, options={"comment":"Notikuma apraksts"})
     */
    private $info;


    /**
     * @var string
     *
     * @ORM\Column(name="ip", type="string", nullable=false, options={"comment":"Lietotāja IP adrese"})
     */
    private $ip;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="created_at", type="datetime", nullable=false, options={"comment":"Ieraksta pievienošanas datums"})
     */
    private $created_at;


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
     * Set event
     *
     * @param string $event
     * @return AuditLog
     */
    public function setEvent($event)
    {
        $this->event = $event;

        return $this;
    }

    /**
     * Get event
     *
     * @return string 
     */
    public function getEvent()
    {
        return $this->event;
    }

    /**
     * Set info
     *
     * @param string $info
     * @return AuditLog
     */
    public function setInfo($info)
    {
        $this->info = $info;

        return $this;
    }

    /**
     * Get info
     *
     * @return string 
     */
    public function getInfo()
    {
        return $this->info;
    }

    /**
     * Set ip
     *
     * @param string $ip
     * @return AuditLog
     */
    public function setIp($ip)
    {
        $this->ip = $ip;

        return $this;
    }

    /**
     * Get ip
     *
     * @return string 
     */
    public function getIp()
    {
        return $this->ip;
    }

    /**
     * Set created_at
     *
     * @param \DateTime $createdAt
     * @return AuditLog
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
}
