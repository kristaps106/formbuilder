<?php

namespace Repositories;

use Doctrine\ORM\EntityRepository;

class FormsFieldRepository extends EntityRepository {

    /**
     * @param $id
     * @param null $select
     * @return array
     */
    public function getFormFields($id, $select = null) {
        if ($select === null) {
            $select = 'ff.id, ff.field_id AS identity, ff.field_type, ff.field_name AS label, ff.field_formula AS formula, ff.field_options, ff.field_format AS format, ff.field_validation_level AS validation_level';
        }
        return $this->_em->createQueryBuilder()
                        ->from('FormsField', 'ff')
                        ->select($select)
                        ->join('ff.form', 'f')
                        ->where('f.id = :id')
                        ->setParameters(array(
                            'id' => $id
                        ))
                        ->getQuery()
                        ->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
    }

    /**
     * 
     * @param type $field_id
     * @param type $form_id
     * @return type
     */
    public function getFormFieldsByForm($field_id, $form_id) {
        return $forms_field = $this->_em->createQueryBuilder()
                ->from('FormsField', 'ff')
                ->select('ff.id')
                ->join('ff.form', 'f')
                ->where('ff.field_id = :field_id')
                ->andWhere('f.id = :form_id')
                ->setParameters(
                        array(
                            'field_id' => $field_id,
                            'form_id' => $form_id
                        )
                )
                ->getQuery()
                ->getOneOrNullResult();
    }

}
