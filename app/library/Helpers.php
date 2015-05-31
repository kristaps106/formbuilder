<?php

use Esynergy\ExchangeWS;
use OzolsWS\OzolsWSHelpers;

class Helpers {

    public static function getAllIndustries() {
        $config = new DoctrineExtensions\NestedSet\Config(App::make('doctrine'), 'Classifier');
        $nsm = new DoctrineExtensions\NestedSet\Manager($config);
        $classifier = Doctrine::getRepository('Classifier')->findOneByShort('nozaru-klasifikators');
        $industries_qb = Doctrine::createQueryBuilder();
        $industries_qb
                ->from('Classifier', 'c')
                ->select('c')
                ->andWhere('c.status = :status')
                ->andWhere('c.deleted = 0')
                ->andWhere('c.rgt > :lft')
                ->andWhere('c.lft < :rgt')
                ->setParameters(
                        array(
                            'status' => 'active',
                            'rgt' => $classifier->getRgt(),
                            'lft' => $classifier->getLft()
                        )
        );
        $nsm->getConfiguration()->setBaseQueryBuilder($industries_qb);

        $classifierTree = $nsm->fetchTreeAsArray($classifier->getRoot());
        $industries = array();
        foreach ($classifierTree as $node) {
            $industries[] = $node->getNode()->getId();
        }
        return $industries;
    }

    /**
     * @param $var1
     * @param $var2
     * @param string $op
     * @return bool
     */
    public static function compare($var1, $var2, $op = 'equal') {
        switch ($op) {
            case 'equal':
                return $var1 == $var2;
            case 'bigger':
                return $var1 > $var2;
            case 'less':
                return $var1 < $var2;
            case 'bigger_equal':
                return $var1 >= $var2;
            case 'less_equal':
                return $var1 <= $var2;
            default:
                return false;
        }
    }

    /**
     * @param $array
     * @return mixed
     */
    public static function arrayToObject($array) {
        // NULL is returned if the json cannot be decoded
        // or if the encoded data is deeper than the recursion limit.
        /*
          array_walk_recursive($array, function(&$value, $key) {
          if (is_string($value)) {
          $value = utf8_encode($value);
          }
          });
         */
        return json_decode(json_encode($array), false);
    }

    /**
     * @param $fields
     * @param bool $from_template
     * @return array
     */
    public static function validateDynamicForm($fields, $from_template = false) {
        $inputs = array();
        $messages = array();
        $notices = array();
        $custom_messages = array();
        $notice_custom_messages = array();
        foreach ($fields as $field) {
            if (!isset($field->identity) || empty($field->identity)) {
                // Ignore empty field - avoid fatal error
                if (!isset($field->cid)) {
                    continue;
                }
                $field->identity = $field->cid;
            }
            if (!is_object($field->field_options)) {
                $field->field_options = json_decode($field->field_options);
            }
            if (empty($field->validation_message)) {
                $field->validation_message = Lang::get('validation.required');
            }
            if (!empty($field->validation_level)) {
                if ($field->validation_level == 'info') {
                    $notices[$field->identity] = 'required';
                    $messages[$field->identity . '.required'] = $field->label . ' - "' . $field->validation_message . '"';
                } else {
                    $inputs[$field->identity] = $field->validation_level;
                    $messages[$field->identity . '.required'] = $field->validation_message;
                }
            }
            if (isset($field->field_options->require_if_other_field_filled) && $field->field_options->require_if_other_field_filled == true) {
                // Unset because when field is required only when other field is filled (SKIIUAS-422)
                if (!empty($field->validation_level) && $field->validation_level == 'info') {
                    unset($messages[$field->identity . '.required']);
                    unset($notices[$field->identity]);
                    unset($notice_custom_messages[$field->identity]['filled']);
                }
                if ($from_template) {
                    if (isset($field->field_options->require_if_other_field_filled) && $field->field_options->require_if_other_field_filled == true) {
                        if (Input::get($field->field_options->require_if_other_field_filled_identity, null) != null) {
                            if (!empty($field->validation_level) && $field->validation_level == 'info') {
                                $notices[$field->identity] = 'required';
                                $messages[$field->identity . '.required'] = $field->label . ' - "' . $field->validation_message . '"';
                                $identity = Input::get($field->identity, '');
                                if (empty($identity)) {
                                    $notice_custom_messages[$field->identity]['filled'] = $field->label . ' - "Lauks ir obligāts"';
                                }
                            } else {
                                $inputs[$field->identity] = 'required';
                                $messages[$field->identity . '.required'] = $field->validation_message;
                            }
                        }
                    }
                } else {
                    foreach ($fields as $f) {
                        if ($f->field_id == $field->field_options->require_if_other_field_filled_identity) {
                            if (Input::get($f->identity, null) != null) {
                                if (!empty($field->validation_level) && $field->validation_level == 'info') {
                                    $notices[$field->identity] = 'required';
                                    $messages[$field->identity . '.required'] = $field->label . ' - "' . $field->validation_message . '"';
                                    $identity = Input::get($field->identity, '');
                                    if (empty($identity)) {
                                        $notice_custom_messages[$field->identity]['filled'] = $field->label . ' - "Lauks ir obligāts"';
                                    }
                                } else {
                                    $inputs[$field->identity] = 'required';
                                    $messages[$field->identity . '.required'] = $field->validation_message;
                                }
                            }
                            break;
                        }
                    }
                }
            }
            if (!empty($field->field_options->comparison_type) && !empty($field->field_options->comparison_formula)) {
                $comparison_field = Input::get($field->identity, null);
                $prefix = (isset($field->field_id)) ? $field->field_id : $field->identity;
                $comparison_result = Input::get($prefix . '_comparison_formula', null);
                if (!empty($comparison_field) && !empty($comparison_result)) {
                    if (Helpers::compare($comparison_field, $comparison_result, $field->field_options->comparison_type)) {
                        if (!empty($field->validation_level) && $field->validation_level == 'info') {
                            $notice_custom_messages[$field->identity]['compare'] = $field->label . ' - "' . $field->validation_message . '"';
                        } else {
                            $custom_messages[$field->identity][] = $field->validation_message;
                        }
                    }
                }
                // Unset because when field is compared, it does not have to be required (SKIIUAS-422)
                if (!empty($field->validation_level) && $field->validation_level == 'info') {
                    unset($messages[$field->identity . '.required']);
                    unset($notices[$field->identity]);
                }
            }
        }
        $validator = Validator::make(Input::all(), $inputs, $messages);
        $action = Input::get('action');
        if (($validator->fails() || !empty($custom_messages)) && Input::get('withoutValidation', false) === false) {
            $result_messages = $validator->messages()->toArray() + $custom_messages;
            // Check if any required field validation fails
            $required_messages = array_where(array_flatten($result_messages), function($key, $value) {
                return (($value == 'Lauks ir obligāts') ? true : false);
            });
            return array(
                "errors" => true,
                "notices" => false,
                "messages" => $result_messages,
                "exist_required" => ((count($required_messages) > 0) ? true : false)
            );
        } else {
            if (in_array($action, array('submitted', 're-submitted')) && Input::get('withoutNoticeValidation', false) === false) {
                $notice_validator = Validator::make(Input::all(), $notices, $messages);
                if ($notice_validator->fails() || !empty($notice_custom_messages)) {
                    $notice_custom_messages = array_flatten($notice_custom_messages);
                    $result_messages = $notice_validator->messages()->toArray() + $notice_custom_messages;
                    return array(
                        "errors" => false,
                        "notices" => true,
                        "messages" => $result_messages
                    );
                }
            }
            return array(
                "errors" => false,
                "notices" => false,
            );
        }
    }

    /**
     * @param $input
     * @return string
     */
    public static function customTrim($input) {
        if (is_array($input)) {
            return $input;
        }
        return trim($input);
    }

    /**
     * @param $forms_post_values
     * @param $source
     */
    public static function fieldSaveToResources($forms_post_values, $source) {
        foreach ($forms_post_values as $forms_post_value) {
            if ($forms_post_value->getField()->getSaveTo()) {
                $client = $forms_post_value->getPost()->getClient();
                $save = json_decode($forms_post_value->getField()->getSaveTo());
                if (sizeof($save) > 0 && !empty($save->entity)) {
                    switch ($save->entity) {
                        case 'BlockElectronicService':

                            $block = Doctrine::getRepository('ClientBlock')->find($save->block);
                            $group = Doctrine::getRepository('Classifier')->findOneByCode($save->group);
                            $service = Doctrine::getRepository('Classifier')->findOneByCode($save->service);

                            self::clearOtherAuthorServiceBlock($forms_post_value, $block);

                            $block_electronic_service = Doctrine::getRepository('BlockElectronicService')->findOneBy(
                                    array(
                                        'block' => $block,
                                        'service' => $service,
                                        'authorType' => $source,
                                        'client' => $client,
                                        'group' => $group,
                                    )
                            );

                            // Check if exists
                            if (sizeof($block_electronic_service) == 0) {
                                $block_electronic_service = new BlockElectronicService();
                                $block_electronic_service->setGroup($group);
                                $block_electronic_service->setBlock($block);
                                $block_electronic_service->setAuthorType($source);
                                $block_electronic_service->setClient($client);
                                $block_electronic_service->setCreatedAt(new \DateTime("now"));
                                $block_electronic_service->setStatus('active');
                            } else {
                                // Clear ATVK to avoid duplicate error
                                foreach ($block_electronic_service->getAtvk() as $atvk) {
                                    $block_electronic_service->removeAtvk($atvk);
                                }
                            }

                            switch ($save->field) {
                                case 'wholesale':
                                    $block_electronic_service->setWholesale(($forms_post_value->getValue()) ? 'Jā' : 'Nē');
                                    break;
                                case 'retail':
                                    // Save ATVK many-to-many
                                    $retail_value_array = json_decode($forms_post_value->getValue());
                                    if (is_array($retail_value_array)) {
                                        foreach ($retail_value_array as $atvk_id) {
                                            $atvk = Doctrine::getRepository('Classifier')->find($atvk_id);
                                            if (sizeof($atvk) > 0) {
                                                $block_electronic_service->addAtvk($atvk);
                                            }
                                        }
                                    } else {
                                        $block_electronic_service->setRetail(($forms_post_value->getValue()) ? 'Jā' : 'Nē');
                                    }
                                    break;
                                case 'checkbox':
                                    $checkbox_value_array = json_decode($forms_post_value->getValue());
                                    if (is_array($checkbox_value_array)) {
                                        $block_electronic_service->setRetail('Nē');
                                        $block_electronic_service->setWholesale('Nē');
                                        foreach ($checkbox_value_array as $sale_type) {
                                            switch ($sale_type) {
                                                case 1:
                                                    $block_electronic_service->setRetail('Jā');
                                                    break;
                                                case 0:
                                                    $block_electronic_service->setWholesale('Jā');
                                                    break;
                                            }
                                        }
                                    }
                                    break;
                            }

                            // Update info
                            $block_electronic_service->setService($service);
                            $block_electronic_service->setAuthorType($source);
                            $block_electronic_service->setAuthor($forms_post_value->getPost()->getId());
                            $block_electronic_service->setUpdatedAt(new \DateTime("now"));
                            Doctrine::persist($block_electronic_service);
                            Doctrine::flush();
                            // Update client block
                            if ($block_electronic_service->getRetail() == 'Jā' || $block_electronic_service->getWholesale() == 'Jā') {
                                $industry_client_block = Doctrine::getRepository('ClientBlock')->findOneByCode('CLIENT_INDUSTRY');
                                $industry_service = Doctrine::getRepository('Classifier')->findOneById($service->getParent());
                                $industry = Doctrine::getRepository('Classifier')->findOneById($industry_service->getParent());
                                $root_clientIndustry = Doctrine::getRepository('ClientIndustry')->findOneBy(array('client' => $client, 'industry' => $industry));
                                if (sizeof($root_clientIndustry) == 0) {
                                    $root_clientIndustry = new ClientIndustry;
                                    $root_clientIndustry->setIndustry($industry);
                                    $root_clientIndustry->setStatus('active');
                                    $root_clientIndustry->setAuthorType(1);
                                    $root_clientIndustry->setAuthor(Auth::user()->getId());
                                    $root_clientIndustry->setCreatedAt(new \DateTime("now"));
                                    $root_clientIndustry->setUpdatedAt(new \DateTime("now"));

                                    $root_clientIndustry->setClient($client);
                                    $root_clientIndustry->setBlock($industry_client_block);
                                    Doctrine::persist($root_clientIndustry);
                                    Doctrine::flush();
                                    Event::fire('audit.store', 'Pievienota nozare komersantam ' . $client->getName());
                                } else if ($root_clientIndustry->getStatus() == 'deleted') {
                                    $root_clientIndustry->setStatus('active');
                                    $root_clientIndustry->setAuthorType(1);
                                    $root_clientIndustry->setAuthor(Auth::user()->getId());
                                    $root_clientIndustry->setUpdatedAt(new \DateTime("now"));
                                    Doctrine::persist($root_clientIndustry);
                                    Doctrine::flush();
                                    Event::fire('audit.edit', 'Atjaunoja nozare komersantam ' . $client->getName());
                                }
                                $clientIndustry = Doctrine::getRepository('ClientIndustry')->findOneBy(array('industry' => $industry, 'service' => $industry_service, 'client' => $client));
                                if (sizeof($clientIndustry) == 0) {
                                    $client_industry = new ClientIndustry;
                                    $client_industry->setIndustry($industry);
                                    $client_industry->setService($industry_service);
                                    $client_industry->setStatus('active');
                                    $client_industry->setCreatedAt(new \DateTime("now"));
                                    $client_industry->setClient($client);
                                    $client_industry->setBlock($industry_client_block);
                                    $client_industry->setActivityDate(new \DateTime("now"));
                                    $client_industry->setActivity('start');
                                    $client_industry->setAuthorType(1);
                                    $client_industry->setAuthor(Auth::user()->getId());
                                    $client_industry->setUpdatedAt(new \DateTime("now"));

                                    Doctrine::persist($client_industry);
                                    Doctrine::flush();
                                    Event::fire('audit.store', 'Izveidots pakalpojums komersantam ' . $client->getName());
                                } else if ($clientIndustry->getStatus() == 'deleted') {
                                    $clientIndustry->setStatus('active');
                                    $clientIndustry->setActivityDate(new \DateTime("now"));
                                    $clientIndustry->setActivity('start');
                                    $clientIndustry->setAuthorType(1);
                                    $clientIndustry->setAuthor(Auth::user()->getId());
                                    $clientIndustry->setUpdatedAt(new \DateTime("now"));

                                    Doctrine::persist($clientIndustry);
                                    Doctrine::flush();
                                    Event::fire('audit.edit', 'Mainīts pakalpojums komersantam ' . $client->getName());
                                }
                                // Update forms_period_client table after updating client industries
                                Doctrine::getRepository('FormsPeriod')->updateClientToFormPeriodsForClient($client);
                            }
                            break;

                        case 'BlockElectronicServiceNetwork':

                            $block = Doctrine::getRepository('ClientBlock')->find($save->block);
                            $network = Doctrine::getRepository('Classifier')->findOneByCode($save->network);
                            $service = Doctrine::getRepository('Classifier')->findOneByCode($save->service);

                            self::clearOtherAuthorServiceBlock($forms_post_value, $block);

                            $block_electronic_service_network = Doctrine::getRepository('BlockElectronicServiceNetwork')->findOneBy(
                                    array(
                                        'block' => $block,
                                        'network' => $network,
                                        'authorType' => $source,
                                        'client' => $client,
                                        'service' => $service,
                                    )
                            );

                            // Check if exists
                            if (sizeof($block_electronic_service_network) == 0) {
                                $block_electronic_service_network = new BlockElectronicServiceNetwork();
                                $block_electronic_service_network->setService($service);
                                $block_electronic_service_network->setBlock($block);
                                $block_electronic_service_network->setAuthorType($source);
                                $block_electronic_service_network->setClient($client);
                                $block_electronic_service_network->setCreatedAt(new \DateTime("now"));
                                $block_electronic_service_network->setStatus('active');
                            }

                            switch ($save->field) {
                                case 'provide':
                                    $block_electronic_service_network->setProvide(($forms_post_value->getValue()) ? 'Jā' : 'Nē');
                                    break;
                                case 'provider':

                                    // Save provider many-to-many
                                    $provider_value_array = json_decode($forms_post_value->getValue());
                                    if (is_array($provider_value_array)) {

                                        if (isset($save->customClient) && $save->customClient == 'yes') {
                                            $options_json = json_decode($forms_post_value->getField()->getFieldOptions());
                                            $options_list = $options_json->options;
                                            $options = array();
                                            if (sizeof($options_list) > 0) {
                                                foreach ($options_list as $key => $v) {
                                                    if (isset($v->value)) {
                                                        $options[$v->value] = $v->label;
                                                    }
                                                }
                                            }
                                        }

                                        $provider_value = '';

                                        foreach ($provider_value_array as $provider_id) {
                                            if (isset($options) && sizeof($options) > 0) {
                                                $provider_value.= $options[$provider_id] . ', ';
                                            } else {
                                                $provider = Doctrine::getRepository('Client')->find($provider_id);
                                                if (sizeof($provider) > 0) {
                                                    $provider_value.= $provider->getName() . ', ';
                                                }
                                            }
                                        }
                                        $provider_value = (strlen($provider_value) > 0 ? substr($provider_value, 0, -2) : '');
                                        $block_electronic_service_network->setProvider($provider_value);
                                    }
                                    break;
                            }

                            // Update info
                            $block_electronic_service_network->setNetwork($network);
                            $block_electronic_service_network->setAuthorType($source);
                            $block_electronic_service_network->setAuthor($forms_post_value->getPost()->getId());
                            $block_electronic_service_network->setUpdatedAt(new \DateTime("now"));
                            Doctrine::persist($block_electronic_service_network);
                            Doctrine::flush();
                            break;

                        case 'BlockElectronicMarket':
                            if (!isset($block_electronic_market[$save->name])) {
                                $block_electronic_market[$save->name] = $forms_post_value->getValue();
                            } else {
                                $block_electronic_market[$save->name]+= $forms_post_value->getValue();
                            }
                            break;

                        case 'BlockTurnover':
                            if ($forms_post_value->getValue()) {
                                if (isset($save->source_type)) {
                                    switch ($save->source_type) {
                                        case 'taxYear':
                                            $period = Doctrine::getRepository('Period')->findOneById($forms_post_value->getValue());
                                            $date = explode('-', date_format($period->getStartDate(), "Y-m-d"));
                                            $ozols_ws['taxYear'] = $date[0];
                                            break;
                                        case 'sectors':
                                            $ozols_ws['dataType'] = $save->data_type;
                                            $ozols_ws['sectors'][] = array(
                                                'SectorCode' => $save->sector,
                                                'Turnover' => $forms_post_value->getValue()
                                            );
                                            break;
                                    }
                                }
                                if ($save->type == 'year') {
                                    $year = $forms_post_value->getValue();
                                    continue;
                                }

                                /*
                                  if (empty($block)) {
                                  $block = Doctrine::getRepository('ClientBlock')->find($save->block);
                                  }
                                 */

                                $industry = Doctrine::getRepository('Classifier')->findOneByCode($save->industry);

                                $block_turnover = Doctrine::getRepository('BlockTurnover')->findOneBy(
                                        array(
                                            //'block' => $block,
                                            //'authorType' => $source,
                                            'client' => $client,
                                            'year' => $year,
                                            'industry' => $industry
                                        )
                                );

                                // Check if exists
                                if (sizeof($block_turnover) == 0) {
                                    // Insert
                                    $block_turnover = new BlockTurnover();
                                    $block_turnover->setYear($year);
                                    $block_turnover->setIndustry($industry);
                                    $block_turnover->setClient($client);
                                    //$block_turnover->setBlock($block);
                                    $block_turnover->setCreatedAt(new \DateTime("now"));
                                    $block_turnover->setStatus('active');
                                }

                                $block_turnover->setTurnover($forms_post_value->getValue());
                                $block_turnover->setAuthorType($source);
                                $block_turnover->setAuthor($forms_post_value->getPost()->getId());
                                $block_turnover->setUpdatedAt(new \DateTime("now"));
                                Doctrine::persist($block_turnover);
                                Doctrine::flush();
                            }
                            break;

                        case 'BlockElectricityObject':

                            switch ($save->field) {
                                case 'address':
                                    $electricity_object['block'] = Doctrine::getRepository('ClientBlock')->findOneByCode('ELECTRICITY_OBJECT');
                                    $electricity_object['author'] = $forms_post_value->getPost()->getId();
                                    $electricity_object['address'] = $forms_post_value->getValue();
                                    break;
                                case 'electricity_power':
                                    $electricity_object['electricity_power'] = $forms_post_value->getValue();
                                    break;
                                case 'qkog':
                                    if (isset($electricity_object['thermal_power'])) {
                                        $electricity_object['thermal_power']+= $forms_post_value->getValue();
                                    } else {
                                        $electricity_object['thermal_power'] = $forms_post_value->getValue();
                                    }
                                    break;
                                case 'quk':
                                    if (isset($electricity_object['thermal_power'])) {
                                        $electricity_object['thermal_power']+= $forms_post_value->getValue();
                                    } else {
                                        $electricity_object['thermal_power'] = $forms_post_value->getValue();
                                    }
                                    break;
                                case 'operator':
                                    $electricity_object['operator'] = Doctrine::getRepository('Client')->findOneById($forms_post_value->getValue());
                                    break;
                                case 'resource':
                                    $electricity_object['resource'] = json_decode($forms_post_value->getValue());
                                    break;
                            }

                            break;

                        case 'BlockWasteRegister':

                            switch ($save->field) {
                                case 'serviceAmount':
                                    $waste_register['block'] = Doctrine::getRepository('ClientBlock')->findOneByCode('WASTE_REGISTER');
                                    $waste_register['author'] = $forms_post_value->getPost()->getId();
                                    $waste_register['serviceAmount'] = $forms_post_value->getValue();
                                    break;
                                case 'finance':
                                    $waste_register['finance'] = $forms_post_value->getValue();
                                    break;
                            }

                            break;
                    }
                }
            }
        }

        // perform ozols ws call if sectors are set
        if (isset($ozols_ws) && !empty($ozols_ws['sectors'])) {
            $client = $forms_post_value->getPost()->getClient();
            $ozols_ws['companyNumber'] = $client->getRegNr();
            $ozols_ws['companyName'] = $client->getName();
            $now = new \DateTime("now");
            $submit_date = date_format($now, "Y-m-d");
            $ozols_ws['submitDate'] = $submit_date;
            // call helper function insertTurnover($ozols_ws);
            $response = OzolsWS\OzolsWSHelpers::OzolsWsCall('insertTurnover', $ozols_ws);

            // store response status code and text in audit
            if (isset($response["InsertTurnoverResult"]["ReturnParams"])) {
                $full_res = '';
                $counter = 1;
                foreach ($response["InsertTurnoverResult"]["ReturnParams"] as $res) {
                    $response_status = $res["Status"];
                    $response_text = $res["StatusText"];
                    $full_res = $full_res . ' ' . $counter . '. iterācijas statusa kods: ' . $response_status . ' un teksts: ' . $response_text;
                    $counter++;
                }
                Event::fire('audit.ozols.insert.' . $client->getId(), 'Atjauninati regulēšanas nodevu statusi komersantam ' . $client->getId() . 'Atgrieztie rezultāti: ' . $full_res);
            } else {
                Event::fire('audit.ozols.insert.error.' . $client->getId(), 'Izpildītais pieprasījums uz ozols nav izdevies');
            }
        }

        // Save electronic industries markets
        if (isset($block_electronic_market) && !empty($block_electronic_market)) {
            $client = $forms_post_value->getPost()->getClient();

            $block = (isset($save->block) ? Doctrine::getRepository('ClientBlock')->find($save->block) : null);
            $client_markets = Doctrine::createQueryBuilder()
                    ->select('m.id, m.market, m.activity')
                    ->from('BlockElectronicMarket', 'm')
                    ->where('m.client= :client')
                    ->setParameters(
                            array(
                                'client' => $client->getId()
                            )
                    )
                    ->getQuery()
                    ->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);

            // Set existing markets
            $sort_client_market = array();
            if (!empty($client_markets)) {
                foreach ($client_markets as $key => $value) {
                    $sort_client_market[$value['market']] = array(
                        'id' => $value['id'],
                        'activity' => $value['activity']
                    );
                }
            }

            // Activities: accepted - Pienemts, removed- Nonemts
            foreach ($block_electronic_market as $key => $value) {

                //If client does not have current market, set as accepted
                if (!isset($sort_client_market[$key]) && $value > 0) {
                    $market = new BlockElectronicMarket;
                    $market->setMarket($key);
                    $market->setActivity('accepted');
                    $market->setDate(new \DateTime("now"));
                    $market->setStatus('active');
                    $market->setAuthorType($source);
                    $market->setAuthor($forms_post_value->getPost()->getId());
                    $market->setCreatedAt(new \DateTime("now"));
                    $market->setUpdatedAt(new \DateTime("now"));
                    $market->setClient($client);
                    $market->setBlock($block);
                    Doctrine::persist($market);
                }
                //If market need to be removed
                elseif (isset($sort_client_market[$key]) && $sort_client_market[$key]['activity'] == 'accepted' && $value == 0) {
                    $market = Doctrine::getRepository('BlockElectronicMarket')->findOneById($sort_client_market[$key]['id']);
                    $market->setActivity('removed');
                    $market->setAuthor($forms_post_value->getPost()->getId());
                    $market->setDate(new \DateTime("now"));
                    $market->setUpdatedAt(new \DateTime("now"));
                    Doctrine::persist($market);
                }
                // If market need to be accepted again
                elseif (isset($sort_client_market[$key]) && $sort_client_market[$key]['activity'] == 'removed' && $value > 0) {
                    $market = Doctrine::getRepository('BlockElectronicMarket')->findOneById($sort_client_market[$key]['id']);
                    $market->setActivity('accepted');
                    $market->setAuthor($forms_post_value->getPost()->getId());
                    $market->setDate(new \DateTime("now"));
                    $market->setUpdatedAt(new \DateTime("now"));
                    Doctrine::persist($market);
                }
            }
            Doctrine::flush();
        }

        // Save electricity objects
        if (isset($electricity_object) && !empty($electricity_object)) {
            $client = $forms_post_value->getPost()->getClient();
            $obj = Doctrine::getRepository('BlockElectricityObject')->findOneBy(
                    array(
                        'client' => $client,
                        'block' => $electricity_object['block'],
                        'address' => $electricity_object['address'],
            ));

            // Check if exists
            if (sizeof($obj) == 0) {
                $obj = new BlockElectricityObject();
                $obj->setAddress($electricity_object['address']);
                $obj->setCreatedAt(new \DateTime("now"));
                $obj->setClient($client);
                $obj->setBlock($electricity_object['block']);
            } else {
                if (sizeof($obj->getResource()) > 0) {
                    foreach ($obj->getResource() as $res) {
                        $obj->removeResource($res);
                    }
                }
            }

            // Save new resources
            $resourceHistory = array();
            if (isset($electricity_object['resource']) && sizeof($electricity_object['resource']) > 0) {
                foreach ($electricity_object['resource'] as $val) {
                    $resource = Doctrine::getRepository('Classifier')->findOneByCode($val);
                    if (sizeof($resource)) {
                        $obj->addResource($resource);
                        $resourceHistory[] = $resource->getId();
                    }
                }
            }

            $obj->setElectricityPower($electricity_object['electricity_power']);
            $obj->setThermalPower($electricity_object['thermal_power']);
            (isset($electricity_object['operator']) ? $obj->setOperator($electricity_object['operator']) : $obj->setOperator(null));
            $obj->setStatus('active');
            $obj->setAuthorType($source);
            $obj->setAuthor($electricity_object['author']);
            $obj->setUpdatedAt(new \DateTime("now"));
            Doctrine::persist($obj);
            Doctrine::flush();

            // Save resources history (many-to-many)
            $rev = EntityAudit::getReader(App::make('doctrine'))->getCurrentRevision('BlockElectricityObject', (int) $obj->getId());
            Doctrine::getConnection()->close();

            $station = $obj->getId();
            if (sizeof($resourceHistory) > 0) {
                foreach ($resourceHistory as $classifier) {
                    $resourcekAudit = new BlockElectricityObjectResourceCustomaudit();
                    $resourcekAudit->setRevnr((int) $rev);
                    $resourcekAudit->setStation((int) $station);
                    $resourcekAudit->setMaterial((int) $classifier);
                    Doctrine::persist($resourcekAudit);
                }
                Doctrine::flush();
            }
        }

        // Save waaste register
        if (isset($waste_register) && !empty($waste_register)) {
            $client = $forms_post_value->getPost()->getClient();
            $register = Doctrine::getRepository('BlockWasteRegister')->findOneBy(
                    array(
                        'client' => $client,
                        'block' => $waste_register['block'],
            ));

            // Check if exists
            if (sizeof($register) == 0) {
                $register = new BlockWasteRegister();
                $register->setCreatedAt(new \DateTime("now"));
                $register->setClient($client);
                $register->setBlock($waste_register['block']);
            }

            $register->setServiceAmount($waste_register['serviceAmount']);
            $register->setFinance($waste_register['finance']);
            $register->setStatus('active');
            $register->setAuthorType($source);
            $register->setAuthor($waste_register['author']);
            $register->setUpdatedAt(new \DateTime("now"));
            Doctrine::persist($register);
            Doctrine::flush();
        }
    }

    /**
     * @param $name
     * @return mixed
     */
    public static function getStatusTitleByName($name) {
        $statuses = array(
            'approved' => 'Tīrraksts',
            'draft' => 'Melnraksts',
            'active' => 'Aktīvs',
            'inactive' => 'Neaktīvs',
            'liquidated' => 'Likvidēts',
            'insolvency' => 'Maksātnespēja',
            'cancelled_certificate' => 'Apliecības anulēšana',
            'ready' => 'Gatavs iesniegšanai',
            'accepted' => 'Pieņemts',
            'rejected' => 'Noraidīts',
            'submitted' => 'Iesniegts',
            'confirmed' => 'Pieņemts',
            're-submitted' => 'Iesniegts atkārtoti',
            'changed' => 'Labots',
            'expired' => 'Kavēts'
        );
        return (array_key_exists($name, $statuses)) ? $statuses[$name] : $name;
    }

    /**
     * @param $in
     * @return string
     */
    private static function cyr2lat($in) {
        $conv = array(
            'а' => 'a',
            'б' => 'b',
            'в' => 'v',
            'г' => 'g',
            'д' => 'd',
            'е' => 'e',
            'ё' => 'e',
            'ж' => 'zh',
            'з' => 'z',
            'и' => 'i',
            'й' => 'j',
            'к' => 'k',
            'л' => 'l',
            'м' => 'm',
            'н' => 'n',
            'о' => 'o',
            'п' => 'p',
            'р' => 'r',
            'с' => 's',
            'т' => 't',
            'у' => 'u',
            'ф' => 'f',
            'х' => 'h',
            'ц' => 'c',
            'ч' => 'ch',
            'ш' => 'sh',
            'щ' => 'sch',
            'ь' => "'",
            'ы' => 'y',
            'ь' => "'",
            'э' => 'e',
            'ю' => 'ju',
            'я' => 'ja',
            "ā" => "a",
            "ē" => "e",
            "ī" => "i",
            "ō" => "o",
            "ū" => "u",
            "ģ" => "g",
            "ķ" => "k",
            "ļ" => "l",
            "ņ" => "n",
            "č" => "c",
            "š" => "s",
            "ž" => "z",
        );
        return strtr($in, $conv);
    }

    /**
     * @param $text
     * @return bool|mixed|string|void
     */
    public static function getUnderscoredString($text) {
        $text = trim(strip_tags($text));

        if (empty($text)) {
            return false;
        }

        $text = mb_strtolower($text, "UTF-8");
        $text = self::cyr2lat($text);

        // Translit
        $text = iconv('utf-8', 'us-ascii//TRANSLIT//IGNORE', $text);

        // Non letter or digits to _
        $text = preg_replace('#[^\wL\d]+#u', '_', $text);

        // Trim
        $text = trim($text, '_');

        // Lowercase
        $text = strtolower($text);

        // Remove other unnecessary symbols
        $text = preg_replace('~[^-\w]+~', '', $text);

        return $text;
    }

    /**
     * 
     * @param type $string
     * @return type
     */
    public static function isJson($string) {
        $decode = json_decode($string);
        return is_string($string) && (is_object($decode) || is_array($decode)) && (json_last_error() == JSON_ERROR_NONE) ? true : false;
    }

}
