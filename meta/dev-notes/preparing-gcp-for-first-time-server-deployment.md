# Prerequisites

1. Create a compute instance with Ubuntu 20.x LTS

# Primary Installation

### Step 1. Log in to Google Compute Engine Instance

If unsure, read https://cloud.google.com/sdk/docs/

### Step 2. Installing nodejs, certbot, pm2
Run commands one by one
```sh
sudo -i
apt update

curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
apt-get install gcc g++ make
apt-get install nodejs

apt-get install software-properties-common
add-apt-repository universe
add-apt-repository ppa:certbot/certbot
apt-get update
apt-get install certbot

npm install pm2 -g
pm2 completion install
```

### Step 3. Getting HTTPS/SSL certificate
Run commands one by one
```sh
certbot certonly
```
This will produce configuration files as detailed - 
```
/etc/letsencrypt/live/single-server.lipi.live/privkey.pem
/etc/letsencrypt/live/single-server.lipi.live/cert.pem
/etc/letsencrypt/live/single-server.lipi.live/chain.pem
/etc/letsencrypt/live/single-server.lipi.live/fullchain.pem
```

### Step 4. Configuring public dir and cloning repository
Run commands one by one
```sh
mkdir /var/www-serve
chmod 777 /var/www-serve

cd /var/www-serve
git clone https://github.com/anvilglobaldynamics/torque --branch master

```
### Step 5. Set up torque-config.json
```sh
nano /root/torque-config.json
```
Copy content from `server/config.json` and paste in above file. This file contains configuration for ssl, server, port, websocket, mongodb connection string and default passwords. Edit the file and update to your needs. Also update path to SSL related files generated on Step 3.

### Step 6. Run the server

```
cd /var/www-serve/torque/server
pm2 start start.js --name "torque-server"
pm2 startup
pm2 save
```

# Notes

1. use `pm2 logs` to view raw logs.

