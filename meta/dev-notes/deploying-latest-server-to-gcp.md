# Prerequisites

2. Collect credentials for github account `to-bot` by contacting dev admin.

# Updating the server

### Step 0. Log in to the correct Google Compute Engine Instance

If unsure, read https://cloud.google.com/sdk/docs/

### Step 1. make sure changes are on master branch

As we are using git to transfer files, all changes that need to be deployed
has to be merged to master.

### Step 2. 

Run commands one by one
```sh
sudo -i
cd /var/www-serve/torque/server
git pull
pm2 restart all
```

# Notes

1. use `pm2 logs` to view raw logs.




