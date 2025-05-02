function empezar(){
    let select_nivel = document.querySelector("#select_nivel");
    let nivel = select_nivel.options[select_nivel.selectedIndex].text;

    window.location.href = './ver_tabla.html?n='+nivel;

}