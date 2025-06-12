document.addEventListener("DOMContentLoaded", function () {
    console.log("¡El script JS se ha cargado correctamente!");

    const btnCopy = document.getElementById("btn-copy");

    const formulario = document.getElementById("formulario");
    const generarPromptBtn = document.getElementById("generar-prompt");
    const respuestaContainer = document.getElementById("respuesta-container");
    const respuestaTexto = document.getElementById("respuesta-api");
    const btnSi = document.getElementById("btn-si");
    const btnNo = document.getElementById("btn-no");
    const btnEnviar = document.getElementById("btn-enviar");

    let respuestaUsuario = ""; // Variable para almacenar la respuesta

generarPromptBtn.addEventListener("click", async function () {
    // Guardar referencia al botón
    const botonGenerar = this;

    if (!checkFormValidity(formulario)) {
        alert("Por favor, completa todos los campos obligatorios antes de continuar.");
        return;
    }
    
    try {
        // Mostrar indicador de carga
        const loadingIndicator = document.getElementById("loading-indicator");
        loadingIndicator.style.display = "flex";
        
        // Deshabilitar el botón y cambiar estilo
        botonGenerar.disabled = true;
        botonGenerar.style.opacity = "0.7";
        botonGenerar.style.cursor = "not-allowed";
        
        const formData = new FormData(formulario);

        // Agregar timeout para evitar solicitudes eternas
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000000); // 10 minutos timeout

        const response = await fetch("/generar_prompt", {
            method: "POST",
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const formattedResponse = formatPitchDeckResponse(data.respuesta);
        respuestaTexto.innerHTML = formattedResponse;
        respuestaContainer.style.display = "block";
    } catch (error) {
        console.error("Error al obtener el prompt:", error);
        
        // Mostrar mensaje de error al usuario
        if (error.name === 'AbortError') {
            alert('La solicitud tardó demasiado. Por favor intenta nuevamente.');
        } else {
            alert('Ocurrió un error al generar el pitch deck. Por favor intenta nuevamente.');
        }
    } finally {
        // Ocultar indicador y reactivar botón
        document.getElementById("loading-indicator").style.display = "none";
        
        const boton = document.getElementById("generar-prompt");
        boton.disabled = false;
        boton.style.opacity = "1";
        boton.style.cursor = "pointer";
    }
});

    // Función para formatear el texto del pitch deck
    function formatPitchDeckResponse(text) {
        // Mantiene formato Markdown-like
        let formattedText = text;
        
        // Convertir **texto** a <strong>texto</strong>
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Mantener saltos de línea
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        // Formatear secciones de slides
        formattedText = formattedText.replace(/### \*\*(.*?)\*\*/g, '<div class="slide-section"><h4>$1</h4>');
        
        // Formatear listas
        formattedText = formattedText.replace(/^- (.*?)(<br>|$)/g, '<li>$1</li>');
        
        // Añadir divisores horizontales
        formattedText = formattedText.replace(/---/g, '<hr>');
        
        return formattedText;
    }

    // Función para manejar la selección del botón
    function manejarSeleccion(event) {
        respuestaUsuario = event.target.getAttribute("data-respuesta");

        // Aplicar estilos visuales al botón seleccionado
        btnSi.style.backgroundColor = respuestaUsuario === "Sí" ? "#28a745" : "";
        btnNo.style.backgroundColor = respuestaUsuario === "No" ? "#dc3545" : "";

        btnSi.style.opacity = respuestaUsuario === "Sí" ? "1" : "0.5";
        btnNo.style.opacity = respuestaUsuario === "No" ? "1" : "0.5";

        // Habilitar el botón de envío
        btnEnviar.style.display = "block";
    }

    // Agregar eventos a los botones
    btnSi.addEventListener("click", manejarSeleccion);
    btnNo.addEventListener("click", manejarSeleccion);

    // Enviar datos al backend y recargar la página
    btnEnviar.addEventListener("click", function () {
        const formData = new FormData(formulario);
        formData.append("respuesta_api", respuestaTexto.textContent);
        formData.append("evaluacion_usuario", respuestaUsuario); // Agregar evaluación del usuario

        fetch("/enviar_datos", {
            method: "POST",
            body: formData
        })
        .then(() => {
            location.reload();
        })
        .catch(error => console.error("Error al enviar datos:", error));
    });

    // Función para copiar el texto
btnCopy.addEventListener("click", function() {
    // Obtener el elemento con el contenido formateado
    const respuestaApiElement = document.getElementById("respuesta-api");
    
    // Crear un rango de selección para copiar con formato
    const range = document.createRange();
    range.selectNode(respuestaApiElement);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    
    try {
        // Intentar copiar con formato
        const successful = document.execCommand('copy');
        if (successful) {
            // Feedback visual
            const originalText = btnCopy.textContent;
            btnCopy.textContent = "¡Copiado!";
            btnCopy.style.backgroundColor = "#28a745";
            
            setTimeout(() => {
                btnCopy.textContent = originalText;
                btnCopy.style.backgroundColor = "";
            }, 2000);
        } else {
            fallbackCopy(respuestaApiElement.textContent);
        }
    } catch (err) {
        fallbackCopy(respuestaApiElement.textContent);
    }
    
    window.getSelection().removeAllRanges();
});
function fallbackCopy(text) {
    // Crear elemento temporal para preservar saltos de línea
    const textarea = document.createElement('textarea');
    textarea.value = convertHtmlToFormattedText(text);
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        // Feedback visual
        btnCopy.textContent = "¡Copiado (texto plano)!";
        btnCopy.style.backgroundColor = "#28a745";
    } catch (err) {
        console.error('Error al copiar:', err);
        btnCopy.textContent = "Error al copiar";
        btnCopy.style.backgroundColor = "#dc3545";
    }
    
    document.body.removeChild(textarea);
    
    setTimeout(() => {
        btnCopy.textContent = "Copiar";
        btnCopy.style.backgroundColor = "";
    }, 2000);
}

// Función para convertir HTML a texto formateado
function convertHtmlToFormattedText(html) {
    // Crear elemento temporal
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Procesar negritas
    const boldElements = tempDiv.querySelectorAll('strong');
    boldElements.forEach(el => {
        el.parentNode.replaceChild(document.createTextNode(`**${el.textContent}**`), el);
    });
    
    // Procesar saltos de línea
    const brElements = tempDiv.querySelectorAll('br');
    brElements.forEach(el => {
        el.parentNode.replaceChild(document.createTextNode('\n'), el);
    });
    
    // Procesar elementos de lista
    const liElements = tempDiv.querySelectorAll('li');
    liElements.forEach(el => {
        el.parentNode.replaceChild(document.createTextNode(`- ${el.textContent}\n`), el);
    });
    
    // Procesar encabezados
    const h4Elements = tempDiv.querySelectorAll('h4');
    h4Elements.forEach(el => {
        el.parentNode.replaceChild(document.createTextNode(`### ${el.textContent}\n`), el);
    });
    
    // Procesar separadores
    const hrElements = tempDiv.querySelectorAll('hr');
    hrElements.forEach(el => {
        el.parentNode.replaceChild(document.createTextNode('---\n'), el);
    });
    
    return tempDiv.textContent;
}

function checkFormValidity(formElement) {
    let isValid = true;
    const requiredFields = formElement.querySelectorAll("[required]");

    requiredFields.forEach((field) => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add("campo-invalido"); // Clase opcional para resaltar campos vacíos
        } else {
            field.classList.remove("campo-invalido");
        }
    });

    return isValid;
}


});
