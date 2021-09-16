const express = require("express");
const { get } = require("http");
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

  socket.on('join-chat-room',data =>{
    socket.join(data.room); 
    joinChatRoom(data,socket);

  });
  socket.on('send-mess',data => {
    senMess(data,socket);
  });

  socket.on('update-new-mess', data =>{
     updateNewMess(data,socket);
  });
});

//gui du lieu mess ve
//data => {name:name,room:room}
function joinChatRoom(data,socket) {
  var friend = searchIndexFriend(data.name,data.nameFriend);
  socket.emit('cap-nhap-list-mess',friend.nguoiDung);
}

// cap nhat nguoi gui tin nhan moi nhat
function updateNewMess(data,socket) {

  // cap nhat cho ban
  var nguoiDung = getUser(data.nameFiend).arrayFriend;
  var friend = searchIndexFriend(data.nameFiend,data.name);
  
  nguoiDung.splice(friend.index,1);
  nguoiDung.unshift(friend.nguoiDung);
  var thongTinNguoi =getUser(data.nameFiend);
  io.to(thongTinNguoi.id).emit("nguoi-lien-he", thongTinNguoi);

 //cap nhat chinh no
 var nguoiDung2 = getUser(data.name).arrayFriend;
 var friend2 = searchIndexFriend(data.name,data.nameFiend);
 
 nguoiDung2.splice(friend2.index,1);
 nguoiDung2.unshift(friend2.nguoiDung);
 
  var thongTinNguoi2 =getUser(data.name);
  io.to(thongTinNguoi2.id).emit("nguoi-lien-he", thongTinNguoi2);


  
}
// lay vi tri cua ban be 
function searchIndexFriend(name, nameFriend) {
  var arrayFriend = getUser(name).arrayFriend;
  for (let index = 0; index < arrayFriend.length; index++) {
    const element = arrayFriend[index];
    if (element.name === nameFriend) {
      return {nguoiDung:element, index:index};
    }
  }
  return null;
}
// nhan tin
//data => {name: userName,mess:mess,room:room,time:new Date()}
function senMess(data,socket) {
  searchFriendForName(data.name,data.userFriend).arrayMess.push({
    name: data.name,
    mess: data.mess,
    status: false,
    date: data.time
  });
  searchFriendForName(data.userFriend,data.name).arrayMess.push({
    name: data.name,
    mess: data.mess,
    status: false,
    date: data.time
  });
 
  io.sockets.in(data.room).emit('nhan-tin-nhan',data);

}
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
        name: data.myName,
          mess: "Mình đồng ý chúng ta là bạn",
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
            mess: "Mình đồng ý chúng ta là bạn",
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


      return;
    }
  }
}

//search ban be
function searchFriendForName(name, nameFriend) {
  var arrayFriend = getUser(name).arrayFriend;
  for (let index = 0; index < arrayFriend.length; index++) {
    const element = arrayFriend[index];
    if (element.name === nameFriend) {
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
