
var FCM = require("fcm-node");
var serverKey = require("../../firebase.json"); //put the generated private key path here
var fcm = new FCM(serverKey);

export function enviarPush(title, body, token, data, sound, callback) {
  try {
    var message = {
      to: token,
      notification: {
        icon: "ic_notification",
        badge: "1", // as FCM payload IOS only, set 0 to clear badges
        number: "1",
        sound: sound ? sound : "default",
        title: title ? title : "....",
        body: body ? body : "..."
      },
      data: data ? data : {}
    };
    if (title) {
      message.data.alert = title;
    }
    fcm.send(message, function(err, response) {
      if (err) console.log(err);
      if (callback) callback(message);
    });
  } catch (e) {
    console.log(e);
  }
}
