# Dockerfile for ClamAV virus scanning
FROM clamav/clamav:latest

RUN freshclam

COPY scan.sh /app/scan.sh
RUN chmod +x /app/scan.sh

ENTRYPOINT ["/app/scan.sh"]
