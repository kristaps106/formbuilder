<?php

namespace Repositories;

use Doctrine\ORM\EntityRepository;

class FormsRepository extends EntityRepository {

    /**
     * @param $id
     * @return mixed
     * @throws \Doctrine\ORM\NoResultException
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getFormTemplate($id) {
        return $this->_em->createQueryBuilder()
                        ->from('FormsTemplate', 'f')
                        ->select('f.name')
                        ->where('f.id = :id')
                        ->setParameters(array(
                            'id' => $id
                        ))
                        ->getQuery()
                        ->getSingleResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
    }

}
