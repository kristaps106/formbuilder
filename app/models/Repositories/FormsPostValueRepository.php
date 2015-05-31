<?php

namespace Repositories;

use Doctrine\ORM\EntityRepository;

/**
 * Class FormsPostValueRepository
 * @package Repositories
 */
class FormsPostValueRepository extends EntityRepository {

    /**
     * 
     * @param type $form_post_id
     * @param type $forms_field_id
     * @return type
     */
    public function getFormsPostValueByFormsPostAndField($form_post_id, $forms_field_id) {
        return $form_post_value = $this->_em->createQueryBuilder()
                ->from('FormsPostValue', 'fpv')
                ->select('fpv.value')
                ->join('fpv.post', 'p')
                ->join('fpv.field', 'f')
                ->where('p.id = :post_id')
                ->andWhere('f.id = :field_id')
                ->setParameters(
                        array(
                            'post_id' => $form_post_id,
                            'field_id' => $forms_field_id
                        )
                )
                ->getQuery()
                ->getOneOrNullResult();
    }

}
