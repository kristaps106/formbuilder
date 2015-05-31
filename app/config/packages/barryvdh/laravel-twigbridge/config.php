<?php
use Illuminate\Support\Facades\Config;

return array(

 /*
  |--------------------------------------------------------------------------
  | Twig options
  |--------------------------------------------------------------------------
  |
  | Available options:
  |
  |   * debug: When set to true, it automatically set "auto_reload" to true as
  |           well (default to false).
  |
  |   * charset: The charset used by the templates (default to UTF-8).
  |
  |   * base_template_class: The base template class to use for generated
  |                         templates (default to Barryvdh\TwigBridge\TwigTemplate).
  |
  |   * cache: An absolute path where to store the compiled templates, or
  |           false to disable compilation cache. Default to storage_path('views/twig')
  |
  |   * auto_reload: Whether to reload the template if the original source changed.
  |                 If you don't provide the auto_reload option, it will be
  |                 determined automatically based on the debug value.
  |
  |   * strict_variables: Whether to ignore invalid variables in templates
  |                      (defaults to false).
  |
  |   * autoescape: Whether to enable auto-escaping (default to html):
  |                   * false: disable auto-escaping
  |                   * true: equivalent to html
  |                   * html, js: set the autoescaping to one of the supported strategies
  |                   * PHP callback: a PHP callback that returns an escaping strategy based on the template "filename"
  |
  |   * optimizations: A flag that indicates which optimizations to apply
  |                   (default to -1 which means that all optimizations are enabled;
  |                   set it to 0 to disable).
  |
  */

  'options' => array(
    'debug'                 => Config::get('app.debug'),
    'charset'               => 'UTF-8',
    'base_template_class'   => 'Barryvdh\TwigBridge\TwigTemplate',
    'auto_reload'           => null,
    'cache'                 => false,
    'strict_variables'      => true,
    'autoescape'            => 'html',
    'optimizations'         => -1,
  ),

  /*
   |--------------------------------------------------------------------------
   | Functions & Filters
   |--------------------------------------------------------------------------
   |
   | List of Functions & Filters that are made available to your Twig templates.
   | Supports string, array, closure or Twig_SimpleFilter / Twig_SimpleFunction.
   | The default options are used when no options are set.
   |
   */

  'default_options' => array(
    'needs_environment' => false,
    'needs_context'     => false,
    'is_safe'           => null, // null or array('html')
    'is_safe_callback'  => null, // null or callback
    'pre_escape'        => null, // null or 'html'
    'preserves_safety'  => null,
  ),

  'functions' => array(
      'css' => function ($url) {
          return "<link rel='Stylesheet' href='" . $url . "' type='text/css'>\n";
      },
      'js' => function ($url) {
          return "<script src='" . $url . "' type='text/javascript'></script>\n";
      },
      'asset_timed' => function ($path, $secure=null) {
          $file = public_path($path);
          if(file_exists($file)){
              return asset($path, $secure) . '?' . filemtime($file);
          }else{
              throw new \Exception('The file "'.$path.'" cannot be found in the public folder');
          }
      },
      'generate_acl_menu' => function () {
          $menus = array(
                array(
                    'title' => 'Dokumentu saraksts',
                    'route' => 'FormPostController@index',
                    'icon'  => 'fa fa-folder fa-fw'
                ),
                array(
                    'title' => 'Veidlapas',
                    'route' => 'FormTemplateController@index',
                    'icon'  => null
                )  
        );
        return $menus;
      },
      'user' => function () {
          return Auth::user()->getFirstName() . ' ' . Auth::user()->getLastName();
      },
      'userGroup' => function () {
          $userGroup = array();
          foreach(Auth::user()->getGroups() as $group) {
              $userGroup[] = $group->getName();
          }
          return $userGroup;          
      },
      'isActive' => function ($menu_route) {
          $route = Route::current()->getAction();
          $controller = substr($route['controller'], 0, strpos($route['controller'], '@'));
          $sub_route_active = false;
          if (isset($menu_route['sub_menu'])) {
              foreach ($menu_route['sub_menu'] as $menu) {
                  if(isset($menu['sub_routes'])) {
                      foreach ($menu['sub_routes'] as $sub_routes) {
                          if ($sub_routes == $controller) {
                              $sub_route_active = true;
                          }
                      }
                  }
                  if (!empty($menu['route']) && strpos($menu['route'], $controller) !== false || $sub_route_active == true ) {
                    return 'active';
                  }
                  
              }
          }
          if(isset($menu_route['sub_routes'])) {
              foreach ($menu_route['sub_routes'] as $sub_routes) {
                  if ($sub_routes == $controller) {
                      $sub_route_active = true;
                  }
              }
          }
          return (!empty($menu_route['route']) && strpos($menu_route['route'], $controller) !== false || $sub_route_active == true ) ? 'opened' : '';
      },
      'getUserObject' => function ($client = false) {
          if ($client) {
              return $client;
          } else {
              return Auth::user();
          }
      },
      'isString' => function ($str) {
          return is_string($str);
      },

      'jsonDecode' => function ($json) {
          return json_decode($json);
      },

      'isJSON' => function ($string){
		  return Helpers::isJson($string);
      },
      'getClassifierValues' => function ($name, $assoc = true) {
          if ($name == 'merchants') {
              $merchants = Doctrine::createQueryBuilder()
                  ->from('Client', 'c')
                  ->select('c.id, c.name')
                  ->where("c.status <> 'deleted'")
                  ->getQuery()
                  ->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
              $classifiers = array();
              foreach ($merchants as $merchant) {
                  $classifiers[$merchant['id']] = array(
                      'label' => $merchant['name']
                  );
              }
              return array($name => $classifiers);
          } elseif ($name == 'years') {
              $years = array();
              for ($i = 0, $y = date("Y") - 5 ; $y < date("Y") + 2 ; $i++, $y++ ) {
                  $years[$i] = $y;
              }
              $classifiers = array();
              foreach ($years as $year) {
                  $classifiers[$year] = array(
                      'label' => $year
                  );
              }
              return array($name => $classifiers);
          } elseif ($name == 'periods') {
			  $last_year_start = date("Y-m-d", mktime(0, 0, 0, 1, 1, date('Y') - 1));
			  $next_year_end = date("Y-m-d", mktime(0, 0, 0, 12, 31, date('Y') + 1));
              $periods = Doctrine::createQueryBuilder()
                  ->from('Period', 'p')
                  ->select('p.id, p.title')
				  ->andWhere('p.start_date BETWEEN :from AND :to')
				  ->setParameters(
						array(
							'from' => $last_year_start,
							'to' => $next_year_end
						)
				  )
                  ->getQuery()
                  ->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
              $classifiers = array();
              foreach ($periods as $period) {
                  $classifiers[$period['id']] = array(
                      'label' => $period['title']
                  );
              }
              return array($name => $classifiers);
          } else {
              $config = new DoctrineExtensions\NestedSet\Config(App::make('doctrine'), 'Classifier');
              $nsm = new DoctrineExtensions\NestedSet\Manager($config);
              $classifier = Doctrine::getRepository('Classifier')->findOneBy(array('short' => $name, 'deleted' => 0));
              if (sizeof($classifier) == 0) {
                  return array();
              }
              $qb = Doctrine::createQueryBuilder()
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
              $nsm->getConfiguration()->setBaseQueryBuilder($qb);
              $classifierTree = $nsm->fetchTreeAsArray($classifier->getRoot());
              $classifiers = array();
              foreach ($classifierTree as $node) {
                  if ($node->getLevel() > 1) {
                      $classifiers[$node->getNode()->getId()] = array(
                          'label' => str_repeat(' - ', $node->getLevel() - 2) . $node->getNode()->getTitle()
                      );
                  }
              }
              $nsm->getConfiguration()->resetBaseQueryBuilder();
              return ($assoc) ? array($name => $classifiers) : $classifiers;
          }
      },
        'getPeriods' => function ($name, $before, $after) {
            $from = date('Y-m-d', mktime(0, 0, 0, 1, 1,   date("Y") - $before));
            $to = date('Y-m-d', mktime(0, 0, 0, 1, 1,   date("Y") + $after));
            $p = Doctrine::createQueryBuilder()
                    ->from('Period', 'p')
                    ->select('p.id, p.start_date')
                    ->where('p.name = :name')
                    ->andWhere('p.start_date BETWEEN :from AND :to')
                    ->setParameters(array(
                        'name' => $name,
                        'from' => $from,
                        'to' => $to,
                    ))
                    ->getQuery()
                    ->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
            
            $result = array();
            if (count($p) > 0) {
                foreach ($p as $v) {
                    $date = explode('-', $v['start_date']);
                    if ($name == 'once-a-year') {
                        $result[$v['id']]['label'] = $date[0];                        
                    } else {
                        $result[$v['id']]['label'] = $date[2] . '.' . $date[1] . '.' . $date[0];
                    }
                }
            }
            return $result;
        },    
      'checkRelatedFieldFilled' => function ($field, $post_id) {
          if (sizeof($field) == 0) {
              return false;
          }
          try {
              if (!isset($field->field_options->disabled_until_not_equal_other_filled_identity)) {
                  return false;
              }
              $fpv = Doctrine::createQueryBuilder()
                  ->from('FormsPostValue', 'fpv')
                  ->select('fpv.value')
                  ->join('fpv.field', 'ff')
                  ->join('fpv.post', 'fp')
                  ->where('fp.id = :post_id')
                  ->andWhere('ff.field_id = :field_id')
                  ->setParameters(array(
                      'post_id' => $post_id,
                      'field_id' => $field->field_options->disabled_until_not_equal_other_filled_identity,
                  ))
                  ->getQuery()
                  ->getSingleResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
          } catch (\Doctrine\ORM\NoResultException $e) {
              return false;
          }
          if (sizeof($fpv) > 0
              && !empty($field->field_options->disabled_until_not_equal_other_filled_formula)
              && !empty($field->field_options->disabled_until_not_equal_other_filled_comparison)
          ) {
              return (
                  Helpers::compare($fpv['value'],
                  $field->field_options->disabled_until_not_equal_other_filled_formula,
                  $field->field_options->disabled_until_not_equal_other_filled_comparison
              ));
          }
          return false;
      },
    'getClients' => function ($name) {
        $clients = array();
        if ($name == 'all') {
            $clients = Doctrine::createQueryBuilder()
                  ->from('Client', 'c')
                  ->select('c.id, c.name')
                  ->where("c.status <> 'deleted'")
                  ->getQuery()
                  ->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
          }
        return $clients;
    },
	'getMerchantInfo' => function ($data, $is_json = false) {
		
		if ($is_json) {
			$data = json_decode($data);
		} elseif (!is_array($data)) {
			if (intval($data)) {
				$data = array($data);
			}
		}

		$merchantInfo = Doctrine::createQueryBuilder()
			  ->from('Client', 'c')
			  ->select('c.id, c.name')
			  ->where("c.status <> 'deleted'")
			  ->andWhere('c.id in (:ids)')
                  ->setParameters(array(
                      'ids' => $data,
                  ))
			  ->getQuery()
			  ->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
        return $merchantInfo;
    },
	'merchantRightFilter' => function ($user, $action) {
		return Helpers::merchantRightFilter($user, $action);
	},
	'checkUserRolePremissions' => function ($user, $role) {
		return Esynergy\DoctrineAuthProvider::checkRolePermission($user, $role);
	},
  ),

  'filters' => array(

  ),

  'facades' => array(

  )

);
