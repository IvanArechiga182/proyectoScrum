function empezar() {
  let nombre = document.querySelector("#nombre_usuario").value;
  if (nombre === "") {
    alert("Ingresa tu nombre primero");
  } else {
    sessionStorage.setItem("nombreUsuario", nombre);
    window.location.href = "./informacionJuego.html";
  }
}
