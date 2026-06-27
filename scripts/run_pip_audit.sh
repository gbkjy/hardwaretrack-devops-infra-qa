#!/bin/bash
set -e
mkdir -p qa-artifacts
echo "=== Ejecutando pip-audit (SCA) ==="
pip-audit -r backend/requirements.txt -f json -o qa-artifacts/pip-audit-report.json || true
echo ""
echo "=== Resumen legible ==="
pip-audit -r backend/requirements.txt || true
echo ""
echo "=== Reporte JSON guardado en qa-artifacts/pip-audit-report.json ==="
