<?php namespace Esynergy;

use Illuminate\Auth\UserInterface;
use Illuminate\Auth\UserProviderInterface;
use Illuminate\Hashing\HasherInterface;

class DoctrineAuthProvider implements UserProviderInterface
{
    /**
     * The hasher implementation.
     *
     * @var \Illuminate\Hashing\HasherInterface
     */
    protected $hasher;

    /**
     * The repository (table) containing the users.
     *
     * @var \Doctrine\ORM\EntityRepository
     */
    protected $d2repository;

    /**
     * @var string
     */
    private $model;

    /**
     * Create a new database user provider.
     *
     * @param  \Doctrine\ORM\EntityRepository       $d2repository The Doctrine2 repository (table) containing the users.
     * @param  \Illuminate\Hashing\HasherInterface  $hasher The hasher implementation
     * @return void
     */
    public function __construct($d2repository, HasherInterface $hasher, $model)
    {
        $this->d2repository = $d2repository;
        $this->hasher       = $hasher;
        $this->model        = $model;
    }

    /**
     * Retrieve a user by their unique identifier.
     *
     * @param  mixed  $identifier
     * @return \Illuminate\Auth\UserInterface|null
     */
    public function retrieveById($identifier)
    {
        return $this->getRepository()->find($identifier);
    }

    /**
     * Retrieve a user by the given credentials.
     *
     * @param  array  $credentials
     * @return \Illuminate\Auth\UserInterface|null
     */
    public function retrieveByCredentials(array $credentials)
    {
        $criteria = [];
        foreach ($credentials as $key => $value) {
            if ( ! str_contains($key, 'password')) {
                $criteria[$key] = $value;
            }
        }
        $criteria['active'] = 1;
        return $this->getRepository()->findOneBy($criteria);
    }

    /**
     * Validate a user against the given credentials.
     *
     * @param  \Illuminate\Auth\UserInterface  $user
     * @param  array  $credentials
     * @return bool
     */
    public function validateCredentials(UserInterface $user, array $credentials)
    {
        return $this->hasher->check($credentials['password'], $user->getAuthPassword());
    }

    /**
     * Retrieve a user by by their unique identifier and "remember me" token.
     *
     * @param  mixed $identifier
     * @param  string $token
     * @return \Illuminate\Auth\UserInterface|null
     */
    public function retrieveByToken($identifier, $token)
    {
        $entity = $this->getEntity();
        return $this->getRepository()->findOneBy([
            $entity->getKeyName() => $identifier,
            $entity->getRememberTokenName() => $token
        ]);
    }

    /**
     * Update the "remember me" token for the given user in storage.
     *
     * @param  \Illuminate\Auth\UserInterface $user
     * @param  string $token
     * @return void
     */
    public function updateRememberToken(UserInterface $user, $token)
    {
        $user->setRememberToken($token);
        $this->d2repository->persist($user);
        $this->d2repository->flush();
    }

    /**
     * Returns repository for the entity.
     *
     * @return \Doctrine\ORM\EntityRepository
     */
    private function getRepository()
    {
        return $this->d2repository->getRepository($this->model);
    }

    /**
     * Returns instantiated entity.
     *
     * @return mixed
     */
    private function getEntity()
    {
        return new $this->model;
    }

    public static function checkRolePermission(UserInterface $user, $resource)
    {
		if ($user->getSuperUser() == 1) {
            return true;
        }
        // Tmp solution to provide merchant with administration right access to acl...
        if ($resource == 'allowAcl' && $user->isMerchantAdmin()) {
            return true;
        }
        $permitted = false;
        foreach($user->getRoles() as $role) {
            // Check by dynamic getter
            if ($role->__get($resource)) {
                $permitted = true;
                break;
            }
        }
        foreach($user->getGroups() as $group) {
            if ($permitted === true) {
                break;
            }
            foreach ($group->getRoles() as $role) {
                // Check by dynamic getter
                if ($role->__get($resource)) {
                    $permitted = true;
                    break;
                }
            }
        }
        return $permitted;
    }
}
