
# Secrets

MONGO_PRIMARY_ADMIN_PASSWORD = MONGO_PRIMARY_ADMIN_PASSWORD
MONGO_TORQUE_SERVER_PASSWORD = MONGO_TORQUE_SERVER_PASSWORD
MONGO_TORQUE_ADMIN_PERSONNEL_PASSWORD = MONGO_TORQUE_ADMIN_PERSONNEL_PASSWORD

# Compute Engine Setup

1. Create a compute engine with one extra drive for storage.
2. Use template Ubunutu 18.04 LTS.
3. Open port 27017

# Setting up

## go root

```
sudo -i
```

## mongodb install

```
sudo apt update
sudo apt install -y mongodb
```

## mongodb check status
```
sudo systemctl status mongodb
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
cat /var/log/mongodb/mongodb.log
```

## prepare external disk

`fdisk -l` to show the partitions and then -

```
fdisk /dev/sdb

  n

  p 

  1

  [enter]

  [enter]

   w
```

```sh
mkfs.ext4 /dev/sdb1
# FALLBACK: mkfs -t ext3 /dev/sdb1
```
```
mkdir /media/mongodisk
```

open `nano -Bw /etc/fstab` and add
```
  /dev/sdb1    /media/mongodisk   ext4    defaults     0        2
```
```
mount -a
```

```
mkdir /media/mongodisk/db
chown mongodb:mongodb /media/mongodisk/db
```

Open mongodb config file using `nano /etc/mongodb.conf` and change the following - 

```js
dbpath=/media/mongodisk/db
```

Restart mongodb using - `sudo systemctl restart mongodb`.

## create users

Connect using `mongo` and run -

```js
use admin
db.createUser(
  {
    user: "primaryadmin",
    pwd: "MONGO_PRIMARY_ADMIN_PASSWORD",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" },
      'readWriteAnyDatabase',
      'dbAdminAnyDatabase',
      'clusterAdmin' 
    ]
  }
)

use torque
db.createUser({
    user: "torque-server",
    pwd: "MONGO_TORQUE_SERVER_PASSWORD",
    roles: [
        { role: "readWrite", db: "torque"}
    ]
});

use torque
db.createUser({
    user: "torque-admin",
    pwd: "MONGO_TORQUE_ADMIN_PERSONNEL_PASSWORD",
    roles: [
        { role: "readWrite", db: "torque"}
    ]
});

exit
```

Open mongodb config file using `nano /etc/mongodb.conf` and change the following - 

```js
auth = true
```

Restart mongodb using - `sudo systemctl restart mongodb`

Test connection using `mongo -u primaryadmin -p MONGO_PRIMARY_ADMIN_PASSWORD --authenticationDatabase admin`

## accessing from outside of the compute instance

Open mongodb config file using `nano /etc/mongodb.conf` and change the following - 

```sh
bind_ip = 0.0.0.0, 127.0.0.1, 10.160.0.2, 35.200.184.65
# Here the last 2 ips are internal ip and external ip assigned on the GCP instance.
```

Restart mongodb using - `sudo systemctl restart mongodb`

Test by running these from your local machine -

```sh
mongo -u primaryadmin -p MONGO_PRIMARY_ADMIN_PASSWORD --authenticationDatabase admin --host 35.200.184.65
```

# Tips

## to inspect disk storage

```sh
apt install ncdu
```
```sh
ncdu 
```

## mongodb controls
```sh
sudo systemctl stop mongodb
sudo systemctl start mongodb
sudo systemctl restart mongodb
sudo systemctl disable mongodb
sudo systemctl enable mongodb
```