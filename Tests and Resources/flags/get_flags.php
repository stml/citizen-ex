<?php

/*
SCRIPT TO DOWNLOAD ALL FLAGS FROM WIKIPEDIA AS SVG
THROWS SOME ERRORS DUE TO REDIRECTS - THESE MUST BE DOWNLOADED MANUALLY
*/

if (($handle = fopen("flag_urls.csv", "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $flag = file_get_contents($data[2]);   
        file_put_contents('countries/'.$data[1].'.svg', $flag);
        echo "<br><br>";
    }
    fclose($handle);
}
?>