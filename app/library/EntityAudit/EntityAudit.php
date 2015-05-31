<?php namespace EntityAudit;

use SimpleThings\EntityAudit\AuditConfiguration;
use SimpleThings\EntityAudit\AuditManager;

/**
 * Class EntityAudit
 * @package EntityAudit
 */
class EntityAudit
{
    /**
     * @var array
     */
    private $auditedEntityClasses = array(
        "Attachment",
        "BlockContact",
        "BlockContactInfo",
        "BlockOffice",
        "BlockRelatedGroup",
        "BlockReorganization",
		"BlockBankruptcy",
		"BlockNotes",
		"BlockFunctionary",
        "BlockElectronicObligations",
        "BlockElectronicResource",
        "BlockElectronicMarket",
        "BlockElectronicService",
        "BlockElectronicServiceNetwork",
        "BlockElectricityRegister",
        "BlockElectricityObject",
        "BlockElectricityTransmission",
        "BlockWasteRegister",
        "BlockWastePolygon",
        "BlockTurnover",
        "BlockWaterReport",
        "BlockWaterReportNet",
        "BlockWaterReportSewerageNet",
        "Classifier",
        "ClientBlock",
        "ClientFile",
        "Client",
        "ClientIndustry",
        "ClientRegister",
        "Communication",
        "Entitlement",
        "Forms",
        "FormsField",
        "FormsPost",
        "FormsPostValue",
        "FormsTemplate",
        "Group",
        "Message",
        "Role",
        "User",
		"AplDocRepository",
		"AplRegistryData",
		"Report",
		"ReportAttachment",
		"ReportParameters",
		"BlockTurnoverStatus",
    );

    /**
     * @var array
     */
    private $globalIgnoreColumns = array(
        'created_at',
        'updated_at',
        'last_login'
    );

    /**
     * @return array
     */
    public function getAuditedEntityClasses()
    {
        return $this->auditedEntityClasses;
    }

    /**
     * @return array
     */
    public function getGlobalIgnoreColumns()
    {
        return $this->globalIgnoreColumns;
    }

    /**
     * @param $em
     * @return \SimpleThings\EntityAudit\AuditReader
     */
    public function getReader($em)
    {
        $config = new AuditConfiguration();
        $config->setAuditedEntityClasses($this->auditedEntityClasses);
        $config->setGlobalIgnoreColumns($this->globalIgnoreColumns);
        $auditManager = new AuditManager($config);
        return $auditManager->createAuditReader($em);
    }
}
