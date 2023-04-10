var url = "https://jsonplaceholder.typicode.com/albums/2/photos";
var videoCount = 0;

async function fetchFromAPI(){
    try{
        var response = await fetch(url);
        var data = await response.json(); // represents the structured data in JavaScript object syntax
        data.forEach(function(Object){
            videoCount++;
        })
        videoCount = Object.keys(data).length;
        var htmlString = data.reduce(function (preview, Object){
            return (
                preview + `<div class="videoBlock" style="opacity: 1;">
                    <img class="videoThumbnail" width="200" height="150" src="${Object.url}">
                    <p class="videoTitle">${Object.title}</p></div>`
                );
            }, "");
        document.getElementById("indexContainer").innerHTML = htmlString;
        document.getElementById("videoResults").innerHTML = "Featured Videos: " + videoCount;
        
        let specificVideos = document.getElementsByClassName("videoBlock");
            [...specificVideos].forEach(function (ele){  
                ele.addEventListener("click", function(ev){
                    fadeOut(ele);
                    setTimeout(function(){
                        ele.remove();
                        videoCount = document.getElementsByClassName("videoBlock").length
                        document.getElementById("videoResults").innerHTML = "Featured Videos: " + videoCount;
                    }, 450)
                })
            },)
    }
    catch (error){
        console.log(error);
    }
}

function fadeOut(element) {
    let fade = setInterval(function() {
       if (element.style.opacity > 0) {
          element.style.opacity = element.style.opacity - 0.02;
       }
    }, 10);
    setTimeout(function(){
        clearInterval(fade);
    }, 500)
 }

fetchFromAPI();