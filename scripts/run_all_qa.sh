#!/bin/bash
set -e
mkdir -p qa-artifacts

echo "============================================"
echo "  FLUJO COMPLETO DE QA — HardwareTrack"
echo "============================================"
echo ""

echo "=== [1/5] Pytest + Cobertura (RNF: Facilidad de prueba) ==="
cd backend
pytest --cov=. --cov-report=term --cov-report=html:../qa-artifacts/htmlcov --cov-report=xml:coverage.xml -v 2>&1 | tee ../qa-artifacts/pytest-output.txt
cd ..
echo ""

echo "=== [2/5] pip-audit (RNF: Integridad y seguridad — SCA) ==="
bash scripts/run_pip_audit.sh
echo ""

echo "=== [3/5] SonarQube Scanner (RNF: Integridad y seguridad — SAST) ==="
bash scripts/run_sonar_scanner.sh 2>&1 | tee qa-artifacts/sonar-scanner-output.txt
echo ""

echo "=== [4/5] k6 Fiabilidad (RNF: Fiabilidad — 30 VUs, 15 min) ==="
k6 run tests/stress_test_fiabilidad.js 2>&1 | tee qa-artifacts/k6-fiabilidad.txt
echo ""

echo "=== [5/5] k6 Eficiencia (RNF: Eficiencia — 20 req/s, P95 < 250ms) ==="
k6 run tests/stress_test_eficiencia.js 2>&1 | tee qa-artifacts/k6-eficiencia.txt
echo ""

echo "============================================"
echo "  EVIDENCIA GENERADA"
echo "============================================"
ls -la qa-artifacts/
echo ""
echo "NOTA: Falta evidencia manual:"
echo "  - qa-artifacts/sonarqube-report.pdf (screenshot del dashboard de SonarQube)"
echo "  - qa-artifacts/uptime-kuma-screenshot.png (screenshot de Uptime Kuma)"
echo "  Estos se capturan manualmente desde el navegador."
