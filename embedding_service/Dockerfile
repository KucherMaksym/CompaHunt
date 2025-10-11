FROM python:3.11-slim

WORKDIR /app

RUN pip install sentence-transformers flask torch

COPY app.py .

EXPOSE 8000

CMD ["python", "app.py"]