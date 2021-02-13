# Prerequisites

1. Make sure you have prepared remote server by following [preparing-gcp-for-first-time-server-deployment.md](preparing-gcp-for-first-time-server-deployment.md)

## Google cloud SDK
Make sure you have downloaded and initated Google Cloud SDK. You can download it from https://cloud.google.com/sdk/docs/ (This may take a while, so make sure you plan for that).

After installation, you *may* need to restart your computer/terminal to have the `gcloud` 
command working.

In a terminal, run `gcloud init` to log in and select your project.

## Polymer CLI

See [local-development-environment-setup](local-development-environment-setup)

## `app.yaml` configuration

The `app.yaml` file is provided in the `torque-server/` directory.

# Deployment Process

To deploy the regular (PWA) version: Run `npm run deploy` inside `torque/client` dir.



