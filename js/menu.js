window.addEventListener('load',()=>{
    let nombre = window.location.href.split('=')[1];

    document.querySelector("#h1_menu").innerHTML = "Hola "+nombre+", ¿Que quieres hacer?";
})