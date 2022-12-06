/**
 * Una vez finalice la carga (window.onload), se añade el listener al formulario para evitar el submit y
 * se carga el contenido almacenado en el localStorage (si existe)
 */
window.onload = function(){
    const formControlGastos = document.querySelector('#formTransaccion');
    formControlGastos.addEventListener("submit", addTransaccion)
    
    if(localStorage.length > 0){
        cargarLocalStorage();
    }
};

/**
 * Método que se propaga al enviar el formulario (a través de su botón).
 * Se previene la propagación del evento submit. Se accede a los elementos HTML que se deben modificar al 
 * añadir la transacción, se crean los elementos para ésta junto con sus atributos y se modifican los 
 * elementos HTML correspondientes (totales) según si es un gasto o un ingreso.
 * Se añade al nuevo div creado el evento necesario para eliminar la transacción.
 * Se añade la transacción al historial, se vacía los input y se crea el localStorage.
 * 
 * @param {object} event Objeto Event propagado por el eventListener añadido al form
 */
function addTransaccion(event){
    event.preventDefault()

    const cantidadInput = document.getElementById("cantidad");
    const conceptoInput = document.getElementById("concepto");
    const historialDiv = document.getElementById("historial")

    const elementoTotal = document.getElementById("cantidadAhorro");
    const elementoIngresos = document.getElementById("totalIngreso");
    const elementoGastos = document.getElementById("totalGasto");

    const nuevoDiv = document.createElement("div");
    const nuevaCantidad = document.createElement("p");
    const nuevoConcepto = document.createElement("p");
    nuevaCantidad.setAttribute("class", "nuevaCantidad");
    nuevoConcepto.setAttribute("class", "nuevoConcepto");

    if(cantidadInput.value > 0){
        nuevoDiv.setAttribute("class", "nuevoIngreso");
        sumarCantidad(cantidadInput.value, elementoIngresos);
        sumarCantidad(cantidadInput.value, elementoTotal);
    }else{
        nuevoDiv.setAttribute("class", "nuevoGasto");
        sumarCantidad(Math.abs(cantidadInput.value), elementoGastos);
        restarCantidad(Math.abs(cantidadInput.value), elementoTotal);
    }

    nuevaCantidad.innerText = cantidadInput.value + "€"
    nuevoConcepto.innerText = conceptoInput.value
    nuevoDiv.addEventListener("dblclick", eliminarDiv);

    nuevoDiv.appendChild(nuevaCantidad)
    nuevoDiv.appendChild(nuevoConcepto)
    historialDiv.appendChild(nuevoDiv)

    cantidadInput.value = "";
    conceptoInput.value = "";

    crearLocalStorage();
}
    
/**
 * Se modifica el elemento HTML recibido por parámetro (total de ahorros, de ingresos o de gastos) 
 * sumandole a su contenido la cantidad de la nueva transacción (parseando a Float y eliminando y añadiendo
 * el símbolo '€').
 * 
 * @param {string} stringCantidad Valor del input con id "cantidad" introducido por el usuario
 * @param {HTMLElement} elementoHTML Elemento HTML del cual modificaremos su contenido
 */
function sumarCantidad(stringCantidad, elementoHTML){
    const cantidadTotal = extraerFloat(elementoHTML);
    const cantidadSumada = cantidadTotal + parseFloat(stringCantidad)
    elementoHTML.innerText = cantidadSumada.toString().concat("€");
}

/**
 * Se modifica el elemento HTML recibido restandole a su contenido la cantidad de la nueva transacción.
 * Utilizado para restar un gasto al total de ahorros.
 *  
 * @param {string} stringCantidad Valor del input con id "cantidad" introducido por el usuario
 * @param {HTMLElement} elementoHTML Elemento HTML del cual modificaremos su contenido
 */
function restarCantidad(stringCantidad, elementoHTML){
    const cantidadTotal = extraerFloat(elementoHTML);
    const cantidadSumada = cantidadTotal - parseFloat(stringCantidad)
    elementoHTML.innerText = cantidadSumada.toString().concat("€");
}

/**
 * Método que se propaga al hacer doble click sobre una transacción para eliminar ésta.
 * Se pide confirmación al usuario. Si confirma, se modifican los elementos HTML correspondientes según 
 * si esta transacción es un gasto o un ingreso.
 * Se elimina el div y se modifica el localStorage para guardar los cambios.
 */
function eliminarDiv(){
    const cantidadStringEliminar = this.firstChild;
    const conceptoAEliminar  = cantidadStringEliminar.nextSibling.innerText;
    const cantidadEliminar = extraerFloat(cantidadStringEliminar)
    
    const removeConfirmation = window.confirm(`Se borrará la transacción con el concepto \"${conceptoAEliminar}\". ¿Quiere continuar?`);

    if(removeConfirmation){
        if(cantidadEliminar > 0){
            const totalAhorro = document.getElementById("cantidadAhorro")
            modificarTotalPorEliminacion(cantidadEliminar, totalAhorro)
            const totalIngreso = document.getElementById("totalIngreso")
            modificarTotalPorEliminacion(cantidadEliminar, totalIngreso)
        }else{
            const totalAhorro = document.getElementById("cantidadAhorro")
            const totalAhoroFloat = extraerFloat(totalAhorro)
            totalAhorro.innerText = (totalAhoroFloat + Math.abs(cantidadEliminar)).toString().concat("€");
        
            const totalGasto = document.getElementById("totalGasto")
            modificarTotalPorEliminacion(Math.abs(cantidadEliminar), totalGasto)
        }
        this.remove()
        crearLocalStorage();
    }
}

/**
 * Se modifica el contenido del elemento HTML recibido (total de ahorros, de ingresos o de gastos)
 * restandole la cantidad de la transacción que el usuario quiere eliminar.
 * 
 * @param {float} cantidadEliminar Cantidad de la transacción a eliminar
 * @param {HTMLElement} elementoHTML Elemento HTML al cual modificaremos su contenido
 */
function modificarTotalPorEliminacion(cantidadEliminar, elementoHTML){
    const totalAhorroFloat = extraerFloat(elementoHTML)
    elementoHTML.innerText = (totalAhorroFloat - cantidadEliminar).toString().concat("€");
}

/**
 * Se pasa a float el contenido del elemento HTML recibido, eliminando previamente el símbolo '€'.
 * 
 * @param {HTMLElement} elementoHTML Elemento HTML del cual retornaremos su contenido en float
 * @return {float} Contenido del elemento HTML pasado a float. 
 */
function extraerFloat(elementoHTML){
    const stringElemento = elementoHTML.innerText;
    const floatElemento = parseFloat(stringElemento.slice(0, -1));

    return floatElemento;
}

/**
 * Se almacenan los datos de la aplicación en el localStorage (total de ahorro, ingreso, gasto e historial).
 * Para almacenar el historial, se crea un objeto 'historial' el cual tendrá una propiedad 'transacciones',
 * un array donde se almacenan todas las transacciones del historial. Este objeto se pasa a String para 
 * almacenarlo en el localStorage.
 */
function crearLocalStorage(){
    const stringTotal = document.getElementById("cantidadAhorro");
    const stringIngresos = document.getElementById("totalIngreso");
    const stringGastos = document.getElementById("totalGasto");

    localStorage.setItem('totalAhorro', stringTotal.innerText);
    localStorage.setItem('totalIngreso', stringIngresos.innerText);
    localStorage.setItem('totalGasto', stringGastos.innerText);
    
    let historial={transacciones:[]};
    const historialDiv = document.getElementById("historial").children;
    for(let i = 0; i < historialDiv.length; i++){
        let cantidad = historialDiv[i].firstChild;
        let concepto = cantidad.nextSibling;
        historial.transacciones.push({concepto: concepto.innerText, cantidad: cantidad.innerText})
    }

    localStorage.setItem('historial', JSON.stringify(historial));
}

/**
 * Se restablecen los datos de la aplicación (total ahorro, ingresos, gastos e historial) con el contenido
 * del localStorage. 
 * En el caso del historial, se parsea de string a objeto JSON y se llama al método reconstruirHistorial, 
 * el cual se encargará de reconstruirlo. 
 */
function cargarLocalStorage(){
    const stringTotal = document.getElementById("cantidadAhorro");
    const stringIngresos = document.getElementById("totalIngreso");
    const stringGastos = document.getElementById("totalGasto");

    const ahorroLocal = localStorage.getItem('totalAhorro');
    const ingresoLocal = localStorage.getItem('totalIngreso');
    const gastoLocal = localStorage.getItem('totalGasto');

    stringTotal.innerText = ahorroLocal;
    stringIngresos.innerText = ingresoLocal;
    stringGastos.innerText = gastoLocal;

    const historialLocal = localStorage.getItem('historial');
    const objhistorialLocal = JSON.parse(historialLocal)

    reconstruirHistorial(objhistorialLocal)
}

/**
 * Se reconstruye el historial de la aplicación a través del objeto JSON recibido, creando, por cada una de 
 * las transacciones almacenadas, los elementos HTML correspondientes con sus atributos y el eventListener 
 * de eliminación del div.
 * 
 * @param {JSON} objetoHistorial Objeto JSON con el cual restableceremos el historial de la aplicación
 */
function reconstruirHistorial(objetoHistorial){
    for(let i=0; i<objetoHistorial.transacciones.length; i++){
        const nuevoDiv = document.createElement("div");
        const nuevaCantidad = document.createElement("p");
        const nuevoConcepto = document.createElement("p");
    
        nuevaCantidad.setAttribute("class", "nuevaCantidad");
        nuevoConcepto.setAttribute("class", "nuevoConcepto");

        let cantidadString = objetoHistorial.transacciones[i].cantidad
        if(parseFloat(cantidadString.slice(0, -1)) > 0){
            nuevoDiv.setAttribute("class", "nuevoIngreso");
        }else{
            nuevoDiv.setAttribute("class", "nuevoGasto");
        }
    
        nuevaCantidad.innerText = objetoHistorial.transacciones[i].cantidad
        nuevoConcepto.innerText = objetoHistorial.transacciones[i].concepto
        nuevoDiv.addEventListener("dblclick", eliminarDiv);
    
        nuevoDiv.appendChild(nuevaCantidad)
        nuevoDiv.appendChild(nuevoConcepto)

        const historialDiv = document.getElementById("historial")
        historialDiv.appendChild(nuevoDiv)
    }
}