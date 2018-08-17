
### step 1
Set up cordova and android studio as explained here - https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html

### step 2
Create cordova project

```sh
cordova create TorqueApp com.torque.torqueapp TorqueApp
cd TorqueApp
cordova platform add android
```

### step 3
Run `npm run compile-android` inside `torque/client` dir.

## step 4
Copy `torque/client/build/custom-es5-android` to `TorqueApp/www`

## step 5
Run the following in `TorqueApp` dir

```sh
cordova build android
cordova run android
```