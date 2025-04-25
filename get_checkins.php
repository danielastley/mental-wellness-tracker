<?php
header('Content-Type: application/json'); // Tell browser we're sending JSON

// 1. Define the path to the data file
$dataFileDir = __DIR__ . '/data';
$dataFilePath = $dataFileDir . '/user_checkins.json';

// 2. Check if the file exists
if (file_exists($dataFilePath)) {
    // 3. Read the file content
    $jsonData = @file_get_contents($dataFilePath);

    // Check for read errors or empty file
    if ($jsonData === false) {
         http_response_code(500); // Internal Server Error
         echo json_encode(['status' => 'error', 'message' => 'Failed to read data file.']);
         exit;
    }
     if (empty($jsonData)) {
        // File exists but is empty, return empty array
         echo json_encode([]);
         exit;
    }

    // 4. Output the raw JSON content
    // We assume the file contains valid JSON written by save_checkin.php
    echo $jsonData;

} else {
    // 5. File doesn't exist, return an empty JSON array
    echo json_encode([]);
}

?>