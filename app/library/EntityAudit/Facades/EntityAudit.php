<?php namespace EntityAudit\Facades;

use Illuminate\Support\Facades\Facade;

class EntityAudit extends Facade {

    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor() { return 'entityaudit'; }

}