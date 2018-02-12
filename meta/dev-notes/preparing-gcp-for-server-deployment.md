# Prerequisites

1. Create a compute instance with Ubuntu 16.x LTS
2. Add one harddisk called `dbdisk` (preferrably small and SSD)
3. Add one harddisk called `miscdisk` (preferrably large and mechanical)
4. Get deployer password by contacting Torque's Owners
5. Get mongodb regular user password by contacting Torque's Owners
6. Get mongodb admin user password by contacting Torque's Owners
7. Unlock `8540`, `8541`, `27017` ports in GCP

# Tips

1. You can close `nano` by pressing CTRL+X.

# Create User called `deployer`

Go into root by running `sudo -i`

Then create the deployer user called `deployer`. Use the predefined password obtained in Prerequisite 4.
```sh
adduser deployer
```

Add the user to `sudo` group
```sh
usermod -aG sudo deployer
```

Exit root by running `exit`

# Format and Mount Drives

Go into root by running `sudo -i`

List drives using
```sh
fdisk -l
```

Partition 1st drive using
```sh
fdisk /dev/sdb
```
Enter these commands (and ENTER) one by one: `n` `p` `1` `[enter]` `[enter]` `w`

Format 1st drive
```sh
mkfs -t ext3 /dev/sdb1
```

Make room for mouting to /media/
```sh
mkdir /media/dbdisk
```

Run `nano -Bw /etc/fstab` and add the following table
```
/dev/sdb1    /media/dbdisk   ext3    defaults     0        2
```

Run `mount -a` to mount the disk.

Verify by doing `cd /media/dbdisk`

Repeat the above process for the other drive.

```sh
fdisk -l
fdisk /dev/sdc
mkfs -t ext3 /dev/sdc1
mkdir /media/miscdisk
nano -Bw /etc/fstab
```

Put in `/dev/sdc1    /media/miscdisk   ext3    defaults     0        2`

Run
```sh
mount -a
cd /media/miscdisk
```

Exit root by running `exit`

# Make necessary directories

Make `/media/dbdisk/db` using `mkdir /media/dbdisk/db`

Give everyone (including mongodb) access to this dir `sudo chmod -R go+w /media/dbdisk/db`

# Install nodejs

```sh
sudo apt-get update
sudo apt-get install python-software-properties
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
```

# Install mongodb

```sh
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5

echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list

sudo apt-get update

sudo apt-get install -y mongodb-org
```

Open the mongodb config using `sudo nano /etc/mongod.conf` 

Set `dbPath` to `/media/dbdisk/db`

Start mongodb using - 
```sh
sudo service mongod start
```

Do `cat /var/log/mongodb/mongod.log` to verify.

# Enable mongodb security

Connect to mongodb using `mongo`.

Run the following code one by one.
```sh
use torque
db.createUser({
    user: "torqueuser",
    pwd: "PASSWORD YOU COLLECTED IN PREREQUISITE 5",
    roles: [
        { role: "readWrite", db: "torque"}
    ]
});

use admin
db.createUser({
    user: "torqueadmin",
    pwd: "PASSWORD YOU COLLECTED IN PREREQUISITE 6",
    roles: [
         "userAdminAnyDatabase", "readWriteAnyDatabase","dbAdminAnyDatabase", "clusterAdmin"
    ]
});
```
Exit by running `exit`

Open the mongodb config using `sudo nano /etc/mongod.conf` 

Add the following to enable security
```yaml
security:
    authorization: "enabled"
```

Restart mongodb using - 
```sh
sudo service mongod restart
```

Test by connecting to mongo by running `mongo`.

Run `show dbs`. You should get an error `"codeName" : "Unauthorized"`. Exit using `exit`.

Test by connecting to mongo by running 
```sh
mongo --port 27017 -u "torqueadmin" -p "PASSWORD YOU COLLECTED IN PREREQUISITE 6" --authenticationDatabase "admin"
```
Run `show dbs`. You should see a list of databases. Exit using `exit`.

# Prepare directory and repo and config.json

Go into root by running `sudo -i`

Switch to `deployer` by running `su - deployer`

go to your home folder by running
```
cd ~
```

clone the remote repository's `production` branch. Use the credentials for to-bot
```
git clone https://github.com/BDEMR/<name-of-repository>.git --branch production --single-branch
```

Navigate to the server directory `cd torque/server`

Install dependencies by running `npm install`

Make sure it runs by running `npm start`. You should get an authorization related error.

Run
```
cp ~/torque/server/config.json ~/torque-config.json
nano ~/torque-config.json
```
Change `path` to the following (replace PASSWORD with regular password) -
```
mongodb://torqueuser:PASSWORD@localhost:27017/torque?authSource=torque
```

Test by running `npm start`.

# Testing progress so far

At this point, you should be able to go to http://server.torque.live:8540/ and see `Cannot GET /`

# Install and run pm2

Install pm2 by running `sudo npm install -g pm2`

Navigate to server directory `cd ~/torque/server`

Run `pm2 start start.js --name "torque-server"`


Run `pm2 logs` to see the logs and confirm everything is running.

Run `pm2 startup systemd`. It'll output a code similar to - `sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u deployer --hp /home/deployer`

Run that code.

Run `pm2 save`

# Testing progress so far

At this point, you should restart the server machine. Wait a while and then you should be able to go to http://server.torque.live:8540/ and see `Cannot GET /`

Connect to terminal again and run `pm2 logs` to see the logs.

# Alternative way to keep mongodb server running

If after restarting your server, mongod does not start (or closes soon after starting) then you have encourtered a bug in mongodb's startup script. Currently there are no easy fixes for that. Best way to bypass that is to use pm2 to run mongodb instead of as a service.

Run the following commands one by one - 

```sh
sudo chmod -R a+rwX /var/log/mongodb
sudo chmod -R a+rwX /var/lib/mongodb
sudo chmod -R a+rwX /media/dbdisk
sudo chown -R deployer /media/dbdisk
pm2 start mongod --name "mongodb-server" -x -- --config /etc/mongod.conf
pm2 save
```

# Debugging and Common Commands

If you see that mongodb is not running, it maybe an issue with db locks. Remove the lock file using `sudo rm -rf /var/lib/mongodb/mongod.lock`

/usr/bin/mongod --config /etc/mongod.conf
sudo nano /lib/systemd/system/mongod.service
sudo nano /etc/mongod.conf
cat /var/log/mongodb/mongod.log
sudo systemctl daemon-reload
sudo service mongod start
processManagement: { fork: true, pidFilePath: "/var/run/mongodb/mongodb.pid" }
sudo chmod a+rwx /var/log/mongodb
sudo chmod -R a+rwX /var/log/mongodb
sudo chmod -R a+rwX /var/lib/mongodb
sudo chmod -R a+rwX /media/dbdisk
sudo chown -R deployer /media/dbdisk
cd /var/log/mongodb
sudo chown -R mongodb:mongodb .
cd /var/lib/mongodb
sudo chown -R mongodb:mongodb .
pm2 start mongod --name "mongodb-server" -x -- --config /etc/mongod.conf

