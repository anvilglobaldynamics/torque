# Prerequisites

1. Get deployer password by contacting Torque's Owners
2. Get mongodb regular user password by contacting Torque's Owners
3. Collect credentials for github account `to-bot` by contacting Torque's Owners

# Preparing Production Branch

Simple merge the latest `master` branch to the branch named `production`.

# Deployment Process

Login to server ssh terminal.

Go into root by using `sudo -i`.

Log into `deployer` account using `su - deployer`.

Go to `torque` directory using `cd torque`.

Do `git pull`.

Restart server using `pm2 restart torque-server`.
