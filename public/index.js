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
}
function search() {
  var input = document.getElementById("myInput");
  var filter = input.value.toLowerCase();
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
          '<div class="button" onclick="sendAddFriend(\'' +
          arr[index].name +
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
function sendAddFriend(name) {
  var d = new Date();
  io.emit("add-friend", { user: userName, nameFiend: name, date: d });
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
function clickAddFriend(element) {
  var dis = document.getElementById(element).style.display + "";

  if (dis !== "block") {
    if (element === "noti-contener") {
      io.emit("seen-notify", userName);
    }
    document.getElementById(element).style.display = "block";
  } else {
    document.getElementById(element).style.display = "none";
  }
}
io.on("reject-request-friend", (array) => {
  $(".data-modal-noti").html("");

  var count = 0;
  for (let index = array.length - 1; index >= 0; index--) {
    const element = array[index];
    if (!element.data.staus) {
      count++;
      console.log(count);
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
    $("#n-thong-bao").text(array.length);
  } else {
    document.getElementById("n-thong-bao").style.display = "none";
  }
});
