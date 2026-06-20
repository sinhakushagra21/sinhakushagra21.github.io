.PHONY: dev embed install

install:
	pip3 install -r requirements.txt

dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

embed:
	python3 scripts/build_embeddings.py
