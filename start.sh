find . -name "*.pyc" -exec rm -rf {} \;

xterm -e "python manage.py runserver" &
sudo xterm -e "node sockets/server.js" 
echo "RUNNING"