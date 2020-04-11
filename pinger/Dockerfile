FROM python:slim
WORKDIR "/"
ARG WORKSPACE="/pinger"
RUN mkdir -p $WORKSPACE
COPY requirements.txt $WORKSPACE
RUN pip install -r $WORKSPACE/requirements.txt
COPY . $WORKSPACE
ENV PYTHONPATH "${PYTHONPATH}:../"
CMD ["python", "/pinger/api/Ping.py", "/pinger/config.ini", ">>", "out.log"]
