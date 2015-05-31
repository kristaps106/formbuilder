<?php

class AuditLogHandler
{
    public function onAuditLog($info)
    {
        $log = new AuditLog;
        $log->setUser(Auth::user());
        $log->setEvent(Event::firing());
        $log->setInfo($info);
        $log->setIp(Request::getClientIp());
        $log->setCreatedAt(new \DateTime('now'));
        Doctrine::persist($log);
        Doctrine::flush();
    }

    public function subscribe($events)
    {
        $events->listen('audit.*', 'AuditLogHandler@onAuditLog');
    }
} 