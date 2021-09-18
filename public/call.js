var io = io("http://localhost:3000");

api.setRestToken();
var urlParams = new URLSearchParams(window.location.search);
var userName = urlParams.get("n");
var nameFriend = urlParams.get("f");
var loaiCuocGoi = urlParams.get("l");
var isVideo = urlParams.get("c");
$(document).ready(function () {
  if (loaiCuocGoi === "t") {
    document.getElementById("modal-btn-call").style.display = "none";
  }
});
api.setRestToken();
const client = new StringeeClient();
ketnoi();
async function ketnoi() {
  const userToken = await api.getUserToken(userName);
  // console.log('token',userToken);

  client.on("authen", function (res) {
    console.log("on authen: ", res.userId);
  });
  client.connect(userToken);

  client.on("connect", function () {
    console.log("connected");
  });
}
var callModel;

// nhan cuoc goi
client.on("incomingcall", function (incomingcall) {
  settingCallEvent(incomingcall);
  callModel = incomingcall;
  incomingcall.answer(function (res) {
    console.log("answer res", res);
  });
});
function call() {
  io.emit("call-video", {
    userName: userName,
    friendName: nameFriend,
    isCall: isVideo,
  });

  document.getElementById("modal-btn-call").style.display = "none";

  var call;
  if (isVideo === "t") {
    call = new StringeeCall(client, userName, nameFriend, true);
  } else {
    call = new StringeeCall(client, userName, nameFriend, false);
  }
  callModel = call;
  settingCallEvent(call);
  call.makeCall(function (res) {
    console.log("make call callback: " + JSON.stringify(res));
  });
}
let localStream;
function settingCallEvent(call1) {
  call1.on("addremotestream", function (stream) {
    // reset srcObject to work around minor bugs in Chrome and Edge.
    console.log("addremotestream");
    remoteVideo.srcObject = null;
    remoteVideo.srcObject = stream;
  });

  call1.on("addlocalstream", function (stream) {
    // reset srcObject to work around minor bugs in Chrome and Edge.
    console.log("addlocalstream");
    localVideo.srcObject = null;
    localVideo.srcObject = stream;
    localStream = stream;
  });

  call1.on("signalingstate", function (state) {
    console.log("signalingstate ", state);
    var reason = state.reason;
    $("#callStatus").html(reason);
  });

  call1.on("mediastate", function (state) {
    console.log("mediastate ", state);
  });

  call1.on("info", function (info) {
    console.log("on info:" + JSON.stringify(info));
  });
}
io.on("friend-khong-bat-may", (name) => {
  callModel.hangup(function (res) {
    window.close();
  });
});

function tatMay() {
  callModel.hangup(function (res) {
    io.emit("tat-may-boi-nguoi-goi", {
      userName: userName,
      nameFriend: nameFriend,
    });
    window.close();
  });
}
var isCheck = false;
function toggleVideo() {
  if (isVideo === "f" && !isCheck) {
    callModel.upgradeToVideoCall();
    isCheck = true;
  }
  var onAndOff = localStream.getVideoTracks()[0].enabled;
  if (!onAndOff) {
    localStream.getVideoTracks()[0].enabled = true;
    $(".video").html('<i class="uil uil-video"></i>');
    $(".video").css("background-color", "#4a4e51");
  } else {
    localStream.getVideoTracks()[0].enabled = false;
    $(".video").html('<i class="uil uil-video-slash"></i>');
    $(".video").css("background-color", "red");
  }
}
function toggleAudio() {
  var onAndOff = localStream.getAudioTracks()[0].enabled;
  if (!onAndOff) {
    localStream.getAudioTracks()[0].enabled = true;
    $(".mic").html('<i class="uil uil-microphone">');
    $(".mic").css("background-color", "#4a4e51");
  } else {
    localStream.getAudioTracks()[0].enabled = false;
    $(".mic").html('<i class="uil uil-microphone-slash"></i>');
    $(".mic").css("background-color", "red");
  }
}
$(document).ready(function () {
  $(".video").html('<i class="uil uil-video-slash"></i>');
  $(".video").css("background-color", "red");
});
