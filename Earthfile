VERSION 0.6
WORKDIR /contrib

prepare:
  FROM python:3.8
  COPY electricitymap ./electricitymap
  COPY parsers ./parsers
  COPY validators ./validators
  COPY config ./config
  COPY scripts ./scripts
  COPY pyproject.toml .
  RUN pip install poetry==1.1.12
  RUN poetry config virtualenvs.create false
  RUN poetry install

test:
  FROM +prepare
  COPY tests ./tests
  RUN poetry run check

artifact:
  FROM +prepare
  SAVE ARTIFACT .
