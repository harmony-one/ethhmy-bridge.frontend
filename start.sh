#/bin/bash

sudo docker stop web
sudo docker run -it --rm -d -p 8080:80 --name web ethhmy-fe-web
