#!/bin/bash
set -e
echo "=== Ejecutando SonarQube Scanner ==="
docker run --rm \
  --network host \
  -e SONAR_HOST_URL="${SONAR_HOST_URL:-http://localhost:9000}" \
  -e SONAR_TOKEN="${SONAR_TOKEN}" \
  -v "$(pwd):/usr/src" \
  sonarsource/sonar-scanner-cli
echo "=== Escaneo completado ==="
echo "=== Revisa resultados en http://localhost:9000/dashboard?id=hardwaretrack ==="
