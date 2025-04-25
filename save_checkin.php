<?php
header('Content-Type: application/json'); // Tell browser we're sending JSON back

// 1. Define the path to the data file
$dataFileDir = __DIR__ . '/data'; // A subdirectory named 'data'
$dataFilePath = $dataFileDir . '/user_checkins.json';

// 2. Ensure the data directory exists
if (!is_dir($dataFileDir)) {
    if (!mkdir($dataFileDir, 0755, true)) { // Create it recursively with permissions
        http_response_code(500); // Internal Server Error
        echo json_encode(['status' => 'error', 'message' => 'Failed to create data directory. Check permissions.']);
        exit;
    }
}

// 3. Get the incoming data from the POST request body
$jsonData = file_get_contents('php://input');
if ($jsonData === false || empty($jsonData)) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'No data received.']);
    exit;
}

// 4. Decode the incoming JSON data
$newCheckinData = json_decode($jsonData, true); // Decode as associative array
if ($newCheckinData === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON data received: ' . json_last_error_msg()]);
    exit;
}

// Basic validation - ensure timestamp exists (as an example)
if (!isset($newCheckinData['timestamp'])) {
     http_response_code(400); // Bad Request
     echo json_encode(['status' => 'error', 'message' => 'Missing timestamp in submitted data.']);
     exit;
}


// 5. Read existing data from the file
$checkins = []; // Default to empty array
if (file_exists($dataFilePath)) {
    $existingJson = @file_get_contents($dataFilePath); // Use @ to suppress warning if file empty/not found first time
    if ($existingJson !== false && !empty($existingJson)) {
        $decodedData = json_decode($existingJson, true);
        // Check if decoding was successful and it's an array
        if ($decodedData !== null && is_array($decodedData)) {
            $checkins = $decodedData;
        } else {
            // File exists but contains invalid JSON, log error maybe? Start fresh.
             error_log("Warning: Invalid JSON found in " . $dataFilePath . ". Resetting data.");
             $checkins = [];
        }
    }
}

// 6. Add the new check-in data to the array
$checkins[] = $newCheckinData; // Append the new data

// 7. Encode the entire array back to JSON
$updatedJsonData = json_encode($checkins, JSON_PRETTY_PRINT); // Pretty print for readability
if ($updatedJsonData === false) {
     http_response_code(500); // Internal Server Error
     echo json_encode(['status' => 'error', 'message' => 'Failed to encode data to JSON: ' . json_last_error_msg()]);
     exit;
}

// 8. Write the updated JSON back to the file
// Use LOCK_EX for basic concurrency safety (prevents partial writes if hit simultaneously)
$bytesWritten = @file_put_contents($dataFilePath, $updatedJsonData, LOCK_EX);

if ($bytesWritten === false) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['status' => 'error', 'message' => 'Failed to write data to file. Check permissions for ' . $dataFilePath]);
    exit;
}

// 9. Send success response
http_response_code(200); // OK
echo json_encode(['status' => 'success', 'message' => 'Check-in saved successfully.']);

?>