'use strict';

const API_FUNGI = 'https://api.inaturalist.org/v1/';
let listaFungi =[];
let informacionJson = null;
let lMostrarHongos = 9; //muestra los resultados de 9 en 9
let lmostrarCaracteristicas = 9;
let lmostrarHabitatEcologia = 9;

//https://api.inaturalist.org/v1/observations?taxon_id=47170
class Micota{
    constructor(id, name, rank, observed_on, extinct, observed_time_zone, description, url, preferred_common_name, wikipedia_url, endemic, threatened){
        this.id = id;
        this.name = name || 'No disponible';
        this.rank = rank || 'No disponible'; 
        this.observed_on = observed_on || 'No disponible';
        this.extinct = extinct ?? false; //extinta o no
        this.observed_time_zone = observed_time_zone || 'No disponible';
        this.description = description || 'No disponible';
        this.url = url || ''; // esta es la imagen de la planta

        this.preferred_common_name = preferred_common_name || 'No disponible';
        this.wikipedia_url = wikipedia_url || ''; // lleva a la wiki
        this.endemic = endemic ?? false; //vive en un lugar muy especifico?
        this.threatened = threatened ?? false; //en peligro de extincion
    }
}

//mostrar mensaje
function mostrarMensaje(Id, texto, tipo=''){
    const elemento = document.getElementById(Id);
    if(elemento){
        elemento.textContent = texto;
        elemento.className = `mensaje ${tipo}` ;
    }
}

// convertir los datos a un objeto de clase
function convertirAMicota(dato){
    const nuevoHongo = new Micota(
        dato.id,
        dato.taxon?.name,
        dato.taxon?.rank,
        dato.observed_on,
        dato.taxon?.extinct,
        dato.observed_time_zone,
        dato.description,
        dato.photos?.[0]?.url, // el simbolo raro es para wque no ayan problemas conm la api
        // si esta  la imagen no la carga ? el sino ayudara a que no aya un error 
        dato.taxon?.preferred_common_name,
        dato.taxon?.wikipedia_url,
        dato.taxon?.endemic,
        dato.taxon?.threatened
    );

    return nuevoHongo;
}

//conexion y validacion de la api
async function consultarHongos() {
    try{
        const respuesta = await fetch(
            `${API_FUNGI}observations?taxon_id=47170&per_page=100`
        );
        if (!respuesta.ok){
            throw new Error(`Error HTTP: ${respuesta.status}`)
        }
        const datos = await respuesta.json();

        // console.log("Estructura del primer hongo:", datos.results[0])

        listaFungi = datos.results.map(convertirAMicota);
        //se llama a la funcion para que muestre los hongos en la pantalla
        mostrarHongos();
    }
    catch (error){
        console.log(error); 
    }
}

//mostrar los hongos en el menu
function mostrarHongos(listaAMostrar = listaFungi){
    const resultadoConsultar = document.getElementById('resultadoConsultar');
    resultadoConsultar.innerHTML = '';

    //mensaje para filtar la lista de hongos
    if (listaAMostrar.length === 0){
        resultadoConsultar.innerHTML = '<p class="sinResultados">No se encontraron hongos que coincidan con la búsqueda</p>';
        return;
    }

    listaAMostrar.slice(0, lMostrarHongos).forEach(hongo => {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjetaHongo';
    tarjeta.innerHTML = `
        ${hongo.url ? `<img src="${hongo.url}" alt="Micota de ${hongo.name}">` : ''}
        <div class="contenido">
            <h3>${hongo.name}</h3>
            <p><strong>Nombre Común:</strong> ${hongo.preferred_common_name}</p>
            <p><strong>Código:</strong> ${hongo.id}</p>
            <p><strong>Clase:</strong> ${hongo.rank}</p>
            <p><strong>Visto en:</strong> ${hongo.observed_time_zone}</p>
            <p><strong>Fecha:</strong> ${hongo.observed_on}</p>
            <p><strong>Descripción:</strong> ${hongo.description}</p>
        </div>
    `;

    const btnFavorito = document.createElement('button');
    btnFavorito.textContent = 'Guardar en Favoritos';
    btnFavorito.className = 'btnFavorito';
    btnFavorito.addEventListener('click', () => {
        agregarAFavoritos(hongo);
    });
    const divContenido = tarjeta.querySelector('.contenido');
    divContenido.appendChild(btnFavorito);

    resultadoConsultar.appendChild(tarjeta);
});

    if (lMostrarHongos < listaFungi.length) {
        const btnVerMas = document.createElement('button');
        btnVerMas.className = 'btnVerMas';
        btnVerMas.textContent = 'Ver más';
        btnVerMas.className = 'botonVerMas';

        btnVerMas.addEventListener('click', () =>{
            lMostrarHongos += 9;
            mostrarHongos(listaAMostrar);
        })

        resultadoConsultar.appendChild(btnVerMas);
    }
}

//filtrar los hongos segun el buscasdor 
function filtrarHongos(){
    //sacar el texto del input para poderlo usar en las busquedas
    const textoBusqueda = document.getElementById('inputFiltroNombre').value.toLowerCase().trim();

    if (textoBusqueda ==='') {
        alert('Por favor, ingrese algo para buscar');
        return; 
    }

    const listaFiltrada = listaFungi.filter(hongo => {
        //se convierte a texto patra que no de errores 
        const nombre = String(hongo.name).toLowerCase();
        const clase = String(hongo.rank).toLowerCase();
        const id = String(hongo.id).toLowerCase();
        const extinto = String(hongo.extinct).toLowerCase();

        //includes dice si esta o no
        return  nombre.includes(textoBusqueda) || 
                clase.includes(textoBusqueda) ||
                id.includes(textoBusqueda) ||
                extinto.includes(textoBusqueda);
    });

    mostrarHongos(listaFiltrada);
}


//caracteristicas del os hongos
// se contara con nombre cientifico su link a la wiki si este esta extinto,
//o en peligro de exticion o si vive unicamente en un lugar muy especifico
async function mostrarCaracteristicas(){
    const contenedorCaracteristicas = document.getElementById('detalleCaracteristicas');
    contenedorCaracteristicas.innerHTML = '<p>Cargando características...</p>'; 

    if (listaFungi.length === 0) {
        try {
            const respuesta = await fetch(`${API_FUNGI}observations?taxon_id=47170&per_page=150`);
            if (!respuesta.ok) throw new Error("Error al conectar con la API");
            
            const datos = await respuesta.json();
            listaFungi = datos.results.map(convertirAMicota);
        } catch (error) {
            contenedorCaracteristicas.innerHTML = `<p class="sinResultados">No se pudieron cargar las características automáticamente.</p>`;
            console.error(error);
            return;
        }
    }

    contenedorCaracteristicas.innerHTML = '';

    listaFungi.slice(0, lmostrarCaracteristicas).forEach(hongo => {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'tarjetaHongo';
        tarjeta.innerHTML = `
            ${hongo.url ? `<img src="${hongo.url}" alt="Micota de ${hongo.name}">` : ''}
            <div class="contenido">
                <h3>Detalles de: ${hongo.name}</h3>
                <p><strong>Nombre Común:</strong> ${hongo.preferred_common_name}</p>
                <p><strong>Rango Taxonómico:</strong> ${hongo.rank}</p>
                <p><strong>Es endémico:</strong> ${hongo.endemic ? 'Sí (Especie exclusiva)' : 'No'}</p>
                <p><strong>En peligro de extinción:</strong> ${hongo.threatened ? 'Sí (En riesgo)' : 'No'}</p>
                <p><strong>Está extinto:</strong> ${hongo.extinct ? 'Sí' : 'No'}</p>
                
                ${hongo.wikipedia_url ? `<a href="${hongo.wikipedia_url}" target="_blank" class="btnWikipedia">Leer más en Wikipedia</a>` : '<p><em>No hay enlace de Wikipedia disponible.</em></p>'}
            </div>`;
            
        contenedorCaracteristicas.appendChild(tarjeta); 
    });

    if (lmostrarCaracteristicas < listaFungi.length) {
        const btnVerMas = document.createElement('button');
        btnVerMas.textContent = 'Ver más';
        btnVerMas.className = 'botonVerMas';

        btnVerMas.addEventListener('click', () => {
            lmostrarCaracteristicas += 9;
            mostrarCaracteristicas(); 
        });

        contenedorCaracteristicas.appendChild(btnVerMas);
    }
}

// mostrar ecologia
async function mostrarHabitatEcologia(){
    const contenedorHabitat = document.getElementById('detalleHabitat'); // Ajusta este ID según tu HTML
    contenedorHabitat.innerHTML = '<p>Cargando datos de hábitat y ecología...</p>';

    // Si la lista está vacía, consultamos la API automáticamente de forma independiente
    if (listaFungi.length === 0) {
        try {
            const respuesta = await fetch(`${API_FUNGI}observations?taxon_id=47170&per_page=150`);
            if (!respuesta.ok) throw new Error("Error al conectar con la API");
            
            const datos = await respuesta.json();
            listaFungi = datos.results.map(convertirAMicota);
        } catch (error) {
            contenedorHabitat.innerHTML = `<p class="sinResultados">No se pudo cargar la información de hábitat automáticamente.</p>`;
            console.error(error);
            return;
        }
    }

    // Limpiamos el texto de carga y pintamos las tarjetas enfocadas en ecología/entorno
    contenedorHabitat.innerHTML = '';

    listaFungi.slice(0, lmostrarHabitatEcologia).forEach(hongo => {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'tarjetaHongo';
        tarjeta.innerHTML = `
            ${hongo.url ? `<img src="${hongo.url}" alt="Micota de ${hongo.name}">` : ''}
            <div class="contenido">
                <h3>Hábitat de: ${hongo.name}</h3>
                <p><strong>Fecha de registro:</strong> ${hongo.observed_on}</p>
                <p><strong>Zona horaria / Entorno temporal:</strong> ${hongo.observed_time_zone}</p>
                <p><strong>Categoría Taxonómica:</strong> ${hongo.rank}</p>
                <hr>
                <p><strong>Notas de campo / Descripción ecológica:</strong></p>
                <p class="descripcionEcologica"><em>${hongo.description}</em></p>
            </div>`;
            
        contenedorHabitat.appendChild(tarjeta); 
    });

    // Botón "Ver más" específico para esta sección
    if (lmostrarHabitatEcologia < listaFungi.length) {
        const btnVerMas = document.createElement('button');
        btnVerMas.textContent = 'Ver más';
        btnVerMas.className = 'botonVerMas';

        btnVerMas.addEventListener('click', () => {
            lmostrarHabitatEcologia += 9;
            mostrarHabitatEcologia(); 
        });

        contenedorHabitat.appendChild(btnVerMas);
    }
}     

// crear una nota de campo
function crearNotaCampo(event){
    if (event) event.preventDefault();
    //el preventdefault lo que hace es que no deja que los inputs refresquen la pagina

    const nombreInput = document.getElementById('postNombre').value.trim();
    const fechaInput = document.getElementById('postFecha').value;
    const informacionInput = document.getElementById('postInformacion').value.trim();


    if (!nombreInput || !informacionInput) {
        //si no tiene texto
        alert("Por favor, completa al menos el nombre y la descripción de la nota.");
        return;
    }

    const nuevaNota = {
        name: nombreInput,
        preferred_common_name: "Nota personal de campo",
        observed_on: fechaInput || new Date().toISOString().split('T')[0], // Si no ponen fecha usa la de hoy
        description: informacionInput,
        rank: "Especie registrada por usuario",
        endemic: false,
        threatened: false,
        extinct: false,
        url: "" 
    };

    listaFungi.unshift(nuevaNota);
    //este hace que la nota se valla hacia arriba
    localStorage.setItem('misNotasFungi', JSON.stringify(listaFungi));
    //se guarda la nuecva informacion en el disco duro

    document.getElementById('postNombre').value = '';
    document.getElementById('postFecha').value = '';
    document.getElementById('postInformacion').value = '';

    alert("¡Nota de campo guardada con éxito!");

    //ver si se guardo
    //console.log(JSON.parse(localStorage.getItem('misNotasFungi')));
    //se usa en la consola web para ver si lo guarda, pero pide un perdmiso antes de ejecutarlo por ser 
    //codigo en la consola di que pa evitar que te roben informacion o que se yo

}

//actualizar nota de campo
function actualizarNotaCampo(event) {
    if (event) event.preventDefault();

    const idInput = parseInt(document.getElementById('putId').value);
    const nuevoNombre = document.getElementById('putNombre').value.trim();
    const nuevoContenido = document.getElementById('putContenido').value.trim();
    const contenedorResultado = document.getElementById('resultadoPut');

    if (!nuevoNombre || !nuevoContenido || isNaN(idInput)) {
        contenedorResultado.innerHTML = `<p style="color: red;">Por favor, completa todos los campos correctamente.</p>`;
        return;
    }

    const indiceReal = idInput - 1;
    if (indiceReal >= 0 && indiceReal < listaFungi.length) {
        listaFungi[indiceReal].name = nuevoNombre;
        listaFungi[indiceReal].description = nuevoContenido;
        localStorage.setItem('misNotasFungi', JSON.stringify(listaFungi));
        //se muesta en el contenedor que todo salio bien, o no
        contenedorResultado.innerHTML = `<p style="color: green;">¡Registro #${idInput} actualizado con éxito!</p>`;
        document.getElementById('putNombre').value = '';
        document.getElementById('putContenido').value = '';
    } else {
        contenedorResultado.innerHTML = `<p style="color: red;">Error: No existe ningún registro con el ID ${idInput}.</p>`;
    }

    //este para que funcione se tiene que crear un registro y para verificar que se actualizo
    //podemos usar el mismo comando
    //console.log(JSON.parse(localStorage.getItem('misNotasFungi')));
}

//eliminar nota de campo
function eliminarNotaCampo(event) {
    if (event) event.preventDefault();
    const idInput = parseInt(document.getElementById('deleteId').value);
    const contenedorResultado = document.getElementById('resultadoEliminar'); 
    
    if (isNaN(idInput)) { // no es un numero
        if (contenedorResultado) contenedorResultado.innerHTML = `<p style="color: red;">Por favor, ingresa un ID válido.</p>`;
        return;
    }
    const indiceReal = idInput - 1;
    if (indiceReal >= 0 && indiceReal < listaFungi.length) {
        const elementoEliminado = listaFungi.splice(indiceReal, 1);
        //el slice parte un pedaso para agregar remplazar o eliminar elementos

        localStorage.setItem('misNotasFungi', JSON.stringify(listaFungi));
        if (contenedorResultado) {
            contenedorResultado.innerHTML = `<p style="color: green;">¡Registro #${idInput} (${elementoEliminado[0].name}) eliminado con éxito!</p>`;
        }
        document.getElementById('deleteId').value = '';
    } else {
        if (contenedorResultado) {
            contenedorResultado.innerHTML = `<p style="color: red;">Error: No existe ningún registro con el ID ${idInput}.</p>`;
        }
    }
}

let listaFavoritos = [];
const favoritosGuardados = localStorage.getItem('favoritosFungi');
if (favoritosGuardados) {
    listaFavoritos = JSON.parse(favoritosGuardados);
}
function buscarYMostrarFavoritos(event) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }

    const terminoBusqueda = document.getElementById('buscarFavoritos').value.trim().toLowerCase();
    const contenedorResultado = document.getElementById('resultadoFavoritos');
    contenedorResultado.innerHTML = '';

    if (listaFavoritos.length === 0) {
        contenedorResultado.innerHTML = `<p class="sinResultados">Aún no tienes avistamientos guardados en favoritos.</p>`;
        return;
    }
    const resultadosFiltrados = listaFavoritos.filter(hongo => {
        if (terminoBusqueda === '') return true; 
        const nombreComun = hongo.preferred_common_name ? hongo.preferred_common_name.toLowerCase() : '';
        const nombreCientifico = hongo.name ? hongo.name.toLowerCase() : ''
        return nombreComun.includes(terminoBusqueda) || nombreCientifico.includes(terminoBusqueda);
    });

    if (resultadosFiltrados.length === 0) {
        contenedorResultado.innerHTML = `<p class="sinResultados">No se encontró ningún favorito con el nombre "${terminoBusqueda}".</p>`;
        return;
    }

    resultadosFiltrados.forEach(hongo => {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'tarjetaHongo';
        tarjeta.innerHTML = `
            ${hongo.url ? `<img src="${hongo.url}" alt="Micota de ${hongo.name}">` : ''}
            <div class="contenido">
                <h3>${hongo.name}</h3>
                <p><strong>Nombre Común:</strong> ${hongo.preferred_common_name || 'No registrado'}</p>
                <p><strong>Fecha de observación:</strong> ${hongo.observed_on || 'Desconocida'}</p>
                <p><em>${hongo.description || 'Sin notas adicionales.'}</em></p>
            </div>
        `;
        contenedorResultado.appendChild(tarjeta);
    });
}

function agregarAFavoritos(hongoAProcesar) {
    const yaExiste = listaFavoritos.some(hongo => hongo.name === hongoAProcesar.name);
    if (!yaExiste) {
        listaFavoritos.push(hongoAProcesar);
        localStorage.setItem('favoritosFungi', JSON.stringify(listaFavoritos));
        alert("¡Agregado a favoritos con éxito!");
    } else {
        alert("Este hongo ya está en tus favoritos.");
    }
}

//preferencia del usuario 
function guardarPreferenciaUsuario(event) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
    const regionSeleccionada = document.getElementById('selectRegion').value;
    const contenedorResultado = document.getElementById('resultadoPreferencia');
    localStorage.setItem('preferenciaRegionFungi', regionSeleccionada);

    if (contenedorResultado) {
        contenedorResultado.innerHTML = `<p style="color: green;">¡Preferencia guardada! Región activa: <strong>${regionSeleccionada.toUpperCase()}</strong></p>`;
    }
}

//--------------------------------------------------------------------------------------------------------------------------------------------
//cosas que le faltan al proyecto por eso me invente otra seccion

//una promesa con ten y catch
function consultarConPromesa() {
    const contenedorResultado = document.getElementById('resultadoPromesa');
    if (!contenedorResultado) return;
    contenedorResultado.innerHTML = '<p>Cargando con .then()...</p>';

    fetch('https://api.inaturalist.org/v1/observations?taxon_id=47170&per_page=1')
        .then(respuesta => {
            if (!respuesta.ok) {
                throw new Error(`Error HTTP en la promesa: ${respuesta.status}`);
            }
            return respuesta.json();
        })
        .then(datos => {
            const hongo = datos.results[0];
            contenedorResultado.innerHTML = `<p class="exito">¡Éxito con .then()! Hongo encontrado: ${hongo.taxon ? hongo.taxon.name : 'Sin nombre'}</p>`;
        })
        .catch(error => {
            contenedorResultado.innerHTML = `<p class="errorAmigable">Ocurrió un error en la promesa: ${error.message}</p>`;
        });
}


// consumir el json local
async function cargarJsonLocal() {
    const contenedorResultado = document.getElementById('resultadoJsonLocal');
    const inputFiltro = document.getElementById('inputFiltroJsonLocal');
    if (!contenedorResultado || !inputFiltro) return;
    const textoFiltro = inputFiltro.value.trim().toLowerCase();
    try {
        const respuesta = await fetch('../json/data.json');
        if (!respuesta.ok) throw new Error("No se pudo cargar el archivo data.json.");
        const datosJson = await respuesta.json();
        const listaHongosLocales = datosJson.hongos || [];
        const listaFiltrada = listaHongosLocales.filter(item => 
            item.codigo.toLowerCase().includes(textoFiltro) || 
            item.continente.toLowerCase().includes(textoFiltro) || 
            item.interes.toLowerCase().includes(textoFiltro) || 
            item.descripcion.toLowerCase().includes(textoFiltro)
        );
        contenedorResultado.innerHTML = `<p class="exito">Mostrando ${listaFiltrada.length} elementos de data.json:</p>`;
        if (listaFiltrada.length === 0) {
            contenedorResultado.innerHTML += `<p class="errorAmigable">No se encontraron coincidencias en el archivo local.</p>`;
            return;
        }
        listaFiltrada.forEach(item => {
            contenedorResultado.innerHTML += `
                <div class="tarjetaHongoLocal">
                    <p><strong>Código:</strong> ${item.codigo}</p>
                    <p><strong>Continente:</strong> ${item.continente} (${item.interes})</p>
                    <p><strong>Prioridad:</strong> ${item.prioridad}</p>
                    <p><strong>Descripción:</strong> ${item.descripcion}</p>
                    <hr>
                </div>
            `;
        });

    } catch (error) {
        contenedorResultado.innerHTML = `<p class="errorAmigable">Error al procesar data.json. Asegúrate de que el archivo esté en la misma carpeta.</p>`;
    }
}


// mas galletas
function guardarCookieUsuario(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    //typeof este alluda a saber que tipo de variable es
    const inputValor = document.getElementById('inputCookie');
    const contenedorResultado = document.getElementById('resultadoCookie');
    if (!inputValor || !contenedorResultado) return;
    const valor = inputValor.value.trim();
    if (!valor) {
        contenedorResultado.innerHTML = `<p class="errorAmigable">Por favor, escribe un valor para guardar en la cookie.</p>`;
        return;
    }
    document.cookie = `preferenciaFungi=${encodeURIComponent(valor)}; max-age=86400; path=/`;
    contenedorResultado.innerHTML = `<p class="exito">¡Cookie guardada correctamente en el navegador!</p>`;
    inputValor.value = '';
}

function leerCookieUsuario(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    const contenedorResultado = document.getElementById('resultadoCookie');
    if (!contenedorResultado) return;
    const cookies = document.cookie.split(';');
    let valorCookie = null;
    for (let c of cookies) {
        let [nombre, valor] = c.trim().split('=');
        if (nombre === 'preferenciaFungi') {
            valorCookie = decodeURIComponent(valor);
            break;
        }
    }

    if (valorCookie) {
        contenedorResultado.innerHTML = `<p class="exito">Valor leído desde la cookie: <strong>${valorCookie}</strong></p>`;
    } else {
        contenedorResultado.innerHTML = `<p class="errorAmigable">No se encontró ninguna cookie activa con el nombre 'preferenciaFungi'.</p>`;
    }
}


//errores
function simularErrorUsuario(tipoError) {
    const contenedorErrores = document.getElementById('contenedorErrores');
    if (!contenedorErrores) return;

    let mensaje = '';

    switch (tipoError) {
        case 'api':
            mensaje = "Por favor, verifica tu conexión a internet e inténtalo más tarde.";
            break;
        case 'busqueda':
            mensaje = "No se encontraron avistamiento.";
            break;
        case 'formulario':
            mensaje = "Ay campos obligatorios vacíos en el formulario. ";
            break;
        default:
            mensaje = "Por favor, reintenta la operación.";
    }

    contenedorErrores.innerHTML = `<div class="errorAmigable">${mensaje}</div>`;
}



//--------------------------------------------------------------------------------------------------------------------------------------------

// escuchadores de eventos para los botyones
//si no lo encuentra lo inventa
function agregarEventoSeguro(idElemento, evento, funcion) {
    const elemento = document.getElementById(idElemento);
    if (elemento) {
        elemento.addEventListener(evento, funcion);
    }
}


agregarEventoSeguro('btnConsultarPromesa', 'click', consultarConPromesa);
agregarEventoSeguro('btnCargarJsonLocal', 'click', cargarJsonLocal);
agregarEventoSeguro('btnGuardarCookie', 'click', guardarCookieUsuario);
agregarEventoSeguro('btnLeerCookie', 'click', leerCookieUsuario);
agregarEventoSeguro('btnSimularApi', 'click', () => simularErrorUsuario('api'));
agregarEventoSeguro('btnSimularBusqueda', 'click', () => simularErrorUsuario('busqueda'));
agregarEventoSeguro('btnSimularFormulario', 'click', () => simularErrorUsuario('formulario'));


agregarEventoSeguro('btnConsultarHongos', 'click', consultarHongos);
agregarEventoSeguro('btnFiltrar', 'click', filtrarHongos);
agregarEventoSeguro('btnVerCaracteristicas', 'click', mostrarCaracteristicas);
agregarEventoSeguro('btnVerHabitat', 'click', mostrarHabitatEcologia);
agregarEventoSeguro('btnCrear', 'click', crearNotaCampo);
agregarEventoSeguro('btnActualizar', 'click', actualizarNotaCampo);
agregarEventoSeguro('btnEliminar', 'click', eliminarNotaCampo);
agregarEventoSeguro('btnBuscarFavoritos', 'click', buscarYMostrarFavoritos);

