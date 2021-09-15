var io = io("http://localhost:3000");
var urlParams = new URLSearchParams(window.location.search);
var userName = urlParams.get("n");
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
  io.emit("search", filter);
}
io.on("getValuesSearch", (arr) => {
  $(".left-content").html("");
  for (let index = 0; index < arr.length; index++) {
    if (arr[index] !== userName) {
      $(".left-content").append(
        '<div class="item-search" onclick="sendAddFriend(\'' +
          arr[index] +
          "')\">" +
          ' <h3 class="title-center"> ' +
          arr[index] +
          "</hh3>" +
          "</div>"
      );
    }
  }
});

function sendAddFriend(name) {
  var d = new Date();
  io.emit("add-friend", { user: userName, nameFiend: name, date: d });
}

io.on("notify-request-friend", (array) => {
  alert("op");
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
  io.emit("delete-request-friend", { myName: userName, friendName: name });
}
function addFriendAccept(name) {
  io.emit("add-friend-accept", { myName: userName, friendName: name });
}
function clickAddFriend(element) {
  var dis = document.getElementById(element).style.display + "";
  if (dis !== "block") {
    document.getElementById(element).style.display = "block";
  } else {
    document.getElementById(element).style.display = "none";
  }
}
io.on("reject-request-friend", (array) => {
  $(".data-modal-noti").html("");
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    $(".data-modal-noti").append(
      '<li class="item-noti">' +
        '<img src="images/user.png" alt="" class="img-noti">' +
        "<div>" +
        ' <div class="over-text">' +
        '<span class="info-noti">' +
        element.myName +
        " " +
        element.mess +
        "</span>" +
        "</div>" +
        '<span class="time">7:50am</span>' +
        "</div>" +
        "</li>"
    );
  }
});
