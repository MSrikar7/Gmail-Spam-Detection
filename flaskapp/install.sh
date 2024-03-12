#!/bin/bash

pip install -r requirements.txt

# Path to your Flask application directory
FLASK_APP_DIR=$(pwd)

# Name of the Systemd service file
SERVICE_FILE="flask1.service"

# Username and group for the service
USERNAME=$(whoami)
GROUP=$(id -g -n)

# Python interpreter and Gunicorn executable path
PYTHON_EXEC="/usr/bin/python3"


# Create the Systemd service file
echo "[Unit]
Description=Flask application with Gunicorn
After=network.target

[Service]
User=$USERNAME
Group=$GROUP
WorkingDirectory=$FLASK_APP_DIR
ExecStart=$PYTHON_EXEC -m gunicorn -w 4 -b 0.0.0.0:5000 main:app
Restart=always

[Install]
WantedBy=multi-user.target" | sudo tee /etc/systemd/system/$SERVICE_FILE > /dev/null

# Reload Systemd and start the service
sudo systemctl daemon-reload
sudo systemctl start $SERVICE_FILE
sudo systemctl enable $SERVICE_FILE

echo "Service installed and started successfully!"

