#!/bin/bash
# PDF Conversion Script for DigiFlow
# Usage: ./convert.sh <input-file> <output-file>
# Converts any supported document format to PDF

INPUT_FILE=$1
OUTPUT_FILE=$2

if [ -z "$INPUT_FILE" ] || [ -z "$OUTPUT_FILE" ]; then
  echo "Usage: $0 <input-file> <output-file>"
  exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
  echo "Error: Input file not found: $INPUT_FILE"
  exit 1
fi

# Convert to PDF using LibreOffice headless
libreoffice --headless --convert-to pdf --outdir "$(dirname "$OUTPUT_FILE")" "$INPUT_FILE"

if [ $? -eq 0 ]; then
  echo "Conversion successful: $OUTPUT_FILE"
else
  echo "Conversion failed"
  exit 1
fi
