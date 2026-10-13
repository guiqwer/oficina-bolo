FROM quay.io/keycloak/keycloak:26.3.3 AS builder

ENV KC_DB=postgres
ENV KC_CACHE=local
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_HTTP_RELATIVE_PATH=/auth
ENV KC_HTTP_MANAGEMENT_RELATIVE_PATH=/
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.3.3

COPY --from=builder /opt/keycloak/ /opt/keycloak/
COPY pdc-generated-realm.json /opt/keycloak/data/import/pdc-generated-realm.json
