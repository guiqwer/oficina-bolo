#!/bin/sh
set -e
cat > /usr/share/nginx/html/config.js <<EOF
window.__API_BASE__ = "${API_BASE_URL:-}";
window.__AUTH_ENABLED__ = "${AUTH_ENABLED:-true}" !== "false";
window.__KEYCLOAK_URL__ = "${KEYCLOAK_PUBLIC_URL:-}";
window.__KEYCLOAK_REALM__ = "${KEYCLOAK_REALM:-pdc-generated}";
window.__KEYCLOAK_CLIENT_ID__ = "${KEYCLOAK_CLIENT_ID:-pdc-generated-app}";
EOF
