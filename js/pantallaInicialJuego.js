//Este bloque de codigo funciona para traer el playerName ingresado por el usuario en la sesion actual
//si se cierrra el navegador se pierde este dato.
const playerName = sessionStorage.getItem("nombreUsuario");
if (playerName) {
  document.getElementById(
    "saludoInicial"
  ).textContent = `¡Hola ${playerName}, bienvenido a AgileMatch!`;
}

//este bloque de codigo limpia el input de asnwers cuando se recarga la pagina
window.onload = function () {
  // Limpiar todos los inputs al cargar la pagina
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => (input.value = ""));
};

//banderas para determinar estados del juego y opportunities restantes
let isGameStarted = false;
let currentRound = 1;
let globalScore = 0;
let roundScore = 0;
let questionOpportunities = 2;
let actualRoundPoints = 0;
let questionPoints = 0;
let globalOpportunities = 2;
let questionLosses = 0;
//Este bloque de codigo funciona para bloquear el acceso a la pagina del juego inicial
//si se trata de acceder sin haber ingresado un playerName mediante la url directa
window.addEventListener("DOMContentLoaded", () => {
  const playerName = sessionStorage.getItem("nombreUsuario");
  if (!playerName) {
    alert("Debes ingresar tu playerName antes de continuar.");
    window.location.href = "./index.html"; // o la pagina donde se ingresa el playerName
  }
});

//Este bloque de codigo sirve para poder iniciar el juego y mostrar el tablero del area donde
//se mostraran las preguntas
function startGame() {
  showGameBoard();
  showTimer();
}
//esta funcion es para mostrar el area de juego una vez empezado
function showGameBoard() {
  document.getElementById("btnIniciarJuego").style.display = "none";
  document.getElementById("puntajeRonda").style.display = "flex";
  document.getElementById(
    "puntajeRonda"
  ).textContent = `PUNTAJE DE RONDA: ${roundScore}`;
  const div = document.getElementById("seccionPreguntas");
  const puntajeDiv = document.getElementById("puntajeRonda");
  isGameStarted = true;
  div.classList.add("mostrar");
  puntajeDiv.classList.add("mostrar");
}

let activeTimer = null;
let isFirstQuestion = true;
let questionIndex = null;
//esta funcion sirve para mostrar y actualizar el temporizador, asi como actualizar la mecanica de juego

function showTimer() {
  if (activeTimer) clearInterval(activeTimer);

  if (questionIndex === null) {
    questionIndex = selectQuestion(
      currentRound,
      questionOpportunities,
      actualRoundPoints,
      isFirstQuestion
    );
    isFirstQuestion = false;
  }
  console.log("op. de preguntas desde showTimer: " + questionOpportunities);
  let remaining = 8;
  activeTimer = setInterval(() => {
    let timerText = (document.getElementById("textoTemporizador").textContent =
      remaining + "s");
    remaining--;

    updateTimerStyle(timerText);

    if (remaining < 0) {
      clearInterval(activeTimer);
      activeTimer = null;

      const response = getUserResponse();
      if (!response?.trim()) {
        if (globalOpportunities > 0) {
          questionOpportunities--;
          alert(
            `¡Tiempo agotado! No ingresaste ninguna respuesta, te quedan ${questionOpportunities} oportunidad(es) para esta pregunta`
          );
          if (questionOpportunities == 0) {
            globalOpportunities--;
            questionLosses++;
            questionIndex = null;
          }
          console.log("op de pregunta: " + questionOpportunities);
          console.log("preguntas perdidas: " + questionLosses);
          showTimer(globalOpportunities, currentRound);
          resetTimerStyles();
        } else {
          alert(`¡Te quedaste sin oportunidades de ronda! Inténtalo de nuevo`);
          restartGame();
        }
      }
    }
  }, 1000);

  const btn = document.getElementById("btnVerificarRespuesta");
  if (btn) {
    btn.onclick = null;
    btn.onclick = () => {
      const points = checkAnswer(questionIndex);
      if (points !== undefined) {
        questionPoints = points;
        actualRoundPoints += points;
        globalScore += points;
        clearInterval(activeTimer);
        activeTimer = null;
        showTimer(globalOpportunities);
      }
    };
  }
}

function updateTimerStyle(tiempoRestante) {
  const textoTemporizador = document.getElementById("textoTemporizador");

  if (tiempoRestante === "15s") {
    textoTemporizador.classList.add("advertencia");
    console.log(textoTemporizador);
  }

  if (tiempoRestante === "10s") {
    resetTimerStyles();
    textoTemporizador.classList.add("critico");
    console.log(textoTemporizador);
  }
}

function resetTimerStyles() {
  document
    .getElementById("textoTemporizador")
    .classList.remove("advertencia", "critico");
}

//esta funcion complementaria de restartGame() sirve para ocultar area de juego y mostrar el boton
//para iniciar a jugar de nuevo
function hideGameBoard() {
  document.getElementById("seccionPreguntas").classList.remove("mostrar");
  document.getElementById("btnIniciarJuego").style.display = "flex"; // vuelve a mostrar el boton
  document.getElementById("puntajeRonda").style.display = "none";
}

//En esta parte se definen los arrays que contienen las preguntas y asnwers de cada ronda, en cada ronda
//el orden de aparicion de las preguntas va a ser aleatoria pero el indice del objeto respuetas
//equivale a la popularity de la response, entre mas bajo el indice mas points debe otorgar
const round1 = [
  {
    question:
      "¿Que valor del manifiesto agil se enfoca en el equipo y su interaccion?",
    asnwers: ["personas", "comunicacion", "colaboracion", "equipo"],
  },
  {
    question:
      "¿Que se prefiere sobre los procesos extensivos en el manifiesto agil?",
    asnwers: ["software", "funcional", "producto", "entrega"],
  },
  {
    question: "¿Que se prioriza sobre la documentacion extensiva?",
    asnwers: ["comunicacion", "colaboracion", "conversacion", "interaccion"],
  },
  {
    question: "¿Que se valora sobre la negociacion de contratos?",
    asnwers: ["colaboracion", "cliente", "flexibilidad", "adaptabilidad"],
  },
  {
    question: "¿Que aspecto se prefiere sobre seguir un plan rigido?",
    asnwers: ["cambio", "adaptacion", "response", "flexibilidad"],
  },
];

const round2 = [
  {
    question: "¿Quien es responsable de maximizar el valor del producto?",
    asnwers: ["product owner", "dueño", "valor", "negocio"],
  },
  {
    question: "¿Quien facilita al equipo y elimina impedimentos?",
    asnwers: ["scrum master", "facilitador", "lider", "coach"],
  },
  {
    question: "¿Quien construye el incremento del producto en cada sprint?",
    asnwers: ["desarrolladores", "equipo", "tecnicos", "programadores"],
  },
  {
    question: "¿Que lista contiene todos los requerimientos del producto?",
    asnwers: ["backlog", "requerimientos", "lista", "funcionalidades"],
  },
  {
    question:
      "¿Que evento se hace al final del sprint para revisar lo entregado?",
    asnwers: ["revision", "demo", "retrospectiva", "entrega"],
  },
];

const round3 = [
  {
    question: "¿Como se llama el ciclo de trabajo en Scrum?",
    asnwers: ["sprint", "iteracion", "ciclo", "desarrollo"],
  },
  {
    question: "¿Que evento se realiza cada dia para sincronizar al equipo?",
    asnwers: ["daily", "scrum diario", "reunion", "standup"],
  },
  {
    question: "¿Que evento inicia el sprint y se planifica el trabajo?",
    asnwers: ["planificacion", "sprint planning", "inicio", "kickoff"],
  },
  {
    question: "¿Que evento sirve para mejorar continuamente el proceso?",
    asnwers: ["retrospectiva", "mejora", "revision", "cierre"],
  },
  {
    question: "¿Que se entrega al final del sprint como resultado?",
    asnwers: ["incremento", "producto", "entrega", "funcionalidad"],
  },
];

const round4 = [
  {
    question: "¿Que se busca entregar de forma frecuente en agil?",
    asnwers: ["valor", "software", "producto", "funcionalidad"],
  },
  {
    question: "¿Que es importante mantener entre los miembros del equipo?",
    asnwers: ["comunicacion", "confianza", "colaboracion", "transparencia"],
  },
  {
    question: "¿Que practica permite adaptar el proceso con regularidad?",
    asnwers: ["retrospectiva", "mejora", "feedback", "ajuste"],
  },
  {
    question: "¿Que se usa para visualizar el flujo de trabajo?",
    asnwers: ["tablero", "kanban", "tareas", "columnas"],
  },
  {
    question: "¿Que tecnica divide el trabajo en unidades manejables?",
    asnwers: ["historias", "tareas", "tickets", "epicas"],
  },
];

const round5 = [
  {
    question: "¿Que marco agil permite escalar Scrum a grandes equipos?",
    asnwers: ["SAFe", "Nexus", "LeSS", "Spotify"],
  },
  {
    question: "¿Que herramienta digital se usa comúnmente para boards agiles?",
    asnwers: ["Jira", "Trello", "ClickUp", "Monday"],
  },
  {
    question: "¿Que tecnica ayuda a estimar el esfuerzo de las tareas?",
    asnwers: ["planning poker", "points", "estimacion", "fibonacci"],
  },
  {
    question: "¿Que practica permite ver el avance en tiempo real?",
    asnwers: ["burndown", "grafico", "seguimiento", "progreso"],
  },
  {
    question: "¿Que es fundamental recibir constantemente de los usuarios?",
    asnwers: ["feedback", "retroalimentacion", "comentarios", "validacion"],
  },
];

const rounds = [round1, round2, round3, round4, round5];

function getUserResponse() {
  let response = document.getElementById("respuestaUsuario").value;
  return response;
}

function updateRoundScore(roundScore) {
  document.getElementById(
    "puntajeRonda"
  ).textContent = `PUNTAJE RONDA: ${roundScore}`;
  return;
}

function nextRound(round) {
  if (round < 5) {
    alert(`Pasando a la ronda ${round + 1}...`);
    actualRoundPoints = 0;
  } else {
    alert(
      `¡Felicidades, completaste todas las rondas! Total: ${totalScore} puntos.`
    );
  }
  return;
}

//esta funcion sirve para validar la response del usuario y otorgar puntos
function checkAnswer(index) {
  console.log("revisandoRespuesta");
  let response = getUserResponse();
  if (response === "" || response === null) {
    alert("No ingresaste ninguna respuesta!");
    return;
  }

  let popularity = getAnswerPopularity(currentRound, index, response);
  if (popularity != null && popularity !== -1) {
    let earnedPoints = 0;
    switch (popularity) {
      case 0:
        earnedPoints = 15;
        document.getElementById("primerLugar").innerHTML =
          response.toUpperCase();
        break;
      case 1:
        earnedPoints = 10;
        document.getElementById("segundoLugar").innerHTML =
          response.toUpperCase();
        break;
      case 2:
        earnedPoints = 7;
        document.getElementById("tercerLugar").innerHTML =
          response.toUpperCase();
        break;
      case 3:
        earnedPoints = 5;
        document.getElementById("cuartoLugar").innerHTML =
          response.toUpperCase();
        break;
      default:
        earnedPoints = 0;
        break;
    }

    roundScore += earnedPoints;
    alert(`¡Bien hecho! Ganaste ${earnedPoints} puntos.`);
    updateRoundScore(roundScore);
    document.getElementById("respuestaUsuario").value = "";
    return roundScore;
  } else {
    alert(`Respuesta incorrecta.`);
    questionOpportunities--;
  }
  console.log("oportunidades de pregunta: " + questionOpportunities);
}

function getAnswerPopularity(round, questionIndex, userResponse) {
  const roundQuestions = rounds[round - 1];
  if (!roundQuestions || !roundQuestions[questionIndex]) {
    return -1;
  }
  const answers = roundQuestions[questionIndex].asnwers;
  const response = userResponse.trim().toLowerCase();
  console.log(answers);
  return answers.findIndex((ans) => ans.toLowerCase() === response);
}

//esta funcion determina que pregunta aleatoria se va a mostrar dependiendo de la ronda en la que este actualmente
//el jugador
let latestQuestions = [];
function selectQuestion(round, questionChances, roundPoints, isFirstQuestion) {
  const currentRound = rounds[round - 1];
  if (!currentRound) return;

  const availableQuestions = currentRound.filter(
    (p) => !latestQuestions.includes(p.question)
  );

  // Mostrar nueva pregunta si es la primera vez en la ronda
  if (isFirstQuestion) {
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    latestQuestions.push(selectedQuestion.question);

    document.getElementById("pregunta").innerHTML = selectedQuestion.question;
    console.log(`preguntas pasadas: ${latestQuestions}`);
    return currentRound.findIndex(
      (p) => p.question === selectedQuestion.question
    );
  }

  // Si aún hay oportunidades para la pregunta actual, mantenerla
  if (questionOpportunities > 0) {
    return;
  }

  if (questionOpportunities == 0) {
    console.log("SELECCIONANDO NUEVA PREGUNTA");

    const availableQuestions = currentRound.filter(
      (p) => !latestQuestions.includes(p.question)
    );

    if (availableQuestions.length === 0) {
      alert(
        `¡Ya se mostraron todas las preguntas de esta ronda! Terminaste la ronda ${round} con ${roundPoints} puntos.`
      );
      nextRound(currentRound);
    }
  }

  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const selectedQuestion = availableQuestions[randomIndex];
  latestQuestions.push(selectedQuestion.question);
  document.getElementById("pregunta").innerHTML = selectedQuestion.question;
  console.log(`preguntas pasadas: ${latestQuestions}`);
  questionOpportunities = 2;
  return currentRound.findIndex(
    (p) => p.question === selectedQuestion.question
  );
}

//esta funcion restaura al estado inicial la pagina para poder jugar de nuevo
function restartGame() {
  isGameStarted = false;
  isFirstQuestion = true;
  currentRound = 1;
  globalScore = 0;
  roundScore = 0;
  questionOpportunities = 3;
  globalOpportunities = 2;
  actualRoundPoints = 0;
  questionPoints = 0;
  questionIndex = null;
  latestQuestions = [];
  updateRoundScore(roundScore);
  document.getElementById("respuestaUsuario").value = "";
  // document.getElementById("temporizador").textContent = "0s";
  hideGameBoard();
}

//Este bloque de codigo selecciona una question para cada ronda, en total son 5 rounds con 5 preguntas
//cada una, donde se tienen al menos 4 palabras clave donde se pueden ganar points, si al finalizar estos 4 turnos
//no se encontro al menos una palabra clave, se pierde la partida
