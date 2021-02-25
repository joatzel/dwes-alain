
// TODO Quedaría pendiente poner un timer para actualizar lo local si actualizan el servidor. Una solución óptima sería poner timestamp de modificación en la tabla y pedir categoriaObtenerModificadasDesde(timestamp), donde timestamp es la última vez que he pedido algo.



window.onload = inicializar;

var divCategoriasDatos;
var divPersonasDatos;
var inputCategoriaNombre;
var inputPersonaNombre;
var inputPersonaApellidos;
var inputPersonaTelefono;
var inputPersonaCategoriaId;



// ---------- VARIOS DE BASE/UTILIDADES ----------

function notificarUsuario(texto) {
    // TODO En lugar del alert, habría que añadir una línea en una zona de notificaciones, arriba, con un temporizador para que se borre solo en ¿5? segundos.
    alert(texto);
}

function llamadaAjax(url, parametros, manejadorOK, manejadorError) {
    //TODO PARA DEPURACIÓN: alert("Haciendo ajax a " + url + "\nCon parámetros " + parametros);

    var request = new XMLHttpRequest();

    request.open("POST", url);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    request.onreadystatechange = function() {
        if (this.readyState == 4 && request.status == 200) {
            manejadorOK(request.responseText);
        }
        if (manejadorError != null && request.readyState == 4 && this.status != 200) {
            manejadorError(request.responseText);
        }
    };

    request.send(parametros);
}

function extraerId(texto) {
    return texto.split('-')[1];
}

function objetoAParametrosParaRequest(objeto) {
    // Esto convierte un objeto JS en un listado de clave1=valor1&clave2=valor2&clave3=valor3
    return new URLSearchParams(objeto).toString();
}

function debug() {
    // Esto es útil durante el desarrollo para programar el disparado de acciones concretas mediante un simple botón.
}



// ---------- MANEJADORES DE EVENTOS / COMUNICACIÓN CON PHP ----------

function inicializar() {
    divCategoriasDatos = document.getElementById("categoriasDatos");
    divPersonasDatos = document.getElementById("personasDatos");

    inputCategoriaNombre = document.getElementById("categoriaNombre");
    inputPersonaNombre = document.getElementById("personaNombre");
    inputPersonaApellidos = document.getElementById("personaApellidos");
    inputPersonaTelefono = document.getElementById("personaTelefono");
    inputPersonaCategoriaId = document.getElementById("personaCategoriaId");

    document.getElementById('btnCategoriaCrear').addEventListener('click', clickCategoriaCrear);
    document.getElementById('btnPersonaCrear').addEventListener('click', clickPersonaCrear);

    // En los "Insertar" de a continuación no se fuerza la ordenación, ya que PHP
    // nos habrá dado los elementos en orden correcto y sería una pérdida de tiempo.

    llamadaAjax("CategoriaObtenerTodas.php", "",
        function(texto) {
            var categorias = JSON.parse(texto);

            for (var i=0; i<categorias.length; i++) {
                domCategoriaInsertar(categorias[i], false);
            }
        }
    );

    llamadaAjax("PersonaObtenerTodas.php", "",
        function(texto) {
            var personas = JSON.parse(texto);

            for (var i=0; i<personas.length; i++) {
                domPersonaInsertar(personas[i], false);
            }
        }
    );
}

function clickCategoriaCrear() {
    inputCategoriaNombre.disabled = true;

    llamadaAjax("CategoriaCrear.php", "nombre=" + inputCategoriaNombre.value,
        function(texto) {
            // Se re-crean los datos por si han modificado/normalizado algún valor en el servidor.
            var categoria = JSON.parse(texto);

            // Se fuerza la ordenación, ya que este elemento podría no quedar ordenado si se pone al final.
            domCategoriaInsertar(categoria, true);

            inputCategoriaNombre.value = "";
            inputCategoriaNombre.disabled = false;
        },
        function(texto) {
            notificarUsuario("Error Ajax al crear: " + texto);
            inputCategoriaNombre.disabled = false;
        }
    );
}

function clickPersonaCrear() {
    inputPersonaNombre.disabled = true;
    inputPersonaApellidos.disabled = true;
    inputPersonaTelefono.disabled = true;
    inputPersonaCategoriaId.disabled = true;

    llamadaAjax("PersonaCrear.php", "nombre="+inputPersonaNombre.value + "&apellidos="+inputPersonaApellidos.value + "&telefono="+inputPersonaTelefono.value + "&categoriaId="+inputPersonaCategoriaId.value,
        function(texto) {
            // Se re-crean los datos por si han modificado/normalizado algún valor en el servidor.
            var Persona = JSON.parse(texto);

            // Se fuerza la ordenación, ya que este elemento podría no quedar ordenado si se pone al final.
            domPersonaInsertar(Persona, true);

            inputPersonaNombre.value = "";
            inputPersonaNombre.disabled = false;
            inputPersonaApellidos.value = "";
            inputPersonaApellidos.disabled = false;
            inputPersonaTelefono.value = "";
            inputPersonaTelefono.disabled = false;
            inputPersonaCategoriaId.value = "";
            inputPersonaCategoriaId.disabled = false;
        },
        function(texto) {
            notificarUsuario("Error Ajax al crear: " + texto);
            inputPersonaNombre.disabled = false;
        }
    );
}

function blurCategoriaModificar(input) {
    let divCategoria = input.parentElement.parentElement;
    let categoria = domCategoriaDivAObjeto(divCategoria);

    llamadaAjax("CategoriaActualizar.php", objetoAParametrosParaRequest(categoria),
        function(texto) {
            if (texto != "null") {
                // Se re-crean los datos por si han modificado/normalizado algún valor en el servidor.
                categoria = JSON.parse(texto);
                domCategoriaModificar(categoria);
            } else {
                notificarUsuario("Error Ajax al modificar: " + texto);
            }
        },
        function(texto) {
            notificarUsuario("Error Ajax al modificar: " + texto);
        }
    );
}

function blurPersonaModificar(input) {
    let divPersona = input.parentElement.parentElement;
    let persona = domPersonaDivAObjeto(divPersona);

    llamadaAjax("PersonaActualizar.php", objetoAParametrosParaRequest(persona),
        function(texto) {
            if (texto != "null") {
                // Se re-crean los datos por si han modificado/normalizado algún valor en el servidor.
                persona = JSON.parse(texto);
                domPersonaModificar(persona);
            } else {
                notificarUsuario("Error Ajax al modificar: " + texto);
            }
        },
        function(texto) {
            notificarUsuario("Error Ajax al modificar: " + texto);
        }
    );
}

function clickCategoriaEliminar(id) {
    llamadaAjax("CategoriaEliminar.php", "id="+id,
        function(texto) {
            var operacionOK = JSON.parse(texto);
            if (operacionOK) {
                domCategoriaEliminar(id);
            } else {
                notificarUsuario("Error Ajax al eliminar: " + texto);
            }
        },
        function(texto) {
            notificarUsuario("Error Ajax al eliminar: " + texto);
        }
    );
}

function clickPersonaEliminar(id) {
    llamadaAjax("PersonaEliminar.php", "id="+id,
        function(texto) {
            var operacionOK = JSON.parse(texto);
            if (operacionOK) {
                domPersonaEliminar(id);
            } else {
                notificarUsuario("Error Ajax al eliminar: " + texto);
            }
        },
        function(texto) {
            notificarUsuario("Error Ajax al eliminar: " + texto);
        }
    );
}



// ---------- GESTIÓN DEL DOM ----------

function domCrearDivInputText(textoValue, codigoOnblur) {
    let div = document.createElement("div");
        let input = document.createElement("input");
                input.setAttribute("type", "text");
                input.setAttribute("value", textoValue);
                input.setAttribute("onblur", codigoOnblur + " return false;");
    div.appendChild(input);

    return div;
}

function domCrearDivImg(urlSrc, codigoOnclick) {
    let div = document.createElement("div");
        let img = document.createElement("img");
                img.setAttribute("src", urlSrc);
                img.setAttribute("onclick", codigoOnclick + " return false;");
    div.appendChild(img);

    return div;
}



function domCategoriaCrearDiv(categoria) {
    let div = document.createElement("div");
            div.setAttribute("id", "categoria-" + categoria.id);
    div.appendChild(domCrearDivInputText(categoria.nombre, "blurCategoriaModificar(this);"));
    div.appendChild(domCrearDivImg("img/Eliminar.png", "clickCategoriaEliminar(" + categoria.id + ");"));

    return div;
}

function domCategoriaObtenerDiv(pos) {
    return divCategoriasDatos.children[pos];
}

function domCategoriaDivAObjeto(div) {
    return { // Devolvemos un objeto recién creado con los datos que hemos obtenido.
        "id": extraerId(div.id),
        "nombre": div.children[0].children[0].value,
    };
}

function domCategoriaObtenerObjeto(pos) {
    let divCategoria = domCategoriaObtenerDiv(pos);
    return domCategoriaDivAObjeto(divCategoria);
}

function domCategoriaEjecutarInsercion(pos, categoria) {
    let divReferencia = domCategoriaObtenerDiv(pos);
    let divNuevo = domCategoriaCrearDiv(categoria);

    divCategoriasDatos.insertBefore(divNuevo, divReferencia);
}

function domCategoriaInsertar(categoriaNueva, enOrden=false) {
    // Si piden insertar en orden, se buscará su lugar. Si no, irá al final.
    if (enOrden) {
        for (let pos = 0; pos < divCategoriasDatos.children.length; pos++) {
            let categoriaActual = domCategoriaObtenerObjeto(pos);

            if (categoriaNueva.nombre.localeCompare(categoriaActual.nombre) == -1) {
                // Si la categoría nueva va ANTES que la actual, este es el punto en el que insertarla.
                domCategoriaEjecutarInsercion(pos, categoriaNueva);
                return;
            }
        }
    }

    domCategoriaEjecutarInsercion(divCategoriasDatos.children.length, categoriaNueva);
}

function domCategoriaLocalizarPosicion(id) {
    var trs = divCategoriasDatos.children;

    for (var pos=0; pos < divCategoriasDatos.children.length; pos++) {
        let categoriaActual = domCategoriaObtenerObjeto(pos);

        if (categoriaActual.id == id) return (pos);
    }

    return -1;
}

function domCategoriaEliminar(id) {
    domCategoriaObtenerDiv(domCategoriaLocalizarPosicion(id)).remove();
}

function domCategoriaModificar(categoria) {
    domCategoriaEliminar(categoria.id);

    // Se fuerza la ordenación, ya que este elemento podría no quedar ordenado si se pone al final.
    domCategoriaInsertar(categoria, true);
}



// TODO Todos estos siguientes están copypasteados y search&replaceados, y ya. Revisar todo según lo vaya necesitando.

function domPersonaCrearDiv(persona) {
    let div = document.createElement("div");
            div.setAttribute("id", "persona-" + persona.id);
    div.appendChild(domCrearDivInputText(persona.estrella, "blurPersonaModificar(this);"));
    div.appendChild(domCrearDivInputText(persona.nombre, "blurPersonaModificar(this);"));
    div.appendChild(domCrearDivInputText(persona.apellidos, "blurPersonaModificar(this);"));
    div.appendChild(domCrearDivInputText(persona.telefono, "blurPersonaModificar(this);"));
    div.appendChild(domCrearDivInputText(persona.categoriaId, "blurPersonaModificar(this);"));
    div.appendChild(domCrearDivImg("img/Eliminar.png", "clickPersonaEliminar(" + persona.id + ");"));

    return div;
}

function domPersonaObtenerDiv(pos) {
    return divPersonasDatos.children[pos];
}

function domPersonaDivAObjeto(div) {
    return { // Devolvemos un objeto recién creado con los datos que hemos obtenido.
        "id": extraerId(div.id),
        "nombre": div.children[1].children[0].value,
        "apellidos": div.children[2].children[0].value,
        "telefono": div.children[3].children[0].value,
        "estrella": div.children[0].children[0].value,
        "categoriaId": div.children[4].children[0].value,
    }
}

function domPersonaObtenerObjeto(pos) {
    let divPersona = domPersonaObtenerDiv(pos);
    return domPersonaDivAObjeto(divPersona);
}

function domPersonaEjecutarInsercion(pos, persona) {
    let divReferencia = domPersonaObtenerDiv(pos);
    let divNuevo = domPersonaCrearDiv(persona);

    divPersonasDatos.insertBefore(divNuevo, divReferencia);
}

function domPersonaInsertar(personaNueva, enOrden=false) {
    // Si piden insertar en orden, se buscará su lugar. Si no, irá al final.
    if (enOrden) {
        for (let pos = 0; pos < divPersonasDatos.children.length; pos++) {
            let personaActual = domPersonaObtenerObjeto(pos);

            // Se generan cadenas compuestas por los campos clave para ordenar.
            let cadenaActual = personaActual.nombre + personaActual.apellidos;
            let cadenaNueva = personaNueva.nombre + personaNueva.apellidos;

            if (cadenaNueva.localeCompare(cadenaActual) == -1) {
                // Si la categoría nueva va ANTES que la actual, este es el punto en el que insertarla.
                domPersonaEjecutarInsercion(pos, personaNueva);
                return;
            }
        }
    }

    domPersonaEjecutarInsercion(divPersonasDatos.children.length, personaNueva);
}

function domPersonaLocalizarPosicion(id) {
    var trs = divPersonasDatos.children;

    for (var pos=0; pos < divPersonasDatos.children.length; pos++) {
        let personaActual = domPersonaObtenerObjeto(pos);

        if (personaActual.id == id) return (pos);
    }

    return -1;
}

function domPersonaEliminar(id) {
    domPersonaObtenerDiv(domPersonaLocalizarPosicion(id)).remove();
}

function domPersonaModificar(persona) {
    domPersonaEliminar(persona.id);

    // Se fuerza la ordenación, ya que este elemento podría no quedar ordenado si se pone al final.
    domPersonaInsertar(persona, true);
}