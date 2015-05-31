<?php namespace Esynergy\FieldTypes;

use Response;

class SelectField extends BaseField {

	public function getViewName() { return 'select'; }

	public static function createSearcher($model, array $search_against, $text_closure, $query_closure = null, $result_format_closure = null)
	{

		if($query_closure == null)
		{
			$query_closure = function($q) {};
		}

		if($result_format_closure)
		{
			$to_select_data = $result_format_closure;
		}
		else {
			$to_select_data = function($s) use($text_closure)
			{
				return ['id' => $s->getKey(), 'text' => $text_closure($s)];
			};
		}

		return function($search, $map = false, $where = []) use($model, $search_against, $to_select_data, $query_closure) {
			if(!$map)
			{
				$search = "%{$search}%";
                if(count($where))
				    $q = $model::with(array_keys($where));
                else
                    $q = $model::query();

				$q2 = $model::query();
				$query_closure($q2);
				$q->addNestedWhereQuery($q2->getQuery());

				$q->whereNested(function($q) use ($search_against, $search) {
					foreach($search_against as $field)
					{
						$q->whereRaw("{$field} LIKE ?", [$search], 'or');
					}
				});

                foreach($where as $key => $match) {
                    $q->whereHas($key, function($rel) use ($match) {
                        foreach($match as $k => $m)
                        {
                            $rel->where($k, $m);
                        }
                    });
                }

				$results = $q->paginate(15);
				$error = false;

				return Response::json([
					'results' => $results->getCollection()->map($to_select_data)->toArray(),
					'page' => $results->getCurrentPage(),
					'total' => $results->getLastPage(),
					'error' => $error
				]);

			}
			else
			{

                if(count($where))
                    $q = $model::with(array_keys($where));
                else
                    $q = $model::query();

				$q2 = $model::query();
				$query_closure($q2);
				$q->addNestedWhereQuery($q2->getQuery());

                foreach($where as $key => $match) {
                    $q->whereHas($key, function($rel) use ($match) {
                        foreach($match as $k => $m)
                        {
                            $rel->where($k, $m);
                        }
                    });
                }

				$record = $q->find($search);

				if($record)
				{
					$record = $to_select_data($record);
					$error = false;
				}
				else
				{
					$record = null;
					$error = true;
				}

				return Response::json([
					'record' => $record,
					'error' => $error
				]);
			}
		};
	}

}