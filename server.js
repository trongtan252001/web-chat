const express = require("express");
const { uuid } = require("uuidv4");

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

const port = 3000;

const server = require("http").Server(app);
var io = require("socket.io")(server);

server.listen(port);

app.get("/", (req, res) => {
  res.render("signin");
});
app.get("/home", (req, res) => {
  res.render("index");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});

var thongTinNguoiDung = [];
thongTinNguoiDung.push(new nguoiDung("linh", "123"));
thongTinNguoiDung.push(new nguoiDung("h1", "123"));
thongTinNguoiDung.push(new nguoiDung("h12", "123"));
thongTinNguoiDung.push(new nguoiDung("h123", "123"));
thongTinNguoiDung.push(new nguoiDung("Hau", "123"));
io.on("connection", (socket) => {
  socket.on("user-online", (username) => {
    userOnline(username, socket);
  });
  socket.on("dangKy", (data) => {
    dangKy(data.name, data.password, socket);
  });
  socket.on("dangNhap", (data) => {
    dangNhap(data.name, data.password, socket);
  });
  socket.on("search", (data) => {
    searchFriend(data, socket);
  });
  socket.on("add-friend", (data) => {
    friendRequest(data, socket);
  });
  socket.on("delete-request-friend", (data) => {
    deleteRequestFriend(data, socket);
  });
  socket.on("add-friend-accept", (data) => {
    addFriendAccept(data, socket);
  });
  socket.on("seen-notify", (name) => {
    seenNotify(name, socket);
  });
});
//da xem thong bao
function seenNotify(name, socket) {
  var array = getUser(name).arrayNotify;
  for (let index = array.length - 1; index >= 0; index--) {
    const element = array[index];
    if (element.status) {
      socket.emit("reject-request-friend", array);
      return;
    }
    element.status = true;
  }
  socket.emit("reject-request-friend", array);
}

// dong y loi moi ket ban
function addFriendAccept(data, socket) {
  var room = uuid();

  // add vao chinh minh
  for (var i = 0; i < thongTinNguoiDung.length; i++) {
    if (thongTinNguoiDung[i].name === data.myName) {
      var friends = new friend(data.friendName, room);
      friends.arrayMess.push({
        name: data.friendName,
          mess: "Các bạn đã là bạn bè với nhau",
          status: false,
          date: new Date()
      });
      thongTinNguoiDung[i].arrayFriend.push(friends);
      var array = thongTinNguoiDung[i].arrayFriendRequest;
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element.data.user === data.friendName) {
          array.splice(index, 1);
         
          socket.emit(
            "notify-request-friend",
            thongTinNguoiDung[i].arrayFriendRequest
          );

          socket.emit("nguoi-lien-he", thongTinNguoiDung[i]);
          var addFriendAccept = getUser(data.friendName).arrayNotify;
          addFriendAccept.push({
            data: data,
            status: false,
            mess: "Đã chấp nhận lời mời của bạn",
          });
          io.to(getIdUser(data.friendName)).emit(
            "reject-request-friend",
            addFriendAccept
          );
          break;
        }
      }
    }
  }
  // add cho thang ban
  for (var i = 0; i < thongTinNguoiDung.length; i++) {
    if (thongTinNguoiDung[i].name === data.friendName) {
      var friends = new friend(data.myName, room);
      friends.arrayMess.push({
        name: data.myName,
        mess: "Các bạn đã là bạn bè với nhau",
        status: false,
        date: new Date()

      })
      thongTinNguoiDung[i].arrayFriend.push(friends );
      
      
      io.to(thongTinNguoiDung[i].id).emit(
        "nguoi-lien-he",
        thongTinNguoiDung[i]
      );

      // console.log(thongTinNguoiDung[i].arrayFriend);

      return;
    }
  }
}

//search ban be
function searchFriendForName(name, nameFriend) {
  console.log("name: " + name + " namefriend: " + nameFriend);
  var arrayFriend = getUser(name).arrayFriend;
  for (let index = 0; index < arrayFriend.length; index++) {
    const element = arrayFriend[index];
    if (element.name === nameFriend) {
      console.log('serch',element);
      return element;
    }
  }
  return null;
}

//xoa loi moi ket ban
//data: myName, friendName
//element: data(user => nameFiend ,nameFiend => user ,date) ,status
function deleteRequestFriend(data, socket) {
  for (var i = 0; i < thongTinNguoiDung.length; i++) {
    if (thongTinNguoiDung[i].name === data.myName) {
      var array = thongTinNguoiDung[i].arrayFriendRequest;
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element.data.user === data.friendName) {
          array.splice(index, 1);
          socket.emit(
            "notify-request-friend",
            thongTinNguoiDung[i].arrayFriendRequest
          );
          var addFriendAccept = getUser(data.friendName).arrayNotify;
          addFriendAccept.push({
            data: data,
            status: false,
            mess: "Đã từ chối lời mời kết bạn",
          });
          io.to(getIdUser(data.friendName)).emit(
            "reject-request-friend",
            addFriendAccept
          );
          return;
        }
      }
    }
  }
}
//gui loi moi ket ban
function friendRequest(data, socket) {
  var name = data.nameFiend;
  for (let index = 0; index < thongTinNguoiDung.length; index++) {
    if (
      thongTinNguoiDung[index].name === name &&
      !checkFriendRequest(name, data.user)
    ) {
      thongTinNguoiDung[index].arrayFriendRequest.push({
        data: data,
        status: true,
      });
      io.to(thongTinNguoiDung[index].id).emit(
        "notify-request-friend",
        thongTinNguoiDung[index].arrayFriendRequest
      );
      return;
    }
  }
}
// search nguoi dung
function getUser(name) {
  for (let index = 0; index < thongTinNguoiDung.length; index++) {
    if (thongTinNguoiDung[index].name === name) {
      return thongTinNguoiDung[index];
    }
  }
  return null;
}

//lay id nguoi dung
function getIdUser(name) {
  for (let index = 0; index < thongTinNguoiDung.length; index++) {
    if (thongTinNguoiDung[index].name === name) {
      return thongTinNguoiDung[index].id;
    }
  }
  return "";
}
// kem tra xem da gui loi moi ket ban chua
function checkFriendRequest(name, user) {
  for (let index = 0; index < thongTinNguoiDung.length; index++) {
    if (thongTinNguoiDung[index].name === name) {
      var array = thongTinNguoiDung[index].arrayFriendRequest;
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element.data.user === user) {
          return true;
        }
      }
    }
  }
  return false;
}

// user vao web (sang online)
function userOnline(name, socket) {
  for (let index = 0; index < thongTinNguoiDung.length; index++) {
    if (thongTinNguoiDung[index].name === name) {
      thongTinNguoiDung[index].id = socket.id;
      socket.emit("nguoi-lien-he", thongTinNguoiDung[index]);
      socket.emit(
        "notify-request-friend",
        thongTinNguoiDung[index].arrayFriendRequest
      );
      io.to(getIdUser(name)).emit(
        "reject-request-friend",
        thongTinNguoiDung[index].arrayNotify
      );
      return;
    }
  }
}

// tiem kiem nguoi dung de ket ban
function searchFriend(data, socket) {
  var arr = [];

  for (let index = 0; index < thongTinNguoiDung.length; index++) {
    var tenCuaMang = thongTinNguoiDung[index].name.toLowerCase();
    if (
      tenCuaMang.startsWith(data.friendName) &&
      (isFriend(data.name, thongTinNguoiDung[index].name) ||
        checkFriendRequest(thongTinNguoiDung[index].name, data.name))
    ) {
      arr.push({ name: thongTinNguoiDung[index].name, isFriend: true });
    }
    if (
      tenCuaMang.startsWith(data.friendName) &&
      !isFriend(data.name, thongTinNguoiDung[index].name) &&
      !checkFriendRequest(thongTinNguoiDung[index].name, data.name)
    ) {
      arr.push({ name: thongTinNguoiDung[index].name, isFriend: false });
      // console.log("chua");
    }
  }
  socket.emit("getValuesSearch", arr);
}

function isFriend(MyName, friendName) {
  var arrayFriend = getUser(MyName).arrayFriend;
  for (let index = 0; index < arrayFriend.length; index++) {
    const element = arrayFriend[index];
    if (element.name === friendName) {
      return true;
    }
  }
  return false;
}
function nguoiDung(name, password) {
  this.name = name;
  this.password = password;
  this.id = "";
  this.arrayFriendRequest = [];
  this.arrayFriend = [];
  this.arrayNotify = [];
}

function friend(name, room) {
  this.name = name;
  this.room = room;
  this.arrayMess = [];
}
function dangKy(name, password, socket) {
  for (var index = 0; index < thongTinNguoiDung.length; index++) {
    if (thongTinNguoiDung[index].name === name) {
      socket.emit("dang-ky-that-bai", name);
      return;
    }
  }
  thongTinNguoiDung.push(new nguoiDung(name, password));
  socket.emit("dang-ky-thanh-cong", name);
}
function dangNhap(name, password, socket) {
  for (var index = 0; index < thongTinNguoiDung.length; index++) {
    if (
      thongTinNguoiDung[index].name === name &&
      thongTinNguoiDung[index].password === password
    ) {
      socket.emit("dang-nhap-thanh-cong", name);
      return;
    }
  }
  socket.emit("dang-nhap-that-bai", name);
}
