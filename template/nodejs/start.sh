docker stop project-redis
docker rm project-redis
docker stop project-server
docker rm project-server
docker import project-server.tar redis project-server
docker run --name project-redis -d --restart=always -p 6379:6379 redis
docker run --name project-server --link project-redis:redis -itd --restart=always -p 55552:55552 -v shared:/home/node/app/shared/ project-server
read -p "Press any key to exit."
