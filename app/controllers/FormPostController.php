<?php

class FormPostController extends \BaseController {

    /**
     * Display a listing of the resource.
     * GET /formpost
     *
     * @return Response
     */
    public function index() {
        $per_page = Input::get('per_page');
        $status = Input::get('status');
        if (Request::ajax()) {
            if (!$per_page) {
                $per_page = 10;
            }
            $page = Input::get('page', 1);
            $from = max(0, $page - 1) * $per_page;
            if (Input::get('docs')) {
                $results = Doctrine::createQueryBuilder()
                        ->from('FormsTemplate', 'f')
                        ->select('f.id, f.name as text')
                        ->getQuery()
                        ->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
                $docs = $results;
                return Response::json(array('results' => $docs));
            }
            $qb = Doctrine::createQueryBuilder()
                    ->from('Formspost', 'fp')
                    ->select('fp.id, f.name, fp.status, fp.created_at')
                    ->join('fp.form', 'f');

            if (Input::get('status', false) && Input::get('status') != 'all') {
                $qb->where('fp.status = :status')->setParameter('status', Input::get('status'));
            }
            if (Input::get('search', false)) {
                $orx = $qb->expr()->orX();
                $orx->add($qb->expr()->like("f.name", '\'%' . Input::get('search') . '%\''));
                $qb->andWhere($orx);
            }

            // Clone query for count total result before order to do group...
            $counter = clone $qb;
            $total = $counter->select('COUNT(fp.id)')
                    ->getQuery()
                    ->getSingleScalarResult();

            if (Input::get('order_by', true)) {
                $qb->orderBy(Input::get('order_by', 'fp.created_at'), Input::get('order_dir', 'desc'));
            }

            $forms_posts = $qb->getQuery()
                    ->setFirstResult($from)
                    ->setMaxResults($per_page)
                    ->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);

            $params = array(
                'page' => $page,
                'last_page' => ceil($total / $per_page),
                'total' => $total
            );
            return Response::json(array('items' => $forms_posts, 'params' => $params));
        }

        return View::make('document/index')->with(
                        array(
                            'route_title' => 'dokumenti',
                            'index_route' => 'FormPostController@index',
                            'create_route' => 'FormPostController@createDocument'
                        )
        );
    }

    /**
     * Show the form for creating a new resource.
     * GET /formpostregulator/create/{id}/{client_id}
     *
     * @return Response
     */
    public function create($id) {
        try {
            $form_template = Doctrine::createQueryBuilder()
                    ->from('FormsTemplate', 'f')
                    ->select('f.name')
                    ->where('f.id = :id')
                    ->setParameters(array(
                        'id' => $id
                    ))
                    ->getQuery()
                    ->getSingleResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
        } catch (\Doctrine\ORM\NoResultException $e) {
            return Response::view('error', array('message' => 'Viedlapas sagatave nav atrasta!'));
        }

        $fields = Doctrine::getRepository('FormsField')->getFormFields($id);

        // Convert field_options to json object
        foreach ($fields as $key => $field) {
            $fields[$key]['field_options'] = json_decode($field['field_options']);
        }

        // Convert field_options to json object
        $fields = Helpers::arrayToObject($fields);

        return View::make('document/form')->with(
                        array(
                            'action_route' => array('FormPostController@store', $id),
                            'index_route' => 'FormPostController@index',
                            'form' => $form_template,
                            'fields' => $fields
                        )
        );
    }

    public function createDocument() {
        if (Request::ajax() && Request::isMethod('post')) {
            $validator = Validator::make(
                            Input::all(), [
                        'document' => 'required'
                            ]
            );
            if (Input::get('document')) {
                $form = Doctrine::getRepository('FormsTemplate')->find(Input::get('document'));
                if (sizeof($form) == 0) {
                    return Response::view('error', array('message' => 'Veidlapa neeksistē!'));
                }
            }
            if ($validator->fails()) {
                if (isset($error)) {
                    $messege = $validator->messages()->toArray();
                    $error_messages = array_merge($messege, $error);
                } else {
                    $error_messages = $validator->messages()->toArray();
                }
                return Response::json([
                            'errors' => true,
                            'messages' => $error_messages
                ]);
            } else if (isset($error)) {
                return Response::json([
                            'errors' => true,
                            'messages' => $error
                ]);
            } else {
                $doc_id = Input::get('document');

                return Response::json([
                            "errors" => false,
                            "toUrl" => URL::action('FormPostController@create', array('id' => $doc_id))
                ]);
            }
        }
    }

    /**
     * Store a newly created resource in storage.
     * POST /formpostregulator
     *
     * @return Response
     */
    public function store($id) {
        $select_fields = 'ff.id AS identity, ff.field_id, ff.field_name AS label, ff.field_validation_level AS validation_level, ff.field_validation_message AS validation_message, ff.field_options';

        $fields = Doctrine::createQueryBuilder()
                ->from('FormsField', 'ff')
                ->select($select_fields)
                ->join('ff.form', 'f')
                ->where('f.id = :id')
                ->setParameters(array(
                    'id' => $id
                ))
                ->getQuery()
                ->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);

        $fields = Helpers::arrayToObject($fields);
        $validation = Helpers::validateDynamicForm($fields);
        if (isset($validation['errors']) && $validation['errors'] === false && isset($validation['notices']) && $validation['notices'] === false) {
            $form = Doctrine::getRepository('FormsTemplate')->find($id);
            // When form parameter needApproval is false - document automatic approve without regulator checking inside function saveFormPostWithFieldsValues
            $form_post = Doctrine::getRepository('FormsPost')->storeFormPost($form, Input::all());
            if ($form_post) {
                if ($form_post->getStatus() == 'confirmed') {
                    $values = Doctrine::getRepository('FormsPostValue')->findBy(array('post' => $form_post));
                    Helpers::fieldSaveToResources($values, 5);
                }
                // Set message and redirect url to clear post variables
                Session::flash('message', 'Dokuments veiksmīgi saglabāts');
                if ($form_post->getStatus() == 'draft') {
                    $validation['toUrl'] = URL::action('FormPostController@edit', $form_post->getId());
                } else {
                    $validation['toUrl'] = URL::action('FormPostController@index');
                }
            } else {
                // Error
                $validation['alertMessage'] = 'Sistēmas kļūda!';
            }
        }
        return Response::json($validation);
    }

    /**
     * Display the specified resource.
     * GET /formpostregulator/{id}
     *
     * @param  int  $id
     * @return Response
     */
    public function show($id) {
        //
    }

    /**
     * Show the form for editing the specified resource.
     * GET /formpostregulator/{id}/edit
     *
     * @param  int  $id
     * @return Response
     */
    public function edit($id) {
        $form_post = Doctrine::getRepository('FormsPost')->findOneById($id);
        if ($form_post === false) {
            return Response::view('error', array('message' => 'Viedlapa Jums nav pieejama!'));
        }
        $fields = Doctrine::getRepository('FormsPost')->getFormPostWithFieldsAndData($id);
        // Convert all fields to json object
        $fields = Helpers::arrayToObject($fields);
        return View::make('document/form')->with(
                        array(
                            'index_route' => 'FormPostController@index',
                            'action_route' => array('FormPostController@update', $id),
                            'form' => $form_post,
                            'form_post_form' => $form_post->getForm(),
                            'fields' => $fields,
                            'layout' => 'sprk',
                            'form_id' => $form_post->getForm()->getId()
                        )
        );
    }

    /**
     * Update the specified resource in storage.
     * PUT /formpostregulator/{id}
     *
     * @param  int  $id
     * @return Response
     */
    public function update($id) {
        if (Request::ajax() && Request::isMethod('post')) {
            $fields = Doctrine::getRepository('FormsPost')->getFormPostWithFields($id);
            $fields = Helpers::arrayToObject($fields);
        }

        switch (Input::get('action')) {
            case 're-submitted':
                $form_post = Doctrine::getRepository('FormsPost')->find($id);
                $form = $form_post->getForm();
                $fields = Doctrine::getRepository('FormsPost')->getFormPostWithFields($id);
                $fields = Helpers::arrayToObject($fields);
                $validation = Helpers::validateDynamicForm($fields);
                if (isset($validation['errors']) && $validation['errors'] === false && isset($validation['notices']) && $validation['notices'] === false) {
                    $inputs = Input::all();
                    $inputs['reason'] = '';
                    Doctrine::getRepository('FormsPost')->storeFormPost($form, $inputs);

                    return Response::json([
                                "errors" => false,
                                "toUrl" => URL::action('FormPostController@index')
                    ]);
                } else {
                    return Response::json($validation);
                }
                break;
            case 'rejected':
                $form_post = Doctrine::getRepository('FormsPost')->find($id);
                $form_post->setStatus(Input::get('action'));
                $validator = Validator::make(
                                Input::all(), [
                            'rejection_reason' => 'required'
                                ]
                );
                if ($validator->fails()) {
                    return Response::json([
                                'errors' => true,
                                'messages' => $validator->messages()->toArray()
                    ]);
                }
                $form_post->setRejectionReason(Input::get('rejection_reason', null));
                Doctrine::persist($form_post);
                Doctrine::flush();
                return Response::json([
                            "errors" => false,
                            "toUrl" => URL::action('FormPostController@index')
                ]);
                break;
            case 'confirmed':

                $values = Doctrine::getRepository('FormsPostValue')->findBy(array('post' => $id));
                Helpers::fieldSaveToResources($values, 5);

                $form_post = Doctrine::getRepository('FormsPost')->find($id);
                $form_post->setStatus('confirmed');
                Doctrine::persist($form_post);
                Doctrine::flush();
                Session::flash('message', 'Dokuments veiksmīgi pieņemts!');
                
                return Response::json([
                            "errors" => false,
                            "toUrl" => URL::action('FormPostController@index')
                ]);
                break;
            case 'reject':
                return Response::json([
                            "errors" => false,
                            "rejectForm" => true
                ]);
                break;
            case 'submitted':
            case 'draft':
            default:
                $fields = Doctrine::getRepository('FormsPost')->getFormPostWithFields($id);
                $fields = Helpers::arrayToObject($fields);
                $validation = Helpers::validateDynamicForm($fields);
                if (isset($validation['errors']) && $validation['errors'] === false && isset($validation['notices']) && $validation['notices'] === false) {
                    $inputs = Input::all();
                    // When form parameter needApproval is false - document automatic approve without regulator checking inside function saveFormPostWithFieldsValues
                    $form_post = Doctrine::getRepository('FormsPost')->saveFormPostWithFieldsValues($id, $inputs);
                    if ($form_post->getStatus() == 'confirmed') {
                        // Reload last saved field values
                        $values = Doctrine::getRepository('FormsPostValue')->findBy(array('post' => $form_post));
                        Helpers::fieldSaveToResources($values, 5);
                    }

                    Session::flash('message', 'Dokuments veiksmīgi izmainīts');
                    if ($form_post->getStatus() == 'draft') {
                        $validation['toUrl'] = URL::action('FormPostController@edit', $form_post->getId());
                    } else {
                        $validation['toUrl'] = URL::action('FormPostController@index');
                    }
                }
                return Response::json($validation);
                break;
        }
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /formpost/{id}
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy($id) {
        $form_post = Doctrine::getRepository('FormsPost')->getFormPostById($id);
        if (Input::get('verify', false)) {
            if (empty($form_post)) {
                return Response::json(array('error' => true, 'message' => 'Dokuments neeksistē!'));
            }
            if ($form_post['status'] == 'confirmed') {
                return Response::json(array('error' => true, 'message' => 'Dokumentu nedrīkst dzēst, jo tas ir pieņemts!'));
            }
            return Response::json(array('error' => false));
        }
        if (sizeof($form_post) > 0) {
            $result = Doctrine::getRepository('FormsPost')->deleteFormPostAndValues($id);
            if ($result) {
                return Response::json(array('error' => false));
            } else {
                return Response::json(array('alertMessage' => 'Sistēmas kļūda'));
            }
        }
    }

}
