# Prerequisites

1. Make sure you have prepared remote server by following [preparing-gcp-for-first-time-server-deployment.md](preparing-gcp-for-first-time-server-deployment.md)
2. You need to have Polymer CLI installed. See [local-development-environment-setup](local-development-environment-setup)

## Google cloud SDK
Make sure you have downloaded and initated Google Cloud SDK. You can download it from https://cloud.google.com/sdk/docs/ (This may take a while, so make sure you plan for that).

After installation, you *may* need to restart your computer/terminal to have the `gcloud` 
command working.

In a terminal, run `gcloud init` to log in and select your project.

## Connecting client to your server

Open `torque/client/torque-app.html` and update the `_manageProductionVariables()` method with your server's URL.

# Deployment Process

To deploy the regular (PWA) version: Run `npm run deploy` inside `torque/client` dir.



