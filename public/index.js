var io = io("http://localhost:3000");
var urlParams = new URLSearchParams(window.location.search);
var userName = urlParams.get("n");
io.emit("user-online", userName);

$(document).ready(function () {
  $("#name-login").text(userName);
});
function searchFriend() {
  $(".left-content").html("");
  var searchName = document.getElementById("acticve-icon");
  searchName.classList.add("ass");
  document.getElementById("overlay").style.display = "block";

}
function search() {
  var input = document.getElementById("myInput");
  var filter = input.value.toLowerCase();
  $(".modal-left").css("display", "block");

  io.emit("search", { name: userName, friendName: filter });
}
io.on("getValuesSearch", (arr) => {
  $(".left-content").html("");
  for (let index = 0; index < arr.length; index++) {
    if (arr[index].name !== userName && !arr[index].isFriend) {
      $(".left-content").append(
        '<div class="list-items">' +
          '<div class="item-search">' +
          '<h3 class="title-center">' +
          arr[index].name +
          "</h3>" +
          '<div class="button" id = "button' +
          index +
          '"  onclick="sendAddFriend(\'' +
          arr[index].name +
          "','" +
          index +
          "')\">Thêm</div>" +
          "</div>" +
          "</div>"
      );
    }
    if (arr[index].name !== userName && arr[index].isFriend) {
      $(".left-content").append(
        '<div class="list-items">' +
          '<div class="item-search">' +
          '<h3 class="title-center">' +
          arr[index].name +
          "</h3>" +
          "</div>" +
          "</div>"
      );
    }
  }
});
// onclick="sendAddFriend(\''+arr[index]+''
function sendAddFriend(name, id) {
  var d = new Date();
  io.emit("add-friend", { user: userName, nameFiend: name, date: d });
  document.getElementById("button" + id).style.visibility = "hidden";
  // document.getElementById("button"+id+"").style.display = "none";
}

io.on("notify-request-friend", (array) => {
  $(".data-modal-add").html("");
  if (array.length != 0) {
    document.getElementById("n-bell").style.display = "block";
    $("#n-bell").text(array.length);
  } else {
    document.getElementById("n-bell").style.display = "none";
  }
  for (let index = array.length - 1; index >= 0; index--) {
    const element = array[index];

    $(".data-modal-add").append(
      ' <li class="item-noti">' +
        '<img src="images/user.png" alt="" class="img-noti">' +
        "<div>" +
        '<div class="over-text">' +
        '<span class="info-noti">Bạn có lời mời kết bạn từ ' +
        element.data.user +
        "</span>" +
        "</div>" +
        "<div>" +
        "<button onclick =\"addFriendAccept('" +
        element.data.user +
        '\')"  class="button cn">Chấp nhận</button>' +
        "<button onclick =\"deleteRequestFriend('" +
        element.data.user +
        '\')" class="button dl">Xoá</button>' +
        "</div>" +
        "</div>" +
        "</li>"
    );
  }
});

function deleteRequestFriend(name) {
  var time = new Date();
  io.emit("delete-request-friend", {
    myName: userName,
    friendName: name,
    time: time,
  });
}
function addFriendAccept(name) {
  var time = new Date();
  io.emit("add-friend-accept", {
    myName: userName,
    friendName: name,
    time: time,
  });
}

function clickAddFriend() {
  $("#noti-contener").css("display", "none");
  var dis = document.getElementById("add-contener").style.display + "";
  if (dis !== "block") {
    document.getElementById("add-contener").style.display = "block";
    document.getElementById("overlay").style.display = "block";
  } else {
    document.getElementById("add-contener").style.display = "none";
    document.getElementById("overlay").style.display = "none";
  }
}
function turnOfffNotiVsAdd() {
  $("#add-contener").css("display", "none");
  $("#noti-contener").css("display", "none");
  document.getElementById("overlay").style.display = "none";
  $(".modal-left").css("display", "none");
  $(".left-content").html("");
  var searchName = document.getElementById("acticve-icon");
  searchName.classList.remove("ass");
}
function clickNotify() {
  $("#add-contener").css("display", "none");
  var dis = document.getElementById("noti-contener").style.display + "";
  if (dis !== "block") {
    io.emit("seen-notify", userName);
    document.getElementById("noti-contener").style.display = "block";
    document.getElementById("overlay").style.display = "block";
  } else {
    document.getElementById("noti-contener").style.display = "none";
    document.getElementById("overlay").style.display = "none";
  }
}
io.on("reject-request-friend", (array) => {
  $(".data-modal-noti").html("");

  var count = 0;

  for (let index = array.length - 1; index >= 0; index--) {
    const element = array[index];

    if (!element.status) {
      count++;
    }
    var date = new Date(element.data.time);
    $(".data-modal-noti").append(
      '<li class="item-noti">' +
        '<img src="images/user.png" alt="" class="img-noti">' +
        "<div>" +
        ' <div class="over-text">' +
        '<span class="info-noti">' +
        element.data.myName +
        " " +
        element.mess +
        "</span>" +
        "</div>" +
        '<span class="time">' +
        date.getHours() +
        "h " +
        date.getMinutes() +
        "p" +
        " " +
        date.getDate() +
        "/" +
        date.getMonth() +
        "/" +
        date.getFullYear() +
        "</span>" +
        "</div>" +
        "</li>"
    );
  }
  if (count != 0) {
    document.getElementById("n-thong-bao").style.display = "block";
    $("#n-thong-bao").text(count);
  } else {
    document.getElementById("n-thong-bao").style.display = "none";
  }
});
io.on("nguoi-lien-he", (thongTinNguoiDung) => {
  var arrayFriend = thongTinNguoiDung.arrayFriend;
  $(".list-status").html("");
  var count = 0;
  for (let index = 0; index < arrayFriend.length; index++) {
    const element = arrayFriend[index];
    let arrayMess = element.arrayMess;
    let nameSend = element.arrayMess[element.arrayMess.length - 1].name;
    if (nameSend === userName) {
      nameSend = "Bạn";
    }
    if (!arrayMess[arrayMess.length - 1].status) {
      count++;
    }
    $(".list-status").append(
      "<li  onclick=\"clickItemLienHe('" +
        element.name +
        "','" +
        element.room +
        "','" +
        "status" +
        index +
        '\')"  class="item-status">' +
        '<div class="user-ava">' +
        " <div>" +
        '<img src="images/user.png" alt="" class="img-friend">' +
        '<span class="status" id="status' +
        index +
        '"></span>' +
        "</div>" +
        "</div>" +
        '<div class="info-status">' +
        "<h3>" +
        element.name +
        "</h3>" +
        "<p>" +
        nameSend +
        ": " +
        element.arrayMess[element.arrayMess.length - 1].mess +
        "</p>" +
        "</div>" +
        "</li>"
    );
    if (!element.status) {
      $("#status" + index).css("display", "none");
    } else {
      $("#status" + index).css("display", "block");
    }
  }
  if (count > 0) {
    $("#n-mes").css("display", "block");
    $("#n-mes").text(count);
  } else {
    $("#n-mes").css("display", "none");
  }
});
var room;
var userFriend;
function clickItemLienHe(name, room, idSpan) {
  $(".chat-list").html("");
  $(".title-center").text(name);
  $(".center").css("visibility", "visible");
  //   alert(idSpan);
  io.emit("join-chat-room", { nameFriend: name, name: userName, room: room });
  userFriend = name;
  var status = document.getElementById(idSpan).style.display;
  if (status === "block") {
    $(".subtitle-center").text("Đang hoạt động");
  } else {
    $(".subtitle-center").text("Không hoạt động");
  }
  //
}
io.on("cap-nhap-list-mess", (friend) => {
  var arrayMess = friend.arrayMess;
  for (let index = 0; index < arrayMess.length; index++) {
    const element = arrayMess[index];
    var mess = element.mess;
    if (element.name === userName) {
      $(".chat-list").append(
        '<div class="chat bubble-right">' + mess + "</div>"
      );
    } else {
      $(".chat-list").append(
        '<div class="chat bubble-left">' + mess + "</div>"
      );
    }
  }

  room = friend.room;
  var element = document.getElementById("out");
  element.scrollTop = element.scrollHeight;
});

function clickSendMess() {
  var mess = $("#input-mess").val().trim();
  if (mess.length > 0) {
    io.emit("send-mess", {
      name: userName,
      userFriend: userFriend,
      mess: mess,
      room: room,
      time: new Date(),
    });
    $("#input-mess").val("");
    io.emit("update-new-mess", { name: userName, nameFiend: userFriend });
  }
}
io.on("nhan-tin-nhan", (data) => {
  if (data.name === userName) {
    $(".chat-list").append(
      '<div class="chat bubble-right">' + data.mess + "</div>"
    );
  } else {
    $(".chat-list").append(
      '<div class="chat bubble-left">' + data.mess + "</div>"
    );
  }
  var element = document.getElementById("out");
  element.scrollTop = element.scrollHeight;
});
//sign out
function signout() {
  io.emit("sign-out", userName);
  window.location = "/";
}
function openLinkCallVideo(isVideo) {
  var h = $(document).height();
  var w = $(document).width();
  var f = $("#name-fiend").text();

  window.open(
    "/call?n=" + userName + "&f=" + f + "&l=f" + "&c=" + isVideo,
    "_blank",
    "width=" + w + ",height=" + h
  );
  // window.open("https://www.w3schools.com", "_blank");
}
var datas;
//data => name, new id
io.on("cuoc-goi-den", (data) => {
  datas = data;
  document.getElementById("cuoc-go-den").style.display = "flex";
  document.getElementById("ten-nguoi-goi").innerHTML =
    data.name + " gọi cho bạn";
});
function batMay() {
  document.getElementById("cuoc-go-den").style.display = "none";

  var h = $(document).height();
  var w = $(document).width();
  window.open(
    "/call?n=" + userName + "&f=" + datas.name + "&l=t&c=" + datas.isVideo,
    "_blank",
    "width=" + w + ",height=" + h
  );
}
function tuChoiKhongNgheMay() {
  document.getElementById("cuoc-go-den").style.display = "none";

  io.emit("tu-choi-khong-nghe-may", datas.id);
}
io.on("huy-cuoc-goi", (data) => {
  document.getElementById("cuoc-go-den").style.display = "none";
});
function hideModalSearch() {
  $(".modal-left").css("display", "none");
  $(".left-content").html("");
  var searchName = document.getElementById("acticve-icon");
  searchName.classList.remove("ass");
  document.getElementById("overlay").style.display = "none";
}
