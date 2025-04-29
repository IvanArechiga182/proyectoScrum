function empezar(){

    let nombre = document.querySelector("#nombre_usuario").value;
    window.location.href="./menu.html?n="+nombre;
}