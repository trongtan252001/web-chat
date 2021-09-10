var io = io("http://localhost:3000");
function dangNhap() {
  var name = document.getElementById("exampleInputName").value;
  var password = document.getElementById("exampleInputPassword1").value;
  if (name.length > 0 && password.length > 0) {
    io.emit("dangNhap", { name: name, password: password });
  } else {
    alert("Vui long nhap day du thong tin");
  }
}
io.on("dang-nhap-thanh-cong", (name) => {
  window.location = "/home?n="+name;
});
io.on("dang-nhap-that-bai", (name) => {
  alert("dang nhap That bai");
});
