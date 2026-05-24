#!/bin/bash
# Virus scanning script for DigiFlow
# Usage: ./scan.sh <file-to-scan>
# Returns 0 if clean, 1 if infected

FILE_TO_SCAN=$1

if [ -z "$FILE_TO_SCAN" ]; then
  echo "Usage: $0 <file-to-scan>"
  exit 1
fi

if [ ! -f "$FILE_TO_SCAN" ]; then
  echo "Error: File not found: $FILE_TO_SCAN"
  exit 1
fi

# Scan the file with ClamAV
clamscan --stdout --no-summary "$FILE_TO_SCAN"

SCAN_RESULT=$?

if [ $SCAN_RESULT -eq 0 ]; then
  echo "Clean: No threats detected"
  exit 0
elif [ $SCAN_RESULT -eq 1 ]; then
  echo "Infected: Threats detected"
  exit 1
else
  echo "Error: Scan failed with error code $SCAN_RESULT"
  exit 2
fi
