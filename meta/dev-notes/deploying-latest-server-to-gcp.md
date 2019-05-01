# Prerequisites

## Google cloud SDK
Make sure you have downloaded and initated Google Cloud SDK. You can download it from https://cloud.google.com/sdk/docs/ (This may take a while, so make sure you plan for that).

After installation, you *might* need to restart your computer/terminal to have the `gcloud` 
command working.

In a terminal, run `gcloud init`. Login using a google account that has access to the clooud console. After logging in, select `anvil-primary` when prompted. If asked about region, select `asia-south1` (region a preferred.)

# Prerequisite (config-production.json)

this file `config-production.json` contains sensitive information and is never committed to the git repo. Collect this file manually and place beside `config.json`.

# Deployment Process

To deploy the server: Run `npm run deploy` inside `torque/server` dir.


# Notes

If you are in a platform where you can not install google cloud sdk for some reason, follow this https://developer.mozilla.org/en-US/docs/Learn/Common_questions/How_do_you_host_your_website_on_Google_App_Engine to use the web shell to deploy.


