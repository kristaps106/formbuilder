<?php

class FormTemplateController extends \BaseController {

    /**
     * Display a listing of the resource.
     * GET /form
     *
     * @return Response
     */
    public function index()
    {
        $per_page = Input::get('per_page');
        if (Request::ajax()) {

            if (!$per_page){
                $per_page = 10;
            }
            $page = Input::get('page', 1);
            $from = max(0, $page - 1) * $per_page;

            $qb = Doctrine::createQueryBuilder()
                ->from('FormsTemplate', 'f')
                ->select('f.id, f.name, f.created_at, f.status, f.version, f.modified_at');

            if (Input::get('status', false) && Input::get('status') != 'all') {
                $qb->where('f.status = :status')->setParameter('status', Input::get('status'));
            }
            if (Input::get('search', false)) {
                $orx = $qb->expr()->orX();
                $orx->add($qb->expr()->like("f.name", '\'%' . Input::get('search') . '%\''));
                $qb->andWhere($orx);
            }

            // Clone query for count total result before order to do group...
            $counter = clone $qb;
            $total = $counter->select('COUNT(f.id)')
                ->getQuery()
                ->getSingleScalarResult();

            if (Input::get('order_by', true)) {
                $qb->orderBy(Input::get('order_by', 'f.created_at'), Input::get('order_dir', 'desc'));
                // Set version number as second order parameter on name order
                if (Input::get('order_by') == 'f.name') {
                    $qb->addOrderBy('f.version', Input::get('order_dir', 'desc'));
                }
            }

            $forms = $qb->getQuery()
                ->setFirstResult($from)
                ->setMaxResults($per_page)
                ->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);

            $params = array(
                'page' => $page,
                'last_page' => ceil($total / $per_page),
                'total' => $total
            );
            return Response::json(array('items' => $forms, 'params' => $params));
        }
        return View::make('form_template/index');
    }

    /**
     * Show the form for creating a new resource.
     * GET /form-template/create
     *
     * @return Response
     */
    public function create()
    {
        return View::make('form_template/create')->with('action_route', 'FormTemplateController@store');
    }

    /**
     * Store a newly created resource in storage.
     * POST /form
     *z
     * @return Response
     */
    public function store()
    {
        if (Request::isMethod('post')) {
            $inputs = array(
                'name' => 'required',
            );
            $validator = Validator::make(Input::all(), $inputs);
            if ($validator->fails()) {
                return Response::json([
                    "errors" => true,
                    "messages" => $validator->messages()->toArray()
                ]);
            } else {
                $form_template = new FormsTemplate;
                $form_template->setName(Input::get('name', ''));
                $form_template->setContent(Input::get('content', ''));
                $form_template->setStatus(Input::get('status', 'draft'));
                $form_template->setVersion('1');
                $form_template->setCreatedAt(new \DateTime("now"));
                $form_template->setModifiedAt(new \DateTime("now"));
                Doctrine::persist($form_template);
                Doctrine::flush();
                //Set parent_id as self for original entry.
                $parent_id = $form_template->getId();
                $form_template->setParentId($parent_id);
                Doctrine::persist($form_template);
                Doctrine::flush();
                $to_url = URL::action('FormTemplateController@edit', array('labot' => $form_template->getId()));
                Session::flash('message', 'Veidlapa veiksmīgi izveidota');
                return Response::json([
                    "errors" => false,
                    "toUrl" => $to_url
                ]);
            }
        }
    }

    /**
     * Display the specified resource.
     * GET /form-template/{id}
     *
     * @param  int  $id
     * @return Response
     */
    public function show($id, $print = false)
    {
        $form_template = Doctrine::getRepository('FormsTemplate')->findOneById($id);
        $fields = json_decode($form_template->getContent());
        $backUrl = "FormTemplateController";
        if (sizeof($fields) > 0) {
            $fields = $fields->fields;
        }
        return View::make('form_template/view')->with(
            array(
                'print_route' => URL::action('FormTemplateController@printout', array('id' => $id)),
                'index_route' => 'FormTemplateController@index',
                'form'   => $form_template,
                'fields' => $fields,
                'formStatus' => Input::get('status'),
                'home_controller' => $backUrl
            )
        );
    }

    /**
     * Print template preview
     *
     * @param $id
     * @return Response
     */
    public function printout($id)
    {
        return $this->show($id, Input::get('f', 'html'));
    }

    /**
     * Show the form for editing the specified resource.
     * GET /form-template/{id}/edit
     *
     * @param  int  $id
     * @return Response
     */
    public function edit($id)
    {
        $form = Doctrine::getRepository('FormsTemplate')->findOneById($id);
        // Allow edit only with stats "draft"!
        if ($form->getStatus() != 'draft') {
            return Redirect::intended('/');
        }
        $json = json_decode($form->getContent());
        if (sizeof($json) > 0) {
            $json = $json->fields;
        }
        return View::make('form_template/create')->with(
            array(
                'form'          => $form,
                'fields'        => $json,
                'action_route'  => array('FormTemplateController@update', $id)
            )
        );
    }

    /**
     * Update the specified resource in storage.
     * PUT /form-template/{id}
     *
     * @param  int  $id
     * @return Response
     */
    public function update($id)
    {
        if (Request::ajax()) {
            if (Input::get('other_approved')) {
                $form_template = Doctrine::getRepository('FormsTemplate')->findOneById($id);
                $qb = Doctrine::createQueryBuilder()
                    ->from('FormsTemplate', 'f')
                    ->select('count(f.id)')
                    ->where('f.parent_id = :parent_id')
                    ->setParameter('parent_id', $form_template->getParentId())
                    ->andWhere('f.status = :status')
                    ->setParameter('status', 'approved');
                $query = $qb->getQuery();
                $result = $query->getSingleScalarResult();
                if($result > 0) {
                    return Response::json(true);
                }else {
                    return Response::json(false);
                }
            }
        }
        if (Request::isMethod('post')) {
            $inputs = array(
                'name' => 'required'
            );
        }
        $validator = Validator::make(Input::all(), $inputs);
        if ($validator->fails()) {
            return Response::json([
                "errors" => true,
                "messages" => $validator->messages()->toArray()
            ]);
        } else {
            $form_template = Doctrine::getRepository('FormsTemplate')->findOneById($id);
            $form_template->setName(Input::get('name', ''));
            $form_template->setContent(iconv('UTF-8', 'UTF-8',Input::get('content', $form_template->getContent())));
            $form_template->setStatus(Input::get('status', 'draft'));
            $form_template->setModifiedAt(new \DateTime("now"));
            Doctrine::persist($form_template);
            Doctrine::flush();
            $response = array('errors' => false);
            if (Input::get('status', 'draft') == 'draft') {
                $response['alertMessage'] = 'Veidlapa veiksmīgi izmainīta';
            } else {
                $qb = Doctrine::createQueryBuilder()
                    ->from('FormsTemplate', 'f')
                    ->select('f.id')
                    ->where('f.parent_id = :parent_id')
                    ->setParameter('parent_id', $form_template->getParentId())
                    ->andWhere('f.id != :id')
                    ->setParameter('id', $form_template->getId());
                $query = $qb->getQuery();
                $rows = $query->getScalarResult();
                $rows = array_map('current', $rows);
                $ffs = Doctrine::getRepository('FormsTemplate')->findById($rows);
                foreach ($ffs as $ff) {
                    $ff->setStatus('draft');
                    Doctrine::persist($ff);
                    Doctrine::flush();
                }
                
                $content = json_decode($form_template->getContent());
                $fields = $content->fields;
                foreach ($fields as $field) {
                    if (!isset($field->field_type)) {
                        continue;
                    }
                    $form_field = new FormsField;
                    $form_field->setForm($form_template);
                    $form_field->setFieldId((isset($field->identity)) ? $field->identity : null);
                    $form_field->setFieldType((isset($field->field_type)) ? $field->field_type : null);
                    $form_field->setFieldName((isset($field->label)) ? $field->label : null);
                    $form_field->setFieldFormula((isset($field->formula)) ? $field->formula : null);
                    $form_field->setFieldFormat((isset($field->format)) ? $field->format : null);
                    $form_field->setFieldOptions((isset($field->field_options)) ? json_encode($field->field_options) : null);
                    $form_field->setFieldValidationLevel((isset($field->validation_level)) ? $field->validation_level : null);
                    $form_field->setFieldValidationMessage((isset($field->validation_message)) ? $field->validation_message : null);
                    $form_field->setSaveTo((isset($field->save_to)) ? $field->save_to : null);
                    Doctrine::persist($form_field);
                }
                Doctrine::flush();
                
                $response['toUrl'] = URL::action('FormTemplateController@index');
                Session::flash('message', 'Sagatave apstiprināta kā tīrraksts');
            }
            return Response::json($response);
        }
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /form-template/{id}
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy($id)
    {
        $form_template = Doctrine::getRepository('FormsTemplate')->findOneById($id);
        if (Input::get('verify', false)) {
            if (empty($form_template)) {
                return Response::json(array('error' => true, 'message' => 'Veidlapas sagatave neeksistē!'));
            }
            return Response::json(array('error' => false));
        }
        if (sizeof($form_template) > 0) {
            Doctrine::remove($form_template);
            Doctrine::flush();
            return Response::json(array('error' => false));
        }
    }

    /**
     * Clone the form.
     * DELETE /cloneItem/{id}
     *
     * @param  int  $id
     * @return Response
     */
    public function cloneItem($id)
    {
        $form = Doctrine::getRepository('FormsTemplate')->find($id);
        $new_form = clone $form;
        $new_form->setStatus('draft');
        $new_form->setCreatedAt(new \DateTime("now"));
        $new_form->setModifiedAt(new \DateTime("now"));
        //Get final version value for this form instance
        $qb = Doctrine::createQueryBuilder()
            ->from('FormsTemplate', 'f')
            ->select('max(f.version)')
            ->where('f.parent_id = :parent_id')->setParameter('parent_id', $new_form->getParentId());
        $query = $qb->getQuery();
        $result = $query->getSingleScalarResult();
        $new_form->setVersion($result + 1);
        Doctrine::persist($new_form);
        Doctrine::flush();
        return Response::json(array('toUrl' => URL::action('FormTemplateController@edit', array('labot' => $new_form->getId()))));
    }

    /**
     * Validate the form.
     * POST /validate/{id}
     *
     * @return Response
     */
    public function validate($id)
    {
        $template = Doctrine::getRepository('FormsTemplate')->find($id);
        $content = json_decode($template->getContent());
        if (empty($content->fields)) {
            return Response::json([
                "errors" => true,
                "message" => 'None field...'
            ]);
        }
        $validation = Helpers::validateDynamicForm($content->fields, true);
        if (isset($validation['errors']) && $validation['errors'] === false && isset($validation['notices']) && $validation['notices'] === false) {
            Session::flash('message', 'Veiksmīgi saglabāts');
        }
        return Response::json($validation);
    }

}