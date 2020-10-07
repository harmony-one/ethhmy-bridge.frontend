#/bin/bash

sudo docker pull nginx
sudo docker stop web
sudo docker run -it --rm -d -p 8080:80 --name web -v $(pwd)/artifacts/build:/usr/share/nginx/html nginx
