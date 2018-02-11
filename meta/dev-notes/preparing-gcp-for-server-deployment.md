# Prerequisites

1. Create a compute instance with Ubuntu 16.x LTS
2. Add one harddisk called `dbdisk` (preferrably small and SSD)
3. Add one harddisk called `miscdisk` (preferrably large and mechanical)

# Format and Mount Drives

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

Open the mongodb config using `nano /etc/mongod.conf` 

Set `dbPath` to `/media/dbdisk/db`

Start mongodb using - 
```sh
sudo service mongod start
```

Do `cat /var/log/mongodb/mongod.log` to verify.



