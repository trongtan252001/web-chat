const express = require("express");
const { get } = require("http");
const { join } = require("path");
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
app.get("/call", (req, res) => {
  res.render("call");
});
var thongTinNguoiDung = [];
thongTinNguoiDung.push(new nguoiDung("linh", "123"));
thongTinNguoiDung.push(new nguoiDung("h1", "123"));
thongTinNguoiDung.push(new nguoiDung("h12", "123"));
thongTinNguoiDung.push(new nguoiDung("h123", "123"));
thongTinNguoiDung.push(new nguoiDung("Hau", "123"));
io.on("connection", (socket) => {
  socket.on("user-online", (username) => {
    socket.name = username;
    userOnline(username, socket);
    dangXuatAndDangNhap(
      socket.name,
      { name: socket.name, status: true },
      socket
    );
  });
  socket.on("disconnect", () => {
    if (socket.name != null) {
      dangXuatAndDangNhap(
        socket.name,
        { name: socket.name, status: false },
        socket
      );
    }
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

  socket.on("join-chat-room", (data) => {
    socket.rooms = data.room;
    socket.join(data.room);
    joinChatRoom(data, socket);
  });
  socket.on("send-mess", (data) => {
    senMess(data, socket);
  });

  socket.on("update-new-mess", (data) => {
    updateNewMess(data, socket);
  });
  socket.on("sign-out", (name) => {
    if (socket.name != null) {
      dangXuatAndDangNhap(
        socket.name,
        { name: socket.name, status: false },
        socket
      );
    }
  });
  socket.on("call-video", (data) => {
    callVideo(data, socket);
  });
  socket.on("tu-choi-khong-nghe-may", (id) => {
    io.to(id).emit("friend-khong-bat-may", socket.name);
  });
  socket.on("tat-may-boi-nguoi-goi", (data) => {
    tatMayBoiNguoiGoi(data, socket);
  });

  socket.on('create-room',data =>{
      createRoom(data,socket);
  });

  socket.on('add-human-for-group',data =>{
    addHumanForGroup(data,socket);
  });

  socket.on('send-mess-room',data =>{
    sendMessRoom(data,socket);
  });
  socket.on('join-room-group',data =>{
    socket.join(data.id);
    joinRoomGroup(data,socket);
  });
});

//-----------------------------Tao room-------------------------
var arrayRoom = [];

// join room
//data => {name:userName,id:id,room:name}
function joinRoomGroup(data,socket) {
  var room = searchRoom(data.room);
  socket.emit('update-list-mess-room',room.arrayMess);
}

//data =>  {name:userName,mess:mess,room:room,date:new Date()}
//send mess room
function sendMessRoom(data,socket) {
  var name = data.name;
  var mess = data.mess;
  var room = searchRoom(data.room);
  var arrayMember = room.arrayMember;
  
  room.arrayMess.push(data);
  io.in(room.id).emit('nhan-tin-nhan-room', data);
  for (let index = 0; index < arrayMember.length; index++) {
    const element = arrayMember[index];
    var user = getUser(element.name);
     var roomUser = searchRoomUser(room.name,user.arrayRoom);
     roomUser.mess = data;
    io.to(user.id).emit('create-room-sus',user.arrayRoom);

  }
   
  
}

// them thanh vien vao room
// data => { userName: userName, roomName: room }
function addHumanForGroup(data,socket) {

  // lay user ra
  var user = getUser(data.userName);

  // check xem ten ton tai trong server ko
  if(user == null){
    socket.emit('add-human-err-false',data.userName);
    return;
  }
  // neu ton tai thi lay room trong server ra
  var room = searchRoom(data.roomName);

  // lay danh dach sach thanh vien trong room
  var arrayHu = room.arrayMember;

  //set xem nguoi dung da cos trong room chua
  for (let index = 0; index < arrayHu.length; index++) {
    const element = arrayHu[index];
    if(element.name === data.userName ){
      socket.emit('add-human-err-true',data.userName);
      return;
    }
  }

  // neu chua thi push vao room server
  arrayHu.push({name:user.name,permission: 2});
  room.arrayMess.push({name:socket.name,mess:socket.name+' đã thêm '+data.userName+' vào nhóm',room:data.roomName,date:new Date()})

  // push room vao room cua user dc moi
  user.arrayRoom.push({nameRoom:room.name, id:room.id,number: arrayHu.length,mess:room.arrayMess[room.arrayMess.length-1]});

  // thong bao ve cho toan bo thanh vien trong room
  for (let index = 0; index < arrayHu.length; index++) {
    const element = arrayHu[index];
    var userAll = getUser(element.name);
    var arrayRoomUser = searchRoomUser(room.name,userAll.arrayRoom);

    // set lai so thanh vien trong room
    arrayRoomUser.number = arrayHu.length;
    arrayRoomUser.mess = room.arrayMess[room.arrayMess.length-1];
    io.to(userAll.id).emit('create-room-sus',userAll.arrayRoom);
    io.in(room.id).emit('update-list-mess-room',room.arrayMess);

    
  }


}
// data =>  {userName:userName,roomName:roomName});
function createRoom(data,socket) {

  // xem room da ton tai chua
  for (let index = 0; index < arrayRoom.length; index++) {
    const element = arrayRoom[index];
    if(element.name === data.roomName){
      socket.emit('create-room-err',data.roomName);
      return;
    }
    
  }
  // lay user
  var user = getUser(data.userName);

  // add room vao room server
  var rooms = new room(data.roomName);
  rooms.arrayMess.push({name:data.userName,mess:'tạo room',room:data.roomName,date:new Date()})
  rooms.arrayMember.push({name:user.name,permission: 1});
  arrayRoom.push(rooms); 

  // add room vao rom user
  user.arrayRoom.push({nameRoom:data.roomName, id:rooms.id,number: 1,mess:rooms.arrayMess[rooms.arrayMess.length-1]});
  // gui ve cho client
  socket.emit('create-room-sus',user.arrayRoom);

}
//tim kiem room trong user
function searchRoomUser(nameRoom,array) {
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    if(element.nameRoom === nameRoom){
      return element;
    }
  }
  return null;
}
// tim kiem room
function searchRoom(room) {
  for (let index = 0; index < arrayRoom.length; index++) {
    const element = arrayRoom[index];
    if(element.name === room){
      return element;
    }
  }
  return null;
}
function room(name) {
  this.name = name;
  this.id = uuid();
  this.arrayMember = [];//name:user.name,permission: 1
  this.arrayMess = [];
}
// data =>io.emit('tat-may-boi-nguoi-goi',{userName:userName,nameFriend:nameFriend});
function tatMayBoiNguoiGoi(data, socket) {
  io.to(getIdUser(data.nameFriend)).emit("huy-cuoc-goi", data);
}
//call video
// data => {userName:userName,friendName:f,isCall: isVideo}
function callVideo(data, socket) {
  io.to(getIdUser(data.friendName)).emit("cuoc-goi-den", {
    name: data.userName,
    id: socket.id,
    isVideo: data.isCall,
  });
}
//dang xuat data  { name: socket.name, status: true }
function dangXuatAndDangNhap(name, data, socket) {
  var infoUser = getUser(name);
  var array = infoUser.arrayFriend;
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    var friend = searchFriendForName(element.name, name);
    friend.status = data.status;
    if (data.status) {
      friend.id = socket.id;
    }
    io.to(element.id).emit("nguoi-lien-he", getUser(element.name));
  }
}

//gui du lieu mess ve
//data => {name:name,room:room}
function joinChatRoom(data, socket) {
  var friend = searchIndexFriend(data.name, data.nameFriend);
  var arrayMessJoin = friend.nguoiDung.arrayMess;
  if (arrayMessJoin.length > 0) {
    arrayMessJoin[arrayMessJoin.length - 1].status = true;
  }
  socket.emit("cap-nhap-list-mess", friend.nguoiDung);
  socket.emit("nguoi-lien-he", getUser(socket.name));
}

// cap nhat nguoi gui tin nhan moi nhat
function updateNewMess(data, socket) {
  // cap nhat cho ban
  var nguoiDung = getUser(data.nameFiend).arrayFriend;
  var friend = searchIndexFriend(data.nameFiend, data.name);

  nguoiDung.splice(friend.index, 1);
  nguoiDung.unshift(friend.nguoiDung);
  var thongTinNguoi = getUser(data.nameFiend);
  io.to(thongTinNguoi.id).emit("nguoi-lien-he", thongTinNguoi);

  //cap nhat chinh no
  var nguoiDung2 = getUser(data.name).arrayFriend;
  var friend2 = searchIndexFriend(data.name, data.nameFiend);

  nguoiDung2.splice(friend2.index, 1);
  nguoiDung2.unshift(friend2.nguoiDung);

  var thongTinNguoi2 = getUser(data.name);
  io.to(thongTinNguoi2.id).emit("nguoi-lien-he", thongTinNguoi2);
}
// lay vi tri cua ban be
function searchIndexFriend(name, nameFriend) {
  var arrayFriend = getUser(name).arrayFriend;
  for (let index = 0; index < arrayFriend.length; index++) {
    const element = arrayFriend[index];
    if (element.name === nameFriend) {
      return { nguoiDung: element, index: index };
    }
  }
  return null;
}
// nhan tin
//data => {name: userName,mess:mess,room:room,time:new Date()}
function senMess(data, socket) {
  searchFriendForName(data.name, data.userFriend).arrayMess.push({
    name: data.name,
    mess: data.mess,
    status: true,
    date: data.time,
  });
  searchFriendForName(data.userFriend, data.name).arrayMess.push({
    name: data.name,
    mess: data.mess,
    status: false,
    date: data.time,
  });

  io.sockets.in(data.room).emit("nhan-tin-nhan", data);
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
      var friends = new friend(
        data.friendName,
        room,
        getIdUser(data.friendName)
      );
      friends.arrayMess.push({
        name: data.myName,
        mess: "Mình đồng ý chúng ta là bạn",
        status: true,
        date: new Date(),
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
      var friends = new friend(data.myName, room, getIdUser(data.myName));
      friends.arrayMess.push({
        name: data.myName,
        mess: "Các bạn đã là bạn bè với nhau",
        status: false,
        date: new Date(),
      });
      thongTinNguoiDung[i].arrayFriend.push(friends);

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
      socket.emit('create-room-sus',thongTinNguoiDung[index].arrayRoom);

      return;
    }
  }
}

// tiem kiem nguoi dung de ket ban  { name: userName, friendName: filter }
function searchFriend(data, socket) {
  var arr = [];

  for (let index = 0; index < thongTinNguoiDung.length; index++) {
    var tenCuaMang = thongTinNguoiDung[index].name.toLowerCase();
    if (
      tenCuaMang.startsWith(data.friendName) &&
      !checkFriendRequest(data.name, thongTinNguoiDung[index].name)
    ) {
      if (
        isFriend(data.name, thongTinNguoiDung[index].name) ||
        checkFriendRequest(thongTinNguoiDung[index].name, data.name)
      ) {
        arr.push({ name: thongTinNguoiDung[index].name, isFriend: true });
      }
      if (
        !isFriend(data.name, thongTinNguoiDung[index].name) &&
        !checkFriendRequest(thongTinNguoiDung[index].name, data.name)
      ) {
        arr.push({ name: thongTinNguoiDung[index].name, isFriend: false });
      }
    }
    // if (
    //   tenCuaMang.startsWith(data.friendName) &&
    //   checkFriendRequest(data.name, thongTinNguoiDung[index].name)
    // ) {
    // }
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
  this.arrayRoom = [];
}

function friend(name, room, id) {
  this.id = id;
  this.name = name;
  this.room = room;
  this.arrayMess = [];
  this.status = true;
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
