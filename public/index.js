var io = io("http://localhost:3000");
var urlParams = new URLSearchParams(window.location.search);
var userName = urlParams.get("n");

io.emit('user-online',userName);

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
    if(arr[index] !== userName){
      $(".left-content").append(
        '<div class="item-search" onclick="sendAddFriend(\''+arr[index]+'\')">' +
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
  io.emit('add-friend',{user:userName,nameFiend:name,date:d});
}

io.on('notify-request-friend',array=>{
  $('.data-modal-noti').html('');
  if(array.length != 0){
    document.getElementById("n-bell").style.display = "block";
    $('#n-bell').text(array.length);
   }else{
    document.getElementById("n-bell").style.display = "none";

   }
   for (let index = array.length-1; index >=0 ; index--) {
     const element = array[index];

     $('.data-modal-noti').append('<ul>'+
     '<li class="item-noti">'+
         '<img src="images/user.png" alt="" class="img-noti">'+
         '<span class="info-noti">'+element.data.user+' đã gửi lời mời</span>'+
         '<button class="button cn">Chấp nhận</button>'+
         '<button onclick ="" class="button dl">Xoá</button>'+
     '</li>'+
 '</ul>')
     
   }
  
});
function deleteRequest(name) {
  alert(name)
}

function clickNotify() {
  var dis = document.getElementById('notify-contener').style.display+"";
  if(dis !== 'block'){
    document.getElementById("notify-contener").style.display = "block";

  }else{
    document.getElementById("notify-contener").style.display = "none";

  }


}