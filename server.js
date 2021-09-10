const express = require("express");
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
  socket.on('user-online',username =>{
      userOnline(username,socket);
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
  socket.on('add-friend',data =>{
    friendRequest(data,socket);
  });
});

function friendRequest(data,socket) {
  var name = data.nameFiend;
  for (let index = 0; index < thongTinNguoiDung.length; index++) {
     if(thongTinNguoiDung[index].name === name && !checkFriendRequest(name,data.user)){
      thongTinNguoiDung[index].arrayFriendRequest.push({data:data,status:true});
      io.to(thongTinNguoiDung[index].id).emit('notify-request-friend',thongTinNguoiDung[index].arrayFriendRequest);
      return;
     }
  }
  
}
function checkFriendRequest(name,user) {
  for (let index = 0; index < thongTinNguoiDung.length; index++) {
    if(thongTinNguoiDung[index].name === name){
      var array = thongTinNguoiDung[index].arrayFriendRequest;
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if(element.data.user === user){
          return true;
        }
      }
     
    }
 }
 return false;
}
function userOnline(name,socket) {
  for (let index = 0; index < thongTinNguoiDung.length; index++) {
    if(thongTinNguoiDung[index].name === name){
     thongTinNguoiDung[index].id = socket.id;
     socket.emit('notify-request-friend',thongTinNguoiDung[index].arrayFriendRequest);

     return;
    }
 }
}
function searchFriend(name, socket) {
  var arr = [];
  for (let index = 0; index < thongTinNguoiDung.length; index++) {
    var tenCuaMang = thongTinNguoiDung[index].name.toLowerCase();
    if (tenCuaMang.startsWith(name)) {
      arr.push(thongTinNguoiDung[index].name);
    }
  }
  socket.emit("getValuesSearch", arr);
}
function nguoiDung(name, password) {
  this.name = name;
  this.password = password;
  this.id = "";
  this.arrayFriendRequest = [];
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


