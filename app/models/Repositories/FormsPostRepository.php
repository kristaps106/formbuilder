<?php

namespace Repositories;

use Doctrine\ORM\EntityRepository;

/**
 * Class FormsPostRepository
 * @package Repositories
 *
 * Statuses:
 * ---------
 * Melnraksts - draft
 * Iesniegts - submitted
 * Iesniegts atkārtoti - re-submitted
 * Apstiprināts - confirmed
 * Noraidīts - rejected
 *
 */
class FormsPostRepository extends EntityRepository {

    /**
     * @param $form
     * @param $inputs
     * @param bool $client_id
     * @return bool|\FormsPost
     */
    public function storeFormPost($form, $inputs) {
        try {
            $form_post = new \FormsPost;
            $form_post->setStatus($inputs['action']);
            $form_post->setCreatedAt(new \DateTime('now'));
            $form_post->setModifiedAt(new \DateTime('now'));
            $form_post->setForm($form);
            $this->_em->persist($form_post);
            $this->_em->flush();
            foreach ($inputs as $key => $value) {
                if (!is_numeric($key)) {
                    continue;
                }
                $form_field = $this->_em->getRepository('FormsField')->find($key);
                if (sizeof($form_field) > 0) {
                    $form_post_value = new \FormsPostValue;
                    $form_post_value->setPost($form_post);
                    $form_post_value->setField($form_field);
                    if (is_array($value)) {
                        $value = json_encode($value);
                    }
                    $form_post_value->setValue($value);
                    $form_post_value->setModifiedAt(new \DateTime('now'));
                    $this->_em->persist($form_post_value);
                }
            }
            $this->_em->flush();
        } catch (Exception $e) {
            return false;
        }
        return $form_post;
    }

    /**
     * @param $id
     * @return array
     */
    public function getFormPostWithFieldsAndData($id) {
        $fields = $this->_em->createQueryBuilder()
                ->from('FormsPost', 'fp')
                ->select('ff.id, ff.field_id AS identity, ff.field_type, ff.field_name AS label, ff.field_formula AS formula, ff.field_options, ff.field_format AS format, ff.field_validation_level AS validation_level, fpv.value')
                ->join('fp.form', 'f')
                ->join('f.fields', 'ff')
                ->leftJoin('ff.values', 'fpv', 'WITH', 'fpv.post = :id')
                ->where('fp.id = :id')
                ->setParameters(array(
                    'id' => $id
                ))
                ->getQuery()
                ->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
        foreach ($fields as $key => $field) {
            $fields[$key]['field_options'] = json_decode($field['field_options']);
        }
        return $fields;
    }

    /**
     * @param $id
     * @return mixed
     */
    public function getFormPostWithFields($id) {
        return $this->_em->createQueryBuilder()
                        ->from('FormsPost', 'fp')
                        ->select('ff.id  AS identity, ff.field_id, ff.field_name AS label, ff.field_validation_level AS validation_level, ff.field_validation_message AS validation_message, ff.field_options')
                        ->join('fp.form', 'f')
                        ->join('f.fields', 'ff')
                        ->where('fp.id = :id')
                        ->setParameters(array(
                            'id' => $id
                        ))
                        ->getQuery()
                        ->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
    }

    /**
     * @param $id
     * @param $inputs
     * @return null|object
     */
    public function saveFormPostWithFieldsValues($id, $inputs) {
        $form_post = $this->_em->getRepository('FormsPost')->find($id);
        if (empty($inputs['action'])) {
            $inputs['action'] = 'draft';
        }
        $form_post->setStatus($inputs['action']);
        $this->_em->persist($form_post);
        $this->_em->flush();

        $saved_form_post_values = array();
        $forms_post_values = $this->_em->getRepository('FormsPostValue')->findBy(array('post' => $form_post));
        foreach ($forms_post_values as $forms_post_value) {
            if (!isset($inputs[$forms_post_value->getField()->getId()])) {
                $inputs[$forms_post_value->getField()->getId()] = '';
            }
            $value = $inputs[$forms_post_value->getField()->getId()];
            if (is_array($value)) {
                $value = json_encode($value);
            }
            $forms_post_value->setValue($value);
            $this->_em->persist($forms_post_value);
            $saved_form_post_values[] = $forms_post_value->getField()->getId();
        }
        $this->_em->flush();

        // Removes saved field from the post values
        $unsaved_form_post_values = array_except($inputs, $saved_form_post_values);

        // Create not existed post fields of form
        foreach ($unsaved_form_post_values as $key => $value) {
            if (!is_numeric($key)) {
                continue;
            }
            $form_field = $this->_em->getRepository('FormsField')->find($key);
            if (sizeof($form_field) > 0) {
                $form_post_value = new \FormsPostValue;
                $form_post_value->setField($form_field);
                $form_post_value->setPost($form_post);
                if (is_array($value)) {
                    $value = json_encode($value);
                }
                $form_post_value->setValue($value);
                $this->_em->persist($form_post_value);
            }
        }
        $this->_em->flush();
        return $form_post;
    }

    /**
     * @param $id
     * @param $inputs
     * @return null|object
     */
    public function updateFormPostFieldsValues($id, $inputs) {
        $form_post = $this->_em->getRepository('FormsPost')->find($id);
        if (!$form_post) {
            return false;
        }
        if (isset($inputs['is_period_value'])) {
            $period = $this->_em->getRepository('Period')->find($inputs['value']);
            $form_post->setPeriod($period);
        }
        $fieldValue = $this->_em->getRepository('FormsPostValue')->findOneBy(array('post' => $form_post, 'field' => $inputs['form_field']));
        //IF fieldValue doesnt exists, create.
        if (!is_object($fieldValue)) {
            $form_field = $this->_em->getRepository('FormsField')->find($inputs['form_field']);
            if (sizeof($form_field) > 0) {
                $form_post_value = new \FormsPostValue;
                $form_post_value->setPost($form_post);
                $form_post_value->setField($form_field);
                $form_post_value->setUser(\Auth::user());
                $form_post_value->setModifiedAt(new \DateTime('now'));
                $this->_em->persist($form_post_value);
                $this->_em->flush();
            }
            $fieldValue = $this->_em->getRepository('FormsPostValue')->findOneBy(array('post' => $form_post, 'field' => $inputs['form_field']));
        }
        // Set model values if values is changed
        if (isset($inputs['status']) && $inputs['status'] == 'changed' && isset($inputs['substantiation'])) {
            if (is_array($inputs['value'])) {
                $value = json_encode($inputs['value']);
                $fieldValue->setValue($value);
            } else {
                $fieldValue->setValue($inputs['value']);
            }
            $fieldValue->setSubstantiation($inputs['substantiation']);
        }
        // Set rejected values if is rejected
        if (isset($inputs['status']) && $inputs['status'] == 'rejected' && isset($inputs['reason'])) {
            $reason = $this->_em->getRepository('Classifier')->findOneById($inputs['reason']);
            $fieldValue->setReason($reason);
        }
        $fieldValue->setStatus($inputs['status']);
        $fieldValue->setUser(\Auth::user());
        $fieldValue->setModifiedAt(new \DateTime('now'));
        $this->_em->persist($fieldValue);
        $this->_em->flush();
        return true;
    }

    /**
     * @param $id
     * @return mixed
     */
    public function getFormPostById($id) {
        return $this->_em->createQueryBuilder()
                        ->from('FormsPost', 'f')
                        ->select('f.id, f.status')
                        ->where('f.id = :id')
                        ->setParameter('id', $id)
                        ->getQuery()
                        ->getSingleResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
    }

    /**
     * @param $id
     * @return bool
     */
    public function deleteFormPostAndValues($id) {
        try {
            $this->_em->createQueryBuilder()
                    ->delete('FormsPostValue', 'fpv')
                    ->where('fpv.post = :post_id')
                    ->setParameter('post_id', $id)
                    ->getQuery()
                    ->execute();
            $this->_em->createQueryBuilder()
                    ->delete('FormsPost', 'fp')
                    ->where('fp.id = :id')
                    ->setParameter('id', $id)
                    ->getQuery()
                    ->execute();
        } catch (Exception $e) {
            return false;
        }
        return true;
    }

}
