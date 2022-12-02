
window.onload = function(){
    //Evitamos que refresque la página al hacer submit añadiendole el evento al formulario
    const formControlGastos = document.querySelector('#formTransaccion');
    formControlGastos.addEventListener("submit", addTransaccion)
    
    if(localStorage.length > 0){
        cargarLocalStorage();
    }
};

function addTransaccion(event){
    //Prevenimos la propagación del evento submit para que el navegador no refresque
    event.preventDefault()

    const cantidadInput = document.getElementById("cantidad");
    const conceptoInput = document.getElementById("concepto");
    const historialDiv = document.getElementById("historial")

    const stringTotal = document.getElementById("cantidadAhorro");
    const stringIngresos = document.getElementById("totalIngreso");
    const stringGastos = document.getElementById("totalGasto");

    const nuevoDiv = document.createElement("div");
    const nuevaCantidad = document.createElement("p");
    const nuevoConcepto = document.createElement("p");

    nuevaCantidad.setAttribute("class", "nuevaCantidad");
    nuevoConcepto.setAttribute("class", "nuevoConcepto");
    if(cantidadInput.value > 0){
        nuevoDiv.setAttribute("class", "nuevoIngreso");
        sumarCantidad(cantidadInput.value, stringIngresos, stringIngresos.innerText);
        sumarCantidad(cantidadInput.value, stringTotal, stringTotal.innerText );
    }else{
        nuevoDiv.setAttribute("class", "nuevoGasto");
        sumarCantidad(Math.abs(cantidadInput.value), stringGastos, stringGastos.innerText);
        restarCantidad(Math.abs(cantidadInput.value), stringTotal, stringTotal.innerText );
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
    
function sumarCantidad(stringCantidad, stringTotal, textStringTotal){
    const cantidadTotal = parseFloat(textStringTotal.slice(0, -1));
    const cantidadSumada = cantidadTotal + parseFloat(stringCantidad)
    stringTotal.innerText = cantidadSumada.toString().concat("€");
}

function restarCantidad(stringCantidad, stringTotal, textStringTotal){
    const cantidadTotal = parseFloat(textStringTotal.slice(0, -1));
    const cantidadSumada = cantidadTotal - parseFloat(stringCantidad)
    stringTotal.innerText = cantidadSumada.toString().concat("€");
}

function eliminarDiv(){
    const divAEliminar = this.firstChild;
    const cantidadEliminar = extraerFloat(divAEliminar)

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

function modificarTotalPorEliminacion(cantidadEliminar, elementoHTML){
    const totalAhorroFloat = extraerFloat(elementoHTML)
    elementoHTML.innerText = (totalAhorroFloat - cantidadEliminar).toString().concat("€");
}

function extraerFloat(elementoHTML){
    const stringElemento = elementoHTML.innerText;
    const floatElemento = parseFloat(stringElemento.slice(0, -1));

    return floatElemento;
}

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

    //Para acceder de nuevo a él, lo pasamos d nuevo a objeto 
    const historialLocal = localStorage.getItem('historial');
    const objhistorialLocal = JSON.parse(historialLocal)

    reconstruirHistorial(objhistorialLocal)
}

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