<?php
$json = file_get_contents('php://input');
$obj = json_decode($json, true);
$server_data = '/home/corleylabppls/experiment_data/gano1';
$path = $server_data."/".$obj["filename"].".csv";
if (substr(realpath(dirname($path)), 0, strlen($server_data))!=$server_data) {
    error_log("attempt to write to bad path: ".$path);
} else {
    $outfile = fopen($path, "a");
    fwrite(
        $outfile,
        sprintf($obj["filedata"])
    );
    fclose($outfile);
}
?>
