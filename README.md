#Pokernet
The pokernet game requires python and node.js function. The server end uses the django framework for the general application and a node.js instance running to handle games and logic.
Several dependencies are also required on the server, including django for python and several libraries for node.js

##Install

### Python
Python can be downloaded and installed to your system from https://www.python.org/

#### Django
Django may be installed on the server by using
>git clone git://github.com/django/django.git django-trunk

and then

>sudo pip install -e django-trunk/

#### Django Application Dependencies
We require the Pillow module, to install:
> pip install Pillow


### Node.js
Node.js can be downloaded and installed to your system from  http://nodejs.org/

#### Node.js Applications
Pokernet uses several node.js applications including express, handranker, and socket.io. to instal them, use npm:
>npm -g install express handranker socket.io

then cd to the /sockets/ directory and run 

>npm link expres handranker socket.io

### liteSQL Database
pokernet currently utilizes the liteSQL database, to create, navigate to the application directory and run:
>python manage.py syncdb

## Development
To run both server and client locally during development, a script is provided that will run both the node.js and django dev server. To use, simply cd into the project directory and run:
> ./start.sh

## Deployment
Various deployment strategies exist, however, note that the current version should not be used on a production server as many security features have not been implemented.

### Port and Address Configuration
There are several steps required to ensure that the server/client will communicate.

On line 4 of /sockets/server.js, edit:
> , server = app.listen(8081)

On line 23 of /static/js/game.js
> var socket = io.connect('127.0.0.1:8081');

and on line 157 of /tables/templates/game.html:
><script src="http://127.0.0.1:8081/socket.io/socket.io.js"></script>

Localhost should be replaced with the server address. Any open port can be utilized

### Django with WSGI
Information on deploying the Django application on your server with WSGI can be found at https://docs.djangoproject.com/en/dev/howto/deployment/wsgi/

You may need to setup your apache Virtual Host file similarly:
>DocumentRoot /var/www/hyobyun.com

>ServerName Poker

>WSGIScriptAlias / /var/djangoProjects/pokernet/pokernet/wsgi.py

>Alias /static /var/djangoProjects/pokernet/static/

><Directory "/var/www/hyobyun.com">

>allow from all

>Options +Indexes

><Files wsgi.py>

>Order deny,allow

>Allow from all

></Files>

></Directory>

### Node.js
Not much has to be done to deploy the node.js server. You may simply run:
>forever node sockets/server.js

