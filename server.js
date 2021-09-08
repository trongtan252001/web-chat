const express = require("express");
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

const port = 3000;

const server = require("http").Server(app);
var io = require("socket.io")(server);

server.listen(port);

app.get("/signin", (req, res) => {
  res.render("signin");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});

var thongTinNguoiDung = [];
thongTinNguoiDung.push(new nguoiDung("linh", "123"));

io.on("connection", (socket) => {
  socket.on("dangKy", (data) => {
    socket.emit("dang");
    dangKy(data.name, data.password, socket);
  });
});

function nguoiDung(name, password) {
  this.name = name;
  this.password = password;
}
function dangKy(name, password, socket) {
  console.log(thongTinNguoiDung);
  console.log("bat dau");
  for (var index = 0; index < thongTinNguoiDung.length; index++) {
    if (thongTinNguoiDung[index].name === name) {
      console.log("trung ten");
      socket.emit("dang-ky-that-bai", name);

      return;
    }
  }
  thongTinNguoiDung.push(new nguoiDung(name, password));
  console.log(thongTinNguoiDung);
}
