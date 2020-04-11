FROM grafana/grafana:6.6.2
ADD ./provisioning /etc/grafana/provisioning
ADD ./config.ini /etc/grafana/config.ini
COPY ./dashboards conf/provisioning/dashboards