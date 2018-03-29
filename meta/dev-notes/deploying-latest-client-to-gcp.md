# Prerequisites

## Google cloud SDK
Make sure you have downloaded and initated Google Cloud SDK. You can download it from https://cloud.google.com/sdk/docs/ (This may take a while, so make sure you plan for that).

After installation, you *might* need to restart your computer/terminal to have the `gcloud` 
command working.

In a terminal, run `gcloud init`. Login using a google account that has access to the clooud console. After logging in, select `server-stations-3` when prompted. If asked about region, select `asia-south1` (region a preferred.)

## Polymer CLI

See [dev-setup.md](dev-setup.md)

# Deployment Process

To deploy the regular version: Run `npm run deploy` inside `torque/client` dir.

To deploy the progressive web app: Run `npm run deploy-pwa` inside `torque/client` dir.

# Notes

If you are in a platform where you can not install google cloud sdk for some reason, follow this https://developer.mozilla.org/en-US/docs/Learn/Common_questions/How_do_you_host_your_website_on_Google_App_Engine to use the web shell to deploy.

You can probably use the web shell to install polymer too. (untested)

If you are receiving an error mentioning there are too many files, delete './build/custom-es5-android' dir



