var io = io("http://localhost:3000");
function dangKy() {
  var name = document.getElementById("exampleInputName1").value;
  var confirmPassword = document.getElementById(
    "exampleConfirmPassword1"
  ).value;
  var password = document.getElementById("exampleInputPassword1").value;
  if (name.length > 0 && confirmPassword.length > 0 && password.length > 0) {
    if (confirmPassword === password) {
      io.emit("dangKy", { name: name, password: password });
    } else {
      alert("Password ko trung");
    }
  } else {
    alert("Vui long nhap day du thong tin");
  }
}

io.on("dang-ky-that-bai", (data) => {
  alert(data + " da co nguoi su dung ten");
});
