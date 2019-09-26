
(function (window) {
  'use strict';

  function registerServiceWorkerIfNeeded(cbfn) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/notifications-sw.js', { scope: '/' })
        .then(registration => {
          console.log('Registration successful, scope is:', registration.scope);
          cbfn();
        })
        .catch(error => {
          console.log('Service worker registration failed, error:', error);
        });
    } else {
      console.log("Service worker feature is not available");
    }
  }

  function getNotificationPermission(cbfn) {
    if (Notification.permission === "granted") {
      console.log("Notification permission granted");
      cbfn();
    } else if (Notification.permission === "blocked") {
      /* the user has previously denied push. Can't reprompt. */
      console.log("Notification Permanently Disabled");
    } else {
      /* show a prompt to the user */
      Notification.requestPermission(function (status) {
        console.log('Notification permission status:', status);
        cbfn();
      });
    }
  }

  function displayTestNotification() {
    if (Notification.permission == 'granted') {
      navigator.serviceWorker.getRegistration().then(function (reg) {
        reg.showNotification('Hello world!');
      });
    }
  }

  function subscribeToPush(cbfn) {
    function urlBase64ToUint8Array(base64String) {
      var padding = '='.repeat((4 - base64String.length % 4) % 4);
      var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

      var rawData = window.atob(base64);
      var outputArray = new Uint8Array(rawData.length);

      for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    navigator.serviceWorker.ready.then(function (reg) {
      console.log("Attempting subscription");
      reg.pushManager.subscribe({
        userVisibleOnly: true,
        // applicationServerKey: urlBase64ToUint8Array('BGMtF0W4Ijk1TBjbdfssm3V0wWjZ1B_w17Q0VEYbVzRWKAA4jWckvePehOE2jxo-pFXEwLa6K_uRaEYZ0i-1OJQ')
      }).then(function (sub) {
        console.log('Endpoint URL: ', sub.endpoint);
        cbfn(sub);
      }).catch(function (e) {
        if (Notification.permission === 'denied') {
          console.warn('Permission for notifications was denied');
        } else {
          console.log(e.message)
          console.error('Unable to subscribe to push', e);
        }
      });
    })
  }

  function getPushSubscription(cbfn) {
    navigator.serviceWorker.ready.then(function (reg) {

      reg.pushManager.getSubscription().then(function (sub) {
        if (sub === null) {
          // Update UI to ask user to register for Push
          console.log('Not subscribed to push service!');
          subscribeToPush((sub) => {
            cbfn(sub);
          });
        } else {
          // We have a subscription, update the database
          console.log('Subscription object: ', sub);
          cbfn(sub);
        }
      });

    });
  }

  registerServiceWorkerIfNeeded(() => {
    getNotificationPermission(() => {
      // displayTestNotification();
      getPushSubscription(sub => {

      });
    });
  });









})(window);


// notification ==========================================================================
