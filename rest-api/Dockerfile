FROM python:slim
WORKDIR "/rest-api"
COPY dev-requirements.txt $WORKDIR
RUN pip install -r dev-requirements.txt
COPY . $WORKDIR
CMD ["python", "app.py"]