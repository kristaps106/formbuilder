<?php

namespace OzolsWS;

use NtlmClient;

class OzolsWSHelpers {

	/**
	 * Fetch the wsdl and set it to the tmp folder
	 *
	 * @access protected
	 * @return void
	 */
	private static function fetchWsdl($url, $credentials) {
		$username = $credentials['username'];
		$password = $credentials['password'];
		$handle = curl_init();

		curl_setopt($handle, CURLOPT_URL, $url);
		curl_setopt($handle, CURLOPT_HEADER, false);
		curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);

		curl_setopt($handle, CURLOPT_HTTPAUTH, CURLAUTH_NTLM);
		curl_setopt($handle, CURLOPT_USERPWD, "{$username}:{$password}");

		$response = curl_exec($handle);
		curl_close($handle);

		$filename = strtotime(date('Ymd His')) . '.wsdl';

		// Need to place wsdls in a seperate folder not main storage dir
		$destination = storage_path() . "/ozols_wsdl/{$filename}";
		file_put_contents($destination, $response);

		return $destination;
	}

	public static function OzolsWsCall($service, $request_data) {
		if (\File::isWritable(storage_path() . "/ozols_wsdl") == false) {
			\File::makeDirectory(storage_path() . "/ozols_wsdl");
		} 
		$url = self::fetchWsdl('http://192.168.0.206:88/OzolsWS_test/services/Fees.svc?singleWsdl', array('username' => 'IIAS_Ozols_WS', 'password' => 'saite02O'));
		$client = new NtlmClient($url, array('login' => 'IIAS_Ozols_WS', 'password' => 'saite02O'));

		switch ($service) {
			case 'getCompanyBalance':
				$params = array(
					'companyNumber' => $request_data['companyNumber']
				);
				$results = $client->getCompanyBalance($params);
				
				$response = json_decode(json_encode($results), true);
				return $response;

			case 'insertTurnover':
				$params = array(
					'companyNumber' => $request_data['companyNumber'],
					'companyName' => $request_data['companyName'],
					'dataType' => $request_data['dataType'],
					'submitDate' => $request_data['submitDate'],
					'taxYear' => $request_data['taxYear'],
					'sectors' => $request_data['sectors']
				);
				$results = $client->insertTurnover($params);

				$response = json_decode(json_encode($results), true);
				return $response;

			case 'removeComanySector':
				$params = array(
					'companyNumber' => $request_data['companyNumber'],
					'sectorCode' => $request_data['sectorCode'],
					'excludeDate' => $request_data['excludeDate']
				);
				$results = $client->removeComanySector($params);

				$response = json_decode(json_encode($results), true);
				return $response;
		}
	}

	public static function validateExcludeDate($register_type, $client) {
		
		$request_data['sectorCode'] = null;
		$classifier_mapping_single = array(
			'213992' => 'registrs-elektronisks',
			'213997' => 'registrs-atkritumi',
			'213995' => 'registrs-udensaimnieciba',
			'213993' => 'registrs-dzelzcels',
			'213991' => 'registrs-pasts'
		);
		$classifier_mapping_multiple_energo = array(
			'2139942' => 'registrs-energijas-razosana',
			'2139942' => 'registrs-energijas-tirgosana',
			'2139942' => 'registrs-energijas-sadale',
			'2139942' => 'registrs-energijas-parvade'
		);
		$classifier_mapping_multiple_heat = array(
			'213996' => 'registrs-siltumenergijas-razosana',
			'213996' => 'registrs-siltumenergijas-tirgosana',
			'213996' => 'registrs-siltumenergijas_parvade_un_sadale'
		);
		$classifier_mapping_multiple_gas = array(
			'2139941' => 'registrs-dabasgazes-parvade',
			'2139941' => 'registrs-dabasgazes-sadale',
			'2139941' => 'registrs-dabasgazes-uzglabasana',
			'2139941' => 'registrs-dabasgazes-tirdznieciba'
		);
		switch (true) {
			case in_array($register_type->getCode(), $classifier_mapping_single):

				$request_data['sectorCode'] = array_search($register_type->getCode(), $classifier_mapping_single);
				break;
			case in_array($register_type->getCode(), $classifier_mapping_multiple_energo):
				//CHECK IF HAS LEFT ACTIVE ENTRY
				$qb = Doctrine::createQueryBuilder()
						->from('ClientRegister', 'r')
						->select('r.id')
						->join('r.registerType', 'cl')
						->where('r.client = :client')
						->andWhere('cl.code IN (:registries)')
						->setParameters(
								array(
									'client' => $client->getId(),
									'registries' => array('registrs-energijas-razosana', 'registrs-energijas-tirgosana', 'registrs-energijas-sadale', 'registrs-energijas-parvade')
								)
						)
						->getQuery()
						->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
				if (sizeof($qb) == 0) {
					$request_data['sectorCode'] = array_search($register_type->getCode(), $classifier_mapping_multiple_energo);
				}
				break;
			case in_array($register_type->getCode(), $classifier_mapping_multiple_heat):
				//CHECK IF HAS LEFT ACTIVE ENTRY
				$qb = Doctrine::createQueryBuilder()
						->from('ClientRegister', 'r')
						->select('r.id')
						->join('r.registerType', 'cl')
						->where('r.client = :client')
						->andWhere('cl.code IN (:registries)')
						->setParameters(
								array(
									'client' => $client->getId(),
									'registries' => array('registrs-siltumenergijas-razosana', 'registrs-siltumenergijas-tirgosana', 'registrs-siltumenergijas_parvade_un_sadale')
								)
						)
						->getQuery()
						->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
				if (sizeof($qb) == 0) {
					$request_data['sectorCode'] = array_search($register_type->getCode(), $classifier_mapping_multiple_heat);
				}

				break;
			case in_array($register_type->getCode(), $classifier_mapping_multiple_gas):
				//CHECK IF HAS LEFT ACTIVE ENTRY
				$qb = Doctrine::createQueryBuilder()
						->from('ClientRegister', 'r')
						->select('r.id')
						->join('r.registerType', 'cl')
						->where('r.client = :client')
						->andWhere('cl.code IN (:registries)')
						->setParameters(
								array(
									'client' => $client->getId(),
									'registries' => array('registrs-dabasgazes-parvade', 'registrs-dabasgazes-sadale', 'registrs-dabasgazes-uzglabasana', 'registrs-dabasgazes-tirdznieciba')
								)
						)
						->getQuery()
						->getResult(\Doctrine\ORM\Query::HYDRATE_SCALAR);
				if (sizeof($qb) == 0) {
					$request_data['sectorCode'] = array_search($register_type->getCode(), $classifier_mapping_multiple_gas);
				} 
				break;
		}
		
		return $request_data;
	}

}
