'use strict';

const API_FUNGI = 'https://api.inaturalist.org/v1/';
let listaFungi =[];
let informacionJson = null;
let limiteActual = 9; //muestra los resultados de 9 en 9

//https://api.inaturalist.org/v1/observations?taxon_id=47170
class Micota{
    constructor(id, name, rank, observed_on, extinct, observed_time_zone, description, url){
        this.id = id;
        this.name = name || 'No disponible';
        this.rank = rank || 'No disponible'; 
        this.observed_on = observed_on || 'No disponible';
        this.extinct = extinct || 'No disponible'; //extinta o no
        this.observed_time_zone = observed_time_zone || 'No disponible';
        this.description = description || 'No disponible';
        this.url = url || 'No disponible'; // esta es la imagen de la planta
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
        dato.photos?.[0]?.url // el simbolo raro es para wque no ayan problemas conm la api
        // si esta  la imagen no la carga ? el sino ayudara a que no aya un error 
    );

    return nuevoHongo;
}

//conexion y validacion de la api
async function consultarHongos() {
    try{
        const respuesta = await fetch(
            `${API_FUNGI}observations?taxon_id=47170`
        );
        if (!respuesta.ok){
            throw new Error(`Error HTTP: ${respuesta.status}`)
        }
        const datos = await respuesta.json();
        listaFungi = datos.results.map(convertirAMicota);
        //se llama a la funcion para que muestre los hongos en la pantalla
        mostrarHongos();
    }
    catch (error){
        console.log(error); 
    }
    
}

//mostrar los hongos en el menu
function mostrarHongos(){
    const resultadoConsultar = document.getElementById('resultadoConsultar');
    resultadoConsultar.innerHTML = '';

    listaFungi.slice(0,limiteActual).forEach(hongo => {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'tarjetaHongo';
        tarjeta.innerHTML = 
        `${hongo.url ? ` <img src= "${hongo.url}" alt= "Micota de ${hongo.name}">`:''}
        <div class = "contenido">
            <h3>${hongo.name}</h3>
            <p><strong>Codigo: </strong>${hongo.id}</p>
            <p><strong>Clase: </strong>${hongo.rank}</p>
            <p><strong>Visto en: </strong>${hongo.observed_time_zone}</p>
            <p><strong>Fecha: </strong>${hongo.observed_on}</p>
            <p><strong>Extinto: </strong>${hongo.extinct}</p>
            <p><strong>Descripcion: </strong>${hongo.description}</p>
        </div>`;
        resultadoConsultar.appendChild(tarjeta);
    });

    //creacion del boton para que aparescan mas hongos
    if (limiteActual < listaFungi.length) {
        const btnVerMas = document.createElement('button');
        btnVerMas.id = 'btnVerMas';
        btnVerMas. textContent = 'Ver más';
        btnVerMas.className = 'botonVerMas';
        btnVerMas.addEventListener('click', () =>{
            limiteActual+= 9;
            mostrarHongos();
        })

        resultadoConsultar.appendChild(btnVerMas);
    }
}



// escuchadores de eventos para los botyones
document.getElementById('btnConsultarHongos').addEventListener('click', consultarHongos);