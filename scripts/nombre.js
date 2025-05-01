function empezar() {
  let nombre = document.querySelector("#nombre_usuario").value;
  if (nombre === "") {
    alert("Ingresa tu nombre primero");
  } else {
    window.location.href = "./menu.html?n=" + nombre;
  }
}
