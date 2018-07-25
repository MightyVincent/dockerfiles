docker stop proj-redis
docker rm proj-redis
docker stop proj-wx-server
docker rm proj-wx-server
docker import proj-wx-server.tar redis proj-wx-server
docker run --name proj-redis -d --restart=always -p 6379:6379 redis
docker run --name proj-wx-server --link proj-redis:redis -itd --restart=always -p 55552:55552 -v shared:/opt/wxapp/shared/ proj-wx-server
read -p "Press any key to exit."