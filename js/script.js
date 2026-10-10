'use strict';

const API_FUNGI = 'https://api.inaturalist.org/v1/';
let listaFungi =[];
let informacionJson = null;

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

//
function convertirAMicota(dato){
    const nuevoHongo = new Micota(
        dato.id,
        dato.name,
        dato.rank,
        dato.observed_on,
        dato.extinct,
        dato.observed_time_zone,
        dato.description,
        dato.photos?.[0]?.url // el simbolo raro es para wque no ayan problemas conm la api
        // si esta  la imagen no la carga ? el sino ayudara a que no aya un error 
    );

    return nuevoHongo;
}
