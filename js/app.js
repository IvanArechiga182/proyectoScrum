let nivel = 1;
let opciones = [0, 0, 0, 0];
let num_2=0, respuesta_elegida, respuesta_correcta;
let numeros_usados = [];


const texto_nivel = document.querySelector("#h1_nivel");
const texto_pregunta = document.querySelector("#p_pregunta");

const texto_r1 = document.querySelector("#btn_r1");
const texto_r2 = document.querySelector("#btn_r2");
const texto_r3 = document.querySelector("#btn_r3");
const texto_r4 = document.querySelector("#btn_r4");

const texto_posicion = document.querySelector("#p_posicion");

const btn_siguiente = document.querySelector("#btn_siguiente");


window.addEventListener("load", setup);

function setup() {


    generar_pregunta();
    generar_opciones();
    actualizar_interfaz();

    texto_r1.disabled = false;
    texto_r2.disabled = false;
    texto_r3.disabled = false;
    texto_r4.disabled = false;

    btn_siguiente.disabled = true;
}


function generar_pregunta() {
    num_2++;
    num_2 = Math.floor(Math.random() * (12 - 2) + 2);
    texto_pregunta.innerText = nivel + " x " + num_2 + " = ?";

}


function generar_opciones() {


    opciones = []
    let posicion_aleatoria = Math.floor(Math.random() * (3 - 0) + 0);
    respuesta_correcta = nivel * num_2;
    opciones[posicion_aleatoria] = respuesta_correcta;


    for (let i = 0; i < 4; i++) {
        let num_ale = Math.floor(Math.random() * (respuesta_correcta+num_2 - 1) + 1);

        if (opciones[i] != respuesta_correcta && !opciones.includes(num_ale) && num_ale!=0) {
            opciones[i] = num_ale;
        }else{
            if(opciones[i]!=respuesta_correcta){
                if(i==0){
                    opciones[i]=respuesta_correcta+1;
                }else{
                    opciones[i] = opciones[i-1]+1;
                }
            }
           
        }
    }




}

function actualizar_interfaz() {
    texto_nivel.innerText = "Nivel " + nivel;

    texto_r1.innerText = opciones[0];
    texto_r2.innerText = opciones[1];
    texto_r3.innerText = opciones[2];
    texto_r4.innerText = opciones[3];

    texto_posicion.innerHTML = nivel+" de 12."

    
}



function seleccion_boton(btn_id) {
    respuesta_elegida = document.querySelector("#" + btn_id).innerText;

    texto_r1.disabled = true;
    texto_r2.disabled = true;
    texto_r3.disabled = true;
    texto_r4.disabled = true;

    document.querySelector("#" + btn_id).disabled = false;

    btn_siguiente.disabled = false;

}

function siguiente_nivel() {

    if (nivel != 12) {
        comprobar_respuesta();
    }else{
        window.location = "test_terminado.html?nivel="+nivel;

    }

    

}

function comprobar_respuesta() {
    if (respuesta_elegida != respuesta_correcta) {
        window.location = "test_terminado.html?nivel="+nivel;


    }else{
        nivel++;

        setup();
    }
}



