# Prerequisites

1. Make sure you have prepared remote server by following [preparing-gcp-for-first-time-server-deployment.md](preparing-gcp-for-first-time-server-deployment.md)

# Updating the server

### Step 1. Log in to the correct Google Compute Engine Instance

If unsure, read https://cloud.google.com/sdk/docs/

### Step 2. make sure changes are on master branch

As we are using git to transfer files, all changes that need to be deployed
has to be merged to master.

### Step 3. update the server

Run following commands one by one
```sh
sudo -i
cd /var/www-serve/torque/server
git pull
pm2 restart all
```

# Tips

1. use `pm2 logs` to view raw logs.




