<?php
# $url = 'https://files.lazienka-rea.com.pl/feed-small.xml';
$url = 'https://lazienka-rea.com.pl/feed/generate/full_offer';
$xmlDownloadLocation = '../../public/temp/';
$jsonSaveLocation = '../../public/temp/data/';
$productsPerFile = 200;


function xmlToArray($xml, $options = array())
{
    $defaults = array(
        'namespaceSeparator' => ':',//you may want this to be something other than a colon
        'attributePrefix' => '$',   //to distinguish between attributes and nodes with the same name
        'alwaysArray' => array(),   //array of xml tag names which should always become arrays
        'autoArray' => true,        //only create arrays for tags which appear more than once
        'textContent' => '$',       //key used for the text content of elements
        'autoText' => true,         //skip textContent key if node has no attributes or child nodes
        'keySearch' => false,       //optional search and replace on tag and attribute names
        'keyReplace' => false       //replace values for above search values (as passed to str_replace())
    );
    $options = array_merge($defaults, $options);
    $namespaces = $xml->getDocNamespaces();
    $namespaces[''] = null; //add base (empty) namespace

    //get attributes from all namespaces
    $attributesArray = array();
    foreach ($namespaces as $prefix => $namespace) {
        foreach ($xml->attributes($namespace) as $attributeName => $attribute) {
            //replace characters in attribute name
            if ($options['keySearch']) $attributeName =
                str_replace($options['keySearch'], $options['keyReplace'], $attributeName);
            $attributeKey = $options['attributePrefix']
                . ($prefix ? $prefix . $options['namespaceSeparator'] : '')
                . $attributeName;
            $attributesArray[$attributeKey] = (string)$attribute;
        }
    }

    //get child nodes from all namespaces
    $tagsArray = array();
    foreach ($namespaces as $prefix => $namespace) {
        foreach ($xml->children($namespace) as $childXml) {
            //recurse into child nodes
            $childArray = xmlToArray($childXml, $options);
            list($childTagName, $childProperties) = each($childArray);

            //replace characters in tag name
            if ($options['keySearch']) $childTagName =
                str_replace($options['keySearch'], $options['keyReplace'], $childTagName);
            //add namespace prefix, if any
            if ($prefix) $childTagName = $prefix . $options['namespaceSeparator'] . $childTagName;

            if (!isset($tagsArray[$childTagName])) {
                //only entry with this key
                //test if tags of this type should always be arrays, no matter the element count
                $tagsArray[$childTagName] =
                    in_array($childTagName, $options['alwaysArray']) || !$options['autoArray']
                        ? array($childProperties) : $childProperties;
            } elseif (
                is_array($tagsArray[$childTagName]) && array_keys($tagsArray[$childTagName])
                === range(0, count($tagsArray[$childTagName]) - 1)
            ) {
                //key already exists and is integer indexed array
                $tagsArray[$childTagName][] = $childProperties;
            } else {
                //key exists so convert to integer indexed array with previous value in position 0
                $tagsArray[$childTagName] = array($tagsArray[$childTagName], $childProperties);
            }
        }
    }

    //get text content of node
    $textContentArray = array();
    $plainText = trim((string)$xml);
    if ($plainText !== '') $textContentArray[$options['textContent']] = $plainText;

    //stick it all together
    $propertiesArray = !$options['autoText'] || $attributesArray || $tagsArray || ($plainText === '')
        ? array_merge($attributesArray, $tagsArray, $textContentArray) : $plainText;

    //return node as array
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

    $files = glob('../../public/temp/data/*');
    $feedFile = glob('../../public/temp/*');
    foreach ($feedFile as $file) {
        if (is_file($file)) {
            unlink($file);

        }
    }
    foreach ($files as $file) {
        if (is_file($file)) {
            unlink($file);

        }
    }
    echo 'Pobrano XML';
    return $output;
}


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
        echo 'Zapisano ' . ' ' . $name . '\n';
        file_put_contents($jsonSaveLocation . $name . '.json', json_encode($content, JSON_PRETTY_PRINT));

    }
}
$today = date("Y-m-d_H-i-s");
file_put_contents('log_' . $today . '.txt', '');

echo 'Pobrano feed';
