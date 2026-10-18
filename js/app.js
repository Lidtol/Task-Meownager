
// ==========================================
// CUTE TASK MANAGER ♡
// Adaptado a tu index.html original
// ==========================================

class Tareas {
    constructor() {
        this.tareas = [];
        this.filtroActual = "all";
        this.idEditando = null;
        this.claveStorage = "cute-task-manager-tareas";
    }

    // Carga las tareas guardadas en el navegador
    init() {
        try {
            const datos = localStorage.getItem(this.claveStorage);

            if (datos) {
                const guardadas = JSON.parse(datos);

                if (Array.isArray(guardadas)) {
                    this.tareas = guardadas.filter(tarea =>
                        tarea &&
                        Number.isSafeInteger(tarea.id) &&
                        typeof tarea.titulo === "string" &&
                        ["alta", "media", "baja"].includes(tarea.prioridad) &&
                        typeof tarea.categoria === "string" &&
                        typeof tarea.completada === "boolean"
                    );
                }
            }
        } catch (error) {
            console.error("Error al cargar las tareas:", error);
        }

        this.renderizar();
    }

    // Guarda las tareas en localStorage
    guardar() {
        try {
            localStorage.setItem(
                this.claveStorage,
                JSON.stringify(this.tareas)
            );
        } catch (error) {
            console.error("Error al guardar las tareas:", error);
            alert("No se pudieron guardar los cambios.");
        }
    }

    // Añade una tarea nueva
    agregar(titulo, prioridad, categoria) {
        titulo = titulo.trim();

        if (!titulo) return;

        this.tareas.push({
            id: this.nuevoId(),
            titulo,
            prioridad,
            categoria: categoria.trim() || "Otros",
            completada: false
        });

        this.actualizar();
    }

    // Genera un identificador único
    nuevoId() {
        let id;

        do {
            id = Date.now() + Math.floor(Math.random() * 1000000);
        } while (this.tareas.some(tarea => tarea.id === id));

        return id;
    }

    // Edita una tarea existente
    editar(id, titulo, prioridad, categoria) {
        const tarea = this.tareas.find(t => t.id === id);

        if (!tarea || !titulo.trim()) return;

        tarea.titulo = titulo.trim();
        tarea.prioridad = prioridad;
        tarea.categoria = categoria.trim() || "Otros";

        this.actualizar();
    }

    // Marca una tarea como completada o pendiente
    cambiarEstado(id) {
        const tarea = this.tareas.find(t => t.id === id);

        if (!tarea) return;

        tarea.completada = !tarea.completada;
        this.actualizar();
    }

    // Elimina una tarea
    eliminar(id) {
        this.tareas = this.tareas.filter(t => t.id !== id);

        if (this.idEditando === id) {
            this.cancelarEdicion();
        }

        this.actualizar();
    }

    // Elimina todas las tareas completadas
    borrarCompletadas() {
        this.tareas = this.tareas.filter(t => !t.completada);

        if (
            this.idEditando !== null &&
            !this.tareas.some(t => t.id === this.idEditando)
        ) {
            this.cancelarEdicion();
        }

        this.actualizar();
    }

    // Cuenta las tareas pendientes
    pendientes() {
        return this.tareas.filter(t => !t.completada).length;
    }

    // Calcula el porcentaje de progreso
    progreso() {
        if (this.tareas.length === 0) return 0;

        const completadas = this.tareas.length - this.pendientes();

        return Math.round(
            (completadas / this.tareas.length) * 100
        );
    }

    // Guarda y vuelve a dibujar la interfaz
    actualizar() {
        this.guardar();
        this.renderizar();
    }

    // Muestra la fecha actual
    mostrarFecha() {
        const fecha = document.getElementById("date");

        fecha.textContent = new Intl.DateTimeFormat("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(new Date());
    }

    // Actualiza el resumen y la barra de progreso
    actualizarResumen() {
        const pendientes = document.getElementById("pending-tasks");
        const progreso = document.getElementById("progress");
        const porcentaje = document.getElementById("progress-percentage");
        const barra = document.getElementById("progress-bar");

        pendientes.textContent = this.pendientes();

        const valor = this.progreso();

        progreso.style.width = `${valor}%`;
        porcentaje.textContent = `Progreso: ${valor}%`;

        barra.setAttribute("role", "progressbar");
        barra.setAttribute("aria-valuemin", "0");
        barra.setAttribute("aria-valuemax", "100");
        barra.setAttribute("aria-valuenow", valor);

        const botonBorrar = document.getElementById("clear-completed");

        botonBorrar.disabled = !this.tareas.some(t => t.completada);
    }

    // Crea una etiqueta de prioridad o categoría
    crearEtiqueta(texto, clase) {
        const etiqueta = document.createElement("span");

        etiqueta.textContent = texto;
        etiqueta.className = `task-tag ${clase}`;

        return etiqueta;
    }

    // Crea la tarjeta de una tarea
    crearTarjeta(tarea) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "task-card";

        if (tarea.completada) {
            tarjeta.classList.add("completed");
        }

        // Casilla para completar la tarea
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = tarea.completada;
        checkbox.setAttribute("aria-label", "Completar tarea");

        checkbox.addEventListener("change", () => {
            this.cambiarEstado(tarea.id);
        });

        // Contenido de la tarjeta
        const contenido = document.createElement("div");
        contenido.className = "task-content";

        const titulo = document.createElement("h3");
        titulo.textContent = tarea.titulo;
        titulo.className = "task-title";

        const etiquetas = document.createElement("div");
        etiquetas.className = "task-tags";

        const prioridades = {
            alta: "🔥 Alta",
            media: "🌷 Media",
            baja: "🌱 Baja"
        };

        etiquetas.appendChild(
            this.crearEtiqueta(
                prioridades[tarea.prioridad],
                `priority-${tarea.prioridad}`
            )
        );

        etiquetas.appendChild(
            this.crearEtiqueta(tarea.categoria, "category")
        );

        contenido.append(titulo, etiquetas);

        // Botones de edición y eliminación
        const acciones = document.createElement("div");
        acciones.className = "task-actions";

        const botonEditar = document.createElement("button");
        botonEditar.type = "button";
        botonEditar.textContent = "✎";
        botonEditar.title = "Editar tarea";
        botonEditar.setAttribute("aria-label", "Editar tarea");

        botonEditar.addEventListener("click", () => {
            this.iniciarEdicion(tarea);
        });

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.textContent = "×";
        botonEliminar.title = "Eliminar tarea";
        botonEliminar.setAttribute("aria-label", "Eliminar tarea");

        botonEliminar.addEventListener("click", () => {
            if (confirm(`¿Eliminar "${tarea.titulo}"?`)) {
                this.eliminar(tarea.id);
            }
        });

        acciones.append(botonEditar, botonEliminar);
        tarjeta.append(checkbox, contenido, acciones);

        return tarjeta;
    }

    // Dibuja las tareas según el filtro seleccionado
    renderizar() {
        const lista = document.getElementById("task-list");
        const estadoVacio = document.getElementById("empty-state");

        lista.replaceChildren();

        const filtradas = this.tareas.filter(tarea => {
            if (this.filtroActual === "pending") {
                return !tarea.completada;
            }

            if (this.filtroActual === "completed") {
                return tarea.completada;
            }

            return true;
        });

        filtradas.forEach(tarea => {
            lista.appendChild(this.crearTarjeta(tarea));
        });

        // Muestra el mensaje adecuado si la lista está vacía
        estadoVacio.style.display = filtradas.length === 0 ? "block" : "none";

        const tituloVacio = estadoVacio.querySelector("h3");
        const textosVacios = estadoVacio.querySelectorAll("p");

        if (this.tareas.length === 0) {
            tituloVacio.textContent = "¡Tu lista está esperando! ♡";
            textosVacios[textosVacios.length - 1].textContent =
                "Añade una tarea para empezar tu día.";
        } else if (this.filtroActual === "pending" && filtradas.length === 0) {
            tituloVacio.textContent = "¡Todo terminado! ✨";
            textosVacios[textosVacios.length - 1].textContent =
                "No tienes tareas pendientes. ¡Buen trabajo!";
        } else {
            tituloVacio.textContent = "Aquí todavía no hay tareas ♡";
            textosVacios[textosVacios.length - 1].textContent =
                "Las tareas aparecerán aquí cuando correspondan a este filtro.";
        }

        // Actualiza el estilo del filtro activo
        document.querySelectorAll("#filters button").forEach(boton => {
            const activo = boton.dataset.filter === this.filtroActual;

            boton.classList.toggle("active", activo);
            boton.setAttribute("aria-pressed", activo);
        });

        this.actualizarResumen();
    }

    // Prepara el formulario para editar una tarea
    iniciarEdicion(tarea) {
        this.idEditando = tarea.id;

        document.getElementById("task-title").value = tarea.titulo;
        document.getElementById("task-priority").value = tarea.prioridad;
        document.getElementById("task-category").value = tarea.categoria;

        const titulo = document.getElementById("form-title");
        const botonGuardar = document.querySelector(
            '#add-task-form button[type="submit"]'
        );
        const cancelar = document.getElementById("cancel-edit");

        if (titulo) titulo.textContent = "Editar tarea ✧";
        botonGuardar.textContent = "Guardar cambios";

        if (cancelar) cancelar.hidden = false;

        document.getElementById("task-title").focus();
        document.getElementById("task-form").scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    // Restablece el formulario
    cancelarEdicion() {
        this.idEditando = null;

        const formulario = document.getElementById("add-task-form");
        formulario.reset();

        const titulo = document.getElementById("form-title");
        const botonGuardar = formulario.querySelector(
            'button[type="submit"]'
        );
        const cancelar = document.getElementById("cancel-edit");

        if (titulo) titulo.textContent = "Añadir tarea ✧";
        botonGuardar.textContent = "Añadir";

        if (cancelar) cancelar.hidden = true;
    }
}


// ==========================================
// INICIALIZACIÓN Y EVENTOS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const tareas = new Tareas();

    tareas.mostrarFecha();
    tareas.init();

    const formulario = document.getElementById("add-task-form");
    const campoTitulo = document.getElementById("task-title");
    const campoPrioridad = document.getElementById("task-priority");
    const campoCategoria = document.getElementById("task-category");

    // Añadir una tarea o guardar una edición
    formulario.addEventListener("submit", evento => {
        evento.preventDefault();

        const titulo = campoTitulo.value.trim();

        if (!titulo) {
            campoTitulo.focus();
            return;
        }

        if (tareas.idEditando !== null) {
            tareas.editar(
                tareas.idEditando,
                titulo,
                campoPrioridad.value,
                campoCategoria.value
            );

            tareas.cancelarEdicion();
        } else {
            tareas.agregar(
                titulo,
                campoPrioridad.value,
                campoCategoria.value
            );

            formulario.reset();
        }

        campoTitulo.focus();
    });

    // Filtros: Todas, Pendientes y Completadas
    document.querySelectorAll("#filters button").forEach(boton => {
        boton.addEventListener("click", () => {
            tareas.filtroActual = boton.dataset.filter;
            tareas.renderizar();
        });
    });

    // Borrar las tareas completadas
    document.getElementById("clear-completed").addEventListener("click", () => {
        const cantidad = tareas.tareas.filter(t => t.completada).length;

        if (cantidad === 0) return;

        if (confirm(`¿Borrar las ${cantidad} tareas completadas?`)) {
            tareas.borrarCompletadas();
        }
    });

    // Cancelar una edición
    const botonCancelar = document.getElementById("cancel-edit");

    if (botonCancelar) {
        botonCancelar.addEventListener("click", () => {
            tareas.cancelarEdicion();
        });
    }
});
