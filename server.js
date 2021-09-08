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

io.on("connection", (socket) => {
  socket.on("dangKy", (data) => {
    dangKy(data.name, data.password, socket);
  });
  socket.on("dangNhap", (data) => {
    dangNhap(data.name, data.password, socket);
  });
});

function nguoiDung(name, password) {
  this.name = name;
  this.password = password;
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
