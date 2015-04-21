<?php

/*
SCRIPT TO RENAME ALL FLAGS DOWNLOADED FROM WIKIPEDIA WITH ISO COUNTRY CODES
SOME 'NOT FOUND' NEED MANUAL CORRECTION
*/

$csv = array_map('str_getcsv', file('country_codes.csv'));

foreach (new DirectoryIterator('countries') as $file) {
    if($file->isDot()) continue;
    $filename = $file->getFilename();
/*     echo $filename.'<br>'; */
    $flag = file_get_contents('countries/'.$filename); 
    $countryname = substr($filename, 0, -4);
    $countryname = substr($countryname, 8);
    if (strcasecmp(substr($countryname,0,4), 'the_') == 0) {
    	$countryname = substr($countryname, 4);
    	}
    $countryname = str_replace('_',' ',$countryname);
    $found = 0;
    foreach ($csv as $key => $value) {
	    if (strcasecmp($csv[$key][0],$countryname) == 0) {
	    	echo $countryname . ' - '.$value[1].'<br>';
	    	file_put_contents('iso/'.$value[1].'.svg', $flag);
			$found = 1;
	    	}
	    }
	if ($found == 0) {
		echo $countryname . ' - NOT FOUND<br>';
	    file_put_contents('iso/'.$countryname.'.svg', $flag);
	   	}
	}
	
?>