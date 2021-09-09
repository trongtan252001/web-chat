var io = io("http://localhost:3000");

function searchFriend() {
  $(".left-content").html("");
}
function search() {
  var input = document.getElementById("myInput");
  var filter = input.value.toLowerCase();
  io.emit("search", filter);
}
io.on("getValuesSearch", (arr) => {
  $(".left-content").html("");
  for (let index = 0; index < arr.length; index++) {
    $(".left-content").append(
      '<div class="item-search">' +
        ' <h3 class="title-center"> ' +
        arr[index] +
        "</hh3>" +
        "</div>"
    );
  }
});
