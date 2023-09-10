
let tarjetasContenedor = document.querySelector("#contenedor_tarjetas")
let chekboxesContenedor = document.querySelector("#contenedor-checkboxes")

let tabla1StatsContenedor = document.querySelector("#tabla1-EventStatics")
let tabla2StatsContenedor = document.querySelector("#tabla2-UpcomingStatics")
let tabla3StatsContenedor = document.querySelector("#tabla3-PastStatics")

let urlApi = "https://mindhub-xj03.onrender.com/api/amazing";
let datosObtenidos = {}
let arregloEventosBase = []

traerDatos(urlApi)

function traerDatos(url) {
  // Obtener datos desde la api (url) 
  // Procesar segun que pagina este activada
  fetch(url)
    .then(response => response.json())
    .then(datosApi => {
      datosObtenidos = datosApi

      if (document.title == "Index" || document.title == "Upcoming_Events" || document.title == "Past_Events") {

        crearMostrarCheckboxes(datosObtenidos.events, chekboxesContenedor)

        arregloEventosBase = crearArregloEventosBase(datosObtenidos)

        crearMostrarTarjetas(arregloEventosBase, tarjetasContenedor);

      } else if (document.title == "Details") {
        mostrarDetails();
      } else if (document.title == "Stats") {
        generaCamposCalculados(datosObtenidos);

      }
    })
    .catch(error => console.log(error))
}




function generaCamposCalculados(datos) {

  // agrego nuevas propiedades a los eventos con total de ganancia y % asistencia
  // segun sea upcoming(estimate) o past(assistance) 
  datos.events.forEach(evento => {
    if (evento.date >= datos.currentDate) {
      // calculo evento upcoming
      evento.ganancia = evento.price * evento.estimate
      evento.porcAsistencia = parseFloat(((evento.estimate * 100) / evento.capacity).toFixed(2));
    } else {
      // calculo evento past
      evento.ganancia = evento.price * evento.assistance
      evento.porcAsistencia = parseFloat(((evento.assistance * 100) / evento.capacity).toFixed(2));
    }

  })

  // **********************************
  // *  calculos para la primer tabla *
  // **********************************
  // Crear una copia ordenada del arreglo de objetos por porcAsistencia en orden descendente
  // como es asistencia , asumo que son los que ya pasaron  past 

  let eventosFiltradosPast = datos.events.filter(evento => evento.date < datos.currentDate)
  eventosFiltradosPast.sort((a, b) => b.porcAsistencia - a.porcAsistencia);


  // buscar evento con mayor y menor porcentaje de asistencia
  // ordener en orden ascendente por porcentaje de asistencia .
  // el primer elemento sera el mas bajo y el ultimo sera el mas alto

  let eventoHightPorcAttendance = eventosFiltradosPast[0]
  let eventoLowPorcAttendance = eventosFiltradosPast[eventosFiltradosPast.length - 1]

  // buscar evento con mayor capacidad 
  // ordenar eventos por capacidad en forma descendente , 
  // el primer elemento sera el de mayor capacidad
  let eventosOrdenCapacidadAZ = datos.events.sort((a, b) => b.capacity - a.capacity);
  let eventoConMayorCapacidad = eventosOrdenCapacidadAZ[0]


  llenarTabla1EventStatics(eventoHightPorcAttendance, eventoLowPorcAttendance, eventoConMayorCapacidad, tabla1StatsContenedor)



  // *******************************************
  // *  calculos para la segunda tabla UPCOMING*
  // *******************************************
  let resumenEventosUp = []

  let arregloEventosNecesarios = []
  arregloEventosNecesarios = datos.events.filter(evento => evento.date >= datos.currentDate)

  let categoriasUnicas = [...new Set(arregloEventosNecesarios.map(evento => evento.category))]

  categoriasUnicas.forEach(categoria => {
    let arregloUpCategoria = arregloEventosNecesarios.filter(evento => evento.category === categoria)

    let datosEvento = arregloUpCategoria.map(evento => miniEvento = { ganancia: evento.ganancia, porcAsistencia: evento.porcAsistencia })

    let acumGananciaEvento = 0
    let acumPorcAsistenciaEvento = 0.00

    datosEvento.forEach(datoEvento => {
      acumGananciaEvento = acumGananciaEvento + datoEvento.ganancia
      acumPorcAsistenciaEvento = acumPorcAsistenciaEvento + datoEvento.porcAsistencia
    })

    // calcular promedio porcAsistencia 
    let promPorcAsistenciaEvento = (acumPorcAsistenciaEvento / datosEvento.length).toFixed(2)
    resumenEventosUp.push({ category: categoria, revenues: acumGananciaEvento, porcAsistencia: promPorcAsistenciaEvento })

    llenarTabla2Y3(resumenEventosUp, tabla2StatsContenedor)
  })


  // **************************************
  // *  calculos para la tercer tabla PAST*
  // **************************************

  let resumenEventosPast = []

  arregloEventosNecesarios = []
  arregloEventosNecesarios = datos.events.filter(evento => evento.date < datos.currentDate)

  categoriasUnicas = [...new Set(arregloEventosNecesarios.map(evento => evento.category))]

  categoriasUnicas.forEach(categoria => {
    let arregloPastCategoria = arregloEventosNecesarios.filter(evento => evento.category === categoria)

    let datosEvento = arregloPastCategoria.map(evento => miniEvento = { ganancia: evento.ganancia, porcAsistencia: evento.porcAsistencia })

    let acumGananciaEvento = 0
    let acumPorcAsistenciaEvento = 0.00

    datosEvento.forEach(datoEvento => {
      acumGananciaEvento = acumGananciaEvento + datoEvento.ganancia
      acumPorcAsistenciaEvento = acumPorcAsistenciaEvento + datoEvento.porcAsistencia
    })

    // calcular promedio porcAsistencia 
    let promPorcAsistenciaEvento = (acumPorcAsistenciaEvento / datosEvento.length).toFixed(2)
    resumenEventosPast.push({ category: categoria, revenues: acumGananciaEvento, porcAsistencia: promPorcAsistenciaEvento })
  })

  llenarTabla2Y3(resumenEventosPast, tabla3StatsContenedor)
}



function llenarTabla1EventStatics(highpercent, lowpercent, highcapacity, ubicacion) {

  let tabla = ""
  tabla = tabla + `<tr>`
  tabla = tabla + `<td><a href="../../assets/pages/details.html?_id=${highpercent._id}" class="btn btn-primary">${highpercent.name}</a></td>`
  tabla = tabla + `<td><a href="../../assets/pages/details.html?_id=${lowpercent._id}" class="btn btn-primary">${lowpercent.name}</a></td>`
  tabla = tabla + `<td><a href="../../assets/pages/details.html?_id=${highcapacity._id}" class="btn btn-primary">${highcapacity.name}</a></td>`
  tabla = tabla + `</tr>`
  ubicacion.innerHTML = tabla
}


function llenarTabla2Y3(resumen, ubicacion) {

  let tabla = ""

  resumen.forEach(evento => {
    tabla = tabla + `<tr>`
    tabla = tabla + `<td>${evento.category} </td>`
    tabla = tabla + `<td><div class="row">
    <div class="col-3 col-md-3">  
      <div>U$S</div>
    </div> 

    <div class="col-3 col-md-3 alinea-celda">  
      ${evento.revenues.toLocaleString('es-AR')}
    </div> 

  </div> 
</td>`

    tabla = tabla + `<td>${evento.porcAsistencia} % </td>`
    tabla = tabla + `</tr>`
  })

  ubicacion.innerHTML = tabla
}



function crearMostrarCheckboxes(arregloEventos, ubicacion) {

  let categoriasUnicas = []

  let soloCategorias = arregloEventos.map(evento => evento.category)

  soloCategorias.forEach(categoria => {
    if (!categoriasUnicas.includes(categoria)) {
      categoriasUnicas.push(categoria)
    }

    let checkboxes = ""
    for (categoria of categoriasUnicas) {
      checkboxes += `<div class="form-check form-switch col-12 col-sm-12 col-md-5">
<input value="${categoria}" class="form-check-input" type="checkbox" role="switch" id="${categoria}">
<label class="form-check-label" for="${categoria}">
  ${categoria}</label>
</div>`
    }
    ubicacion.innerHTML = checkboxes
  })
}


function crearArregloEventosBase(data) {

  let arregloEventosNecesarios = []
  if (document.title === "Index") {
    arregloEventosNecesarios = data.events
  } else if (document.title === "Upcoming_Events") {
    arregloEventosNecesarios = data.events.filter(evento => evento.date >= data.currentDate)
  } else if (document.title === "Past_Events") {
    arregloEventosNecesarios = data.events.filter(evento => evento.date < data.currentDate)
  }

  return arregloEventosNecesarios
}


function crearMostrarTarjetas(arregloEventos, ubicacion) {

  let tarjetas = ""

  arregloEventos.forEach(evento => {
    tarjetas += `<div class="card col-md-3">
        <img src=" ${evento.image}" class="card-img card-img-top mt-1 object-fit-cover" alt="${evento.name}">

        <div class="card-body">
          <h5 class="card-title">${evento.name}</h5>
          <p class="card-text">${evento.description}</p>

            <div class="row">

              <div class="col-3 p-0">
                <h4 class="mb-0">Date</h4>
              </div>
  
              <div class="col-5 justify-content-center d-flex p-md-2 pt-1 justify-content-md-start">
                <h6 class="mb-0">${evento.date}</h6>
              </div>
    
            </div>

          <div class="row">

            <div class="col-3 p-0">
              <h4 class="mb-0">Price</h4>
            </div>

            <div class="col-4 justify-content-center d-flex p-md-2 pt-1 justify-content-md-start">
              <h6 class="mb-0">U$S ${evento.price}</h6>
          </div>`

    if (document.title === 'Index') {

      tarjetas = tarjetas +
        `<div class="col-4">
              <a href="./assets/pages/details.html?_id=${evento._id}" class="btn btn-primary">Details</a>
            </div>
          </div>
        </div>
      </div>`
    } else {
      tarjetas = tarjetas +
        `<div class="col-4">
              <a href="../../assets/pages/details.html?_id=${evento._id}" class="btn btn-primary">Details</a>
            </div>
          </div>
        </div>
      </div>`
    }

  }) //aca termina el forEach

  ubicacion.innerHTML = tarjetas
}


// poner filtros
// volver a crearMostrarTarjetas con arreglo filtrado


const inputTexto = document.querySelector("#texto")
if (inputTexto) {
  inputTexto.addEventListener("input", () => { filtroCruzado() })
}

const divChecks = document.getElementById("contenedor-checkboxes")
if (divChecks) {
  divChecks.addEventListener("change", filtroCruzado)
}



const botonMail = document.getElementById("form-mail")
if (botonMail) {
  botonMail.addEventListener("submit", () => {

    Swal.fire({
      title: "Mail Send",
      confirmButtonText: "Ok",
      timer: 25000,
    });

  })
}

function filtroCruzado() {

  let filtradoPorTexto = filtrarPorTexto(arregloEventosBase, inputTexto.value)
  let filtradoPorTextoYCheckboxes = filtrarPorCategoria(filtradoPorTexto)

  if (filtradoPorTextoYCheckboxes.length === 0) {
    // Si no hay resultados, muestra el mensaje de notificación.
    document.getElementById("mensajeNoResultados").style.display = "block";
  } else {
    document.getElementById("mensajeNoResultados").style.display = "none";
  }

  crearMostrarTarjetas(filtradoPorTextoYCheckboxes, tarjetasContenedor)
}

function filtrarPorTexto(arregloDeElementos, texto) {
  let elementosFiltrados = arregloDeElementos.filter(elemento => elemento.name.toLowerCase().includes(texto.toLowerCase()))
  return elementosFiltrados
}

function filtrarPorCategoria(arregloDeElementos) {
  let checkboxes = document.querySelectorAll("input[type='checkbox']")
  let arrayCheckboxes = Array.from(checkboxes)
  let checksPrendidos = arrayCheckboxes.filter(check => check.checked)
  let valoresChecks = checksPrendidos.map(check => check.value)

  if (valoresChecks.length == 0) {
    return arregloDeElementos
  }

  let elementosFiltrados = arregloDeElementos.filter(elemento => valoresChecks.some(categoria => elemento.category.toLowerCase().includes(categoria.toLowerCase())))

  return elementosFiltrados
}


function mostrarDetails() {
  if (document.title == "Details") {
    const queryString = location.search
    const params = new URLSearchParams(queryString)
    const _id = params.get("_id")
    let eventoEncontrado = datosObtenidos.events.find((evento) => evento._id == _id)
    crearDetailsEvento(eventoEncontrado, detalle)
  }
}


function crearDetailsEvento(evento, ubicacion) {
  let detalleEvento = ""

  detalleEvento = `<div class="d-flex col-md-4 col-sm-12 align-items-center justify-content-center pt-5">
  <img src="${evento.image}"
      class="img-fluid card-img-2 card-img-top mt-2 object-fit-cover" alt="${evento.name}">
</div>

<div class="col-md-8 col-sm-12 pt-5">
  <div class="card-body p-3 bg-body-secondary mt-5 mb-1">

      <div class="container mt-3">

          <div class="row">

              <div class="col-12 col-md-3">
                  <span class="span-negrita">Category</span>
              </div>

              <div class="col-12 col-md-9">
                  <p>${evento.category}</p>
              </div>

              <div class="col-12 col-md-3">
                  <span class="span-negrita">Name</span>
              </div>

              <div class="col-12 col-md-9">
                  <p>${evento.name}</p>
              </div>

              <div class="col-12 col-md-3">
                  <span class="span-negrita">Description</span>
              </div>

              <div class="col-12 col-md-9">
                  <p>${evento.description}</p>
              </div>

              <div class="col-12 col-md-3">
                  <span class="span-negrita">Place</span>
              </div>

              <div class="col-12 col-md-9">
                  <p>${evento.place}</p>
              </div>

              <div class="col-12 col-md-3">
                  <span class="span-negrita">Date</span>
              </div>

              <div class="col-12 col-md-9">
                  <p>${evento.date}</p>
              </div>

              <div class="col-12 col-md-3">
                  <span class="span-negrita">Price</span>
              </div>

              <div class="col-12 col-md-9">
                  <p>U$S ${evento.price}</p>
              </div>

          </div>
      </div>
  </div>
</div>

`
  ubicacion.innerHTML = detalleEvento
}

/* async function traerDatos() {
  try {
    const response = await fetch(urlApi);
    const datos = await response.json();
    return datos;
  } catch (error) {
    console.log(error);
  }
}

async function obtenerYMostrarDatos() {
 datosObtenidos = await traerDatos();
 crearMostrarCheckboxes(datosObtenidos.events, chekboxesContenedor)
 arregloEventosBase = crearArregloEventosBase(datosObtenidos)
 crearMostrarTarjetas(arregloEventosBase, tarjetasContenedor)
}

obtenerYMostrarDatos()

 */
