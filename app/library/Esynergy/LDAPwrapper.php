<?php

namespace Esynergy;
use ADX\Core;
use ADX\Core\Task;
use ADX\Core\Link;
use ADX\Enums;
use ADX\Core\ServerUnreachableException;

/**
 * Class LDAPwrapper
 *
 * @package Esynergy
 *
 * Wrapper for LDAP related methods. uses ADX package
 */
class LDAPwrapper
{
	public      $connected = FALSE;
	public      $user = NULL;

	protected   $domain;

	protected   $connection;

	public function     __construct( $domain, $login, $password )
	{
		try
		{
			$this->login = $login;
			$this->connection = new Link( $domain );
			$this->connected = $this->connection->bind( "{$login}@{$domain}", $password );
			$this->domain = 'DC='. implode( ',DC=', explode( '.', $domain ) );
			$this->user = $this->getUserData( $login, $password );
			return $this->connection;
		} catch ( ServerUnreachableException $x ) { } catch ( \Exception $x ) { }
		return NULL;
	}

    /**
     * Get Organizational Units
     *
     * @return array|null
     */
    public function getOrganizationalUnits() {
        try {
            $task = new Task( Enums\Operation::OpSearch, $this->connection );
            $task ->filter( '(&(objectClass=user)(objectCategory=person)(samAccountName='.$this->escape( $this->login ).'))' )->base( $this->domain );
            $data = $task->run()->first();
            $data = ldap_explode_dn($data->dn, 0);
            $ou = array_filter($data, function($value){
                if (strstr($value, 'OU') === false) {
                    return false;
                }
                return true;
            });
            $ou = implode(',', $ou);
            return ldap_explode_dn($ou, 1);
        } catch (Exception $ouch) {
            //echo $ouch->getMessage();
            return NULL;
        }
    }

    /**
     * request user data
     *
     * @param string $login
     * @param string $password
     * @return array|null
     */
    public function     getUserData( $login, $password )
	{
		try {
			$task = new Task( Enums\Operation::OpSearch, $this->connection );
			$task ->filter( '(&(objectClass=user)(objectCategory=person)(samAccountName='.$this->escape( $this->login ).'))' )
			      ->base( $this->domain );
			$data = $task->run();
		} catch ( \Exception $ouch ) {
			//echo $ouch->getMessage();
			return NULL;
		}
		$data = $data->first();
		$user = [
			// Active Directory user name. used by email sending/reading models/classes
			'adusername' => $login,
			'username'  => $login,
			// TODO: get all user email 'from' not just first entry
			'email'     => [ strtolower( $data->mail->value(0) ) ],
			'password'  => \Hash::make( $password ),
			'first_name'=> (string)$data->givenname->value(0),
			'last_name' => (string)$data->sn->value(0),
			'confirmed' => 0,
			'active'    => 1
		];
		return $user;
	}

	/*
	 * search contacts with email or by part of email
	 *
	 * @param string $filter
	 * @param array $attributes
	 * @result array
	 */
	public function     getContacts( $filter = '', $attributes = ['cn', 'givenname', 'dn', 'sn', 'mail', 'samAccountName'] )
	{
		if ( $filter )
		{
			$filter = $this->escape( $filter );
		}
		$task = new Task( Enums\Operation::OpSearch, $this->connection );
		$task ->attributes( $attributes )
			  ->filter( '(&(objectClass=user)(objectCategory=person)(mail='.$filter.'*))' )
			  ->base( $this->domain );
		$data = $task->run();
		$results = [];
		$mask = array_fill_keys( $attributes, '' );
		foreach( $data as $row )
		{
			// ugly way to convert into array
			$row = array_intersect_key( json_decode( json_encode( $row ), TRUE ), $mask );
			$results[] = $row;
		}
		return $results;
	}


	static public function     setSessionData( $data )
	{
		\Session::set( 'LDAP', is_array( $data ) ? $data : [ $data ] );
	}

	static public function     delSessionData()
	{
		\Session::remove( 'LDAP' );
	}

	static public function     getSessionData( $key = NULL )
	{
		$key = $key ? ".{$key}" : '';
		return \Session::get( "LDAP{$key}", NULL );
	}

	static public function      isSessionActive()
	{
		return  self::getSessionData('adusername') && self::getSessionData('password');
	}

    /**
     * used to escape filter strings
     *
     * @link http://pierrerambaud.com/blog/php/2013-08-05-escaping-special-chars-within-ldap
     * @param string $string
     * @param null $dn
     * @return string
     */
    public function     escape($string, $dn = null)
	{
		$escapeDn = array('\\', '*', '(', ')', "\x00");
		$escape   = array('\\', ',', '=', '+', '<', '>', ';', '"', '#');

		$search = array();
		if ($dn === null) {
			$search = array_merge($search, $escapeDn, $escape);
		} elseif ($dn === false) {
			$search = array_merge($search, $escape);
		} else {
			$search = array_merge($search, $escapeDn);
		}

		$replace = array();
		foreach ($search as $char) {
			$replace[] = sprintf('\\%02x', ord($char));
		}

		return str_replace($search, $replace, $string);
	}
}