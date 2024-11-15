redeploy:
	docker stop orda_api && docker container prune && docker rmi orda-api
	docker build --no-cache -t orda-api .
	docker run --restart always -d --name orda_api -p 3021:3000 orda-api

deploy:
	git pull
	docker compose up --no-deps -d --build