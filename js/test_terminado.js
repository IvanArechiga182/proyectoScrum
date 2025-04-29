let url = window.location.href;

let parametro = url.split('?')[1];
let nivel = parametro.split('=')[1];

let texto_nivel = document.querySelector("#p_nivel");

texto_nivel.innerText = "Resultado: Nivel "+nivel;


function empezar_tabla(){
    window.location.href = './ver_tabla.html?n='+nivel;
}