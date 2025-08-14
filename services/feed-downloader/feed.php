<?php
# $url = 'https://files.lazienka-rea.com.pl/feed-small.xml';
$url = 'https://lazienka-rea.com.pl/feed/generate/full_offer';
$xmlDownloadLocation = '/Volumes/Web/podlasiak-feeds/public/temp/';
$jsonSaveLocation = '/Volumes/Web/podlasiak-feeds/public/temp/data/';
$productsPerFile = 100;
$ftp_server = "185.157.236.191";
$ftp_username = "ftp_podlasiak";
$ftp_userpass = "6IRAVEj3U10Z";

function pushToFtp()
{
	global $ftp_server, $ftp_username, $ftp_userpass;
	$ftp_connection = ftp_connect($ftp_server, 61421);
	if (false === $ftp_connection) {
		throw new Exception('Unable to connect');
	}
	if ($ftp_connection) {
		$login = ftp_login($ftp_connection, $ftp_username, $ftp_userpass);
		ftp_pasv($ftp_connection, true);
		if ($login) {


			$files = glob('/Volumes/Web/podlasiak-feeds/public/temp/data/*');
			foreach ($files as $file) {
				if (is_file($file)) {
					$remote_file = str_replace(array('/Volumes/Web/podlasiak-feeds/public/temp/data/'), '/fulloffer/', $file);

					if (ftp_put($ftp_connection, $remote_file, $file, FTP_ASCII)) {
						echo "successfully uploaded $file\n";
					} else {
						echo "There was a problem while uploading $file\n";
					}
				}
			}
		}

		ftp_close($ftp_connection);
	}
}

;

function xmlToArray($xml, $options = array())
{
	$defaults = array(
		'namespaceSeparator' => ':',
		'attributePrefix' => '$',
		'alwaysArray' => array(),
		'autoArray' => true,
		'textContent' => '$',
		'autoText' => true,
		'keySearch' => false,
		'keyReplace' => false
	);
	$options = array_merge($defaults, $options);
	$namespaces = $xml->getDocNamespaces();
	$namespaces[''] = null;

	$attributesArray = array();
	foreach ($namespaces as $prefix => $namespace) {
		foreach ($xml->attributes($namespace) as $attributeName => $attribute) {
			if ($options['keySearch']) $attributeName =
				str_replace($options['keySearch'], $options['keyReplace'], $attributeName);
			$attributeKey = $options['attributePrefix']
				. ($prefix ? $prefix . $options['namespaceSeparator'] : '')
				. $attributeName;
			$attributesArray[$attributeKey] = (string)$attribute;
		}
	}
	$tagsArray = array();
	foreach ($namespaces as $prefix => $namespace) {
		foreach ($xml->children($namespace) as $childXml) {
			$childArray = xmlToArray($childXml, $options);
			list($childTagName, $childProperties) = each($childArray);
			if ($options['keySearch']) $childTagName =
				str_replace($options['keySearch'], $options['keyReplace'], $childTagName);
			if ($prefix) $childTagName = $prefix . $options['namespaceSeparator'] . $childTagName;
			if (!isset($tagsArray[$childTagName])) {
				$tagsArray[$childTagName] =
					in_array($childTagName, $options['alwaysArray']) || !$options['autoArray']
						? array($childProperties) : $childProperties;
			} elseif (
				is_array($tagsArray[$childTagName]) && array_keys($tagsArray[$childTagName])
				=== range(0, count($tagsArray[$childTagName]) - 1)
			) {
				$tagsArray[$childTagName][] = $childProperties;
			} else {
				$tagsArray[$childTagName] = array($tagsArray[$childTagName], $childProperties);
			}
		}
	}
	$textContentArray = array();
	$plainText = trim((string)$xml);
	if ($plainText !== '') $textContentArray[$options['textContent']] = $plainText;
	$propertiesArray = !$options['autoText'] || $attributesArray || $tagsArray || ($plainText === '')
		? array_merge($attributesArray, $tagsArray, $textContentArray) : $plainText;
	return array(
		$xml->getName() => $propertiesArray
	);
}

;


function fetchXml($url)
{
	echo 'Pobieranie XML';
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_TIMEOUT, 3600);
	$output = curl_exec($ch);
	curl_close($ch);
	$jsonFiles = glob('/Volumes/Web/podlasiak-feeds/public/temp/data/*');
	$feedFile = glob('/Volumes/Web/podlasiak-feeds/public/temp/*');
	foreach ($feedFile as $file) {
		if (is_file($file)) {
			unlink($file);
		}
	}
	foreach ($jsonFiles as $file) {
		if (is_file($file)) {
			unlink($file);
		}
	}
	echo 'Pobrano XML';
	return $output;
}

;


$xmlContent = fetchXml($url);

file_put_contents($xmlDownloadLocation . 'feed.xml', $xmlContent);


$xml = simplexml_load_file($xmlDownloadLocation . 'feed.xml', "SimpleXMLElement", LIBXML_NOCDATA);

$arrayData = xmlToArray($xml);

foreach ($arrayData as $data => $store) {
	foreach ($store as $name => $content) {
		if ($name == '$timestamp') continue;
		if ($name == 'products') {
			foreach ($content as $products) {
				$splitedProducts = array_chunk($products, $productsPerFile);
				$i = 1;
				foreach ($splitedProducts as $product) {
					file_put_contents($jsonSaveLocation . 'product-' . $i . '.json', json_encode($product, JSON_PRETTY_PRINT));
					$i += 1;
				}
			}
			continue;
		}
		echo 'Zapisano ' . ' ' . $name;
		file_put_contents($jsonSaveLocation . $name . '.json', json_encode($content, JSON_PRETTY_PRINT));
	}
}


try {
	pushToFtp();
} catch (Exception $e) {
	echo $e->getMessage();
}

echo 'Pobrano feed';
