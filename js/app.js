/** 
 * Variables globales 
 */
let USUARIOS = {
    admin: "admin123",
    usuario: "1234",
    demo: "demo"
};
let usuarioActual=null;
let peliculasGlobales=[];
let peliculaEnEdicion=null;
// He creado una constante GENEROS con la lista de géneros y una nueva función
let GENEROS = [
    "Acción", "Drama", "Comedia", "Ciencia Ficción", "Terror", "Aventura", 
    "Suspenso", "Documental", "Animación", "Musical", "Romance", 
    "Familiar", "Histórico", "Western", "Fantasía", "Misterio", 
    "Thriller", "Crimen"
];

/**
 * Inicialización de la app
 */
document.addEventListener("DOMContentLoaded", () => {
    iniciarApp(); // Cargar aplicacion
    eventos(); // Cargar eventos
});

/**
 * Inicia la aplicacion y carga los usuarios registrados
 */
function iniciarApp() {
    // Cargar usuarios registrados en localStorage:
    cargarUsuariosRegistrados();
    // Cargar géneros dinámicamente:
    cargarGeneros();
    // Verificar si hay usuario logeado: 
    let userLogged=localStorage.getItem("usuarioLogueado");
    if(userLogged){
        usuarioActual=JSON.parse(userLogged);
        mostrarDashboard();
    }
    // Cargar peliculas de ejemplo primera vez):
    if(!localStorage.getItem("peliculas")){
        cargarPeliculasEjemplo();
    }
}

/**
 * Carga los usuarios registrados en localStorage
 */
function cargarUsuariosRegistrados(){
    // Obtener usuarios de localstorage y agregarlo a la variable USUARIOS
    let usuariosRegistrados=JSON.parse(localStorage.getItem("usuariosRegistrados"));
    if(usuariosRegistrados){
        Object.assign(USUARIOS,usuariosRegistrados);
    }   
}

/**
 * Cargar generos en los selects
 * @description Recorre el array y genera las etiquetas <option> dinámicamente. Esta función se llama al iniciar la app.
 */
function cargarGeneros() {
    let selects = ["#inputGenero", "#selectGenero"];
    selects.forEach(id => {
        let select = document.querySelector(id);
        if(!select) return;        
        // Mantener solo la primera opción (placeholder):
        let placeholder = select.firstElementChild;
        select.innerHTML = "";
        select.appendChild(placeholder);
        // Generar opciones dinámicamente:
        GENEROS.forEach(genero => {
            let option = document.createElement("option");
            // Value simplificado: Acción -> Accion, Ciencia Ficción -> CienciaFiccion
            option.value = genero.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ""); 
            option.textContent = genero;
            select.appendChild(option);
        });
    });
}

/**
 * Eventos del usuario
 */
function eventos(){
    // Eventos de boton login:
    document.querySelector("#formLogin").addEventListener("submit",login);  
    // Eventos de boton logout:  
    document.querySelector("#btnSalir").addEventListener("click",logout);
    // Eventos de boton registro:
    document.querySelector("#formRegistro").addEventListener("submit",register);
    // Eventos de boton guardar pelicula:
    document.querySelector("#btnGuardarPelicula").addEventListener("click",guardarPelicula);  
    // Evento de busqueda en tiempo real:
    document.querySelector("#inputBuscar").addEventListener("input", filtrarPeliculas); // He añadido un "listener" al input de búsqueda (#inputBuscar) que dispara la función filtrarPeliculas cada vez que el usuario escribe (input).
    // Evento de filtro por genero:
    document.querySelector("#selectGenero").addEventListener("change", filtrarPeliculas);    
}

/**
 * Inicia sesion
 */
function login(e){
    e.preventDefault();
    let user=document.querySelector("#inputUser").value;
    let password=document.querySelector("#inputPassword").value;
    if(USUARIOS[user] && USUARIOS[user]===password){
        usuarioActual={user};
        localStorage.setItem("usuarioLogueado",JSON.stringify(user));
        mostrarDashboard();
        document.querySelector("#formLogin").reset();
        // Evento de boton agregar:
    document.querySelector("#btnAgregar").style.visibility="visible";
    }else{
        alert("Usuario o contraseña incorrectos");
    }
}

/**
 * Muestra el dashboard
 */

function mostrarDashboard(){
    document.querySelector("#loginSection").style.display="none";
    document.querySelector("#btnEntrar").style.display="none";
    document.querySelector("#mainContent").style.display="block";
    document.querySelector("#btnSalir").style.display="block";
    document.querySelector("#btnAgregar").style.display="block";
    document.querySelector(".userLogged").textContent=usuarioActual;
    // Cargar peliculas:
    cargarPeliculas();
}

/**
 * Muestra el login
 */
function mostrarLogin(){
    document.querySelector("#loginSection").style.display="flex";
    document.querySelector("#btnEntrar").style.display="block";
    document.querySelector("#mainContent").style.display="none";
    document.querySelector("#btnSalir").style.display="none";
    document.querySelector("#btnAgregar").style.display="none";
}

/**
 * Cierra sesion
 */
function logout(){
    let confirmar=confirm("¿Desea cerrar la sesión?");  
    if(confirmar){
        localStorage.removeItem("usuarioLogueado");
        usuarioActual=null;
        mostrarLogin();
        document.querySelector("#formLogin").reset();
    }
}

/**
 * Registra un nuevo usuario
 */
function register(e){
    e.preventDefault();    
    // Obtener valores:
    let nombre = document.querySelector("#inputNombre").value.trim();
    let email = document.querySelector("#inputEmail").value.trim();
    let usuario = document.querySelector("#inputUserReg").value.trim();
    let password = document.querySelector("#inputPasswordReg").value;
    let confirmPassword = document.querySelector("#inputConfirmPassword").value;    
    // Validar campos vacíos:
    if(!nombre || !email || !usuario || !password || !confirmPassword){
        return alert("Todos los campos son obligatorios");
    }
    // Validar longitud de usuario
    if(usuario.length < 4){       
        return alert("El usuario debe tener al menos 4 caracteres");
    }
    // Validar longitud de contraseña:
    if(password.length < 6){
        return alert("La contraseña debe tener al menos 6 caracteres");
    }
    // Validar coincidencia de contraseñas
    if(password !== confirmPassword){
        return alert("Las contraseñas no coinciden");
    }    
    // Validar existencia del usuario:
    if(USUARIOS[usuario]){
        return alert("El usuario ya existe, intente con otro");
    }
    // Registro exitoso:
    USUARIOS[usuario] = password; // Actualizar memoria
    // Actualizar localStorage:
    const usuariosRegistrados = JSON.parse(localStorage.getItem("usuariosRegistrados")) || {};
    usuariosRegistrados[usuario] = password;
    localStorage.setItem("usuariosRegistrados", JSON.stringify(usuariosRegistrados));    
    // Limpiar formulario:
    alert(`Usuario ${usuario} registrado con exito ✅, inicia sesion`);
    e.target.reset(); // Limpiar formulario actual
    document.querySelector("#login-tab").click(); // Cambiar a pestaña de login
}
/**
 * Cargar peliculas de ejemplo
 */
function cargarPeliculasEjemplo(){
    let peliculasEjemplo=[
        {
            id:1,
            titulo:"The Matrix",
            genero:"Ciencia Ficcion",
            director:"Hermanas Wachowski",
            anio:1999,            
            calificacion:8.7,
            descripcion:"Un hacker descubre que la realidad es una simulacion creada por maquinas",
            imagen:"https://original.fontsinuse.com/fontsinuse.com/use-images/170/170601/170601.jpeg",
            fecha: new Date()
        },
        {
            id:2,
            titulo:"Titanic",
            genero:"Drama",
            director:"James Cameron",
            anio:1997,
            calificacion:7.8,
            descripcion:"Un romance entre un hombre pobre y una mujer rica a bordo del Titanic",
            imagen:"https://www.originalfilmart.com/cdn/shop/products/titanic_1997_original_film_art_713cc08c-5fe2-49d1-bd32-51a1d5890d43_5000x.jpg",
            fecha: new Date()
            },
        {
            id:3,
            titulo:"The Lion King",
            genero:"Animacion",
            director:"Roger Allers, Rob Minkoff",
            anio:1994,
            calificacion:8.5,
            descripcion:"Un joven principe lion debe reclamar su trono de las garras de su tio malvado",
            imagen:"https://i.ebayimg.com/images/g/IWkAAOSwUTphZOzG/s-l1200.jpg",
            fecha: new Date()
        },
        {
            id:4,
            titulo:"The Dark Knight",
            genero:"Accion",
            director:"Christopher Nolan",
            anio:2008,
            calificacion:9.0,
            descripcion:"Batman se enfrenta a su mayor desafio cuando el Joker amenaza con sumir a Gotham en el caos",
            imagen:"https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
            fecha: new Date()
        },
        {
            id:5,
            titulo:"The Matrix 2",
            genero:"Ciencia Ficcion",
            director:"Lana Wachowski, Lilly Wachowski",
            anio:2003,
            calificacion:7.2,
            descripcion:"Neo y la puerta al creador de la simulacion",
            imagen:"https://image.tmdb.org/t/p/original/9IJXJoKZburoWwf0rmi5sVA7HIi.jpg",
            fecha: new Date()
        },
        {
            id:6,
            titulo:"The Matrix 3",
            genero:"Ciencia Ficcion",
            director:"Lana Wachowski, Lilly Wachowski",
            anio:2003,
            calificacion:7.9,
            descripcion:"Neo es el escogido para salvar el mundo de la simulacion creada por maquinas",
            imagen:"https://i.pinimg.com/originals/de/b7/33/deb7335fa11d8cb0e7d0ce6acf4033bc.jpg",
            fecha: new Date()
        },
        {
            id:7,
            titulo:"The Matrix Resurrections",
            genero:"Ciencia Ficcion",
            director:"Lana Wachowski, Lilly Wachowski",
            anio:2023,
            calificacion:6.9,
            descripcion:"Neo y Trinity regresan a la batalla final",
            imagen:"https://m.media-amazon.com/images/M/MV5BMGJkNDJlZWUtOGM1Ny00YjNkLThiM2QtY2ZjMzQxMTIxNWNmXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg",
            fecha: new Date()
        },
        {
            id:8,
            titulo:"Bob Esponja",
            genero:"Animacion",
            director:"Timothy Leary",
            anio:2004,
            calificacion:6.9,
            descripcion:"Bob Esponja es un pez que vive en el fondo del océano",
            imagen:"https://4.bp.blogspot.com/-SdCRW2H_pog/VMjvTGlESdI/AAAAAAAAAJI/3ASMNDwVh_g/s1600/spongebob_out_of_water_new_poster-20151+(2).jpg",
            fecha: new Date()
        },
        {
            id:9,
            titulo:"Man of Steel",
            genero:"Acción",
            director:"Zack Snyder",
            anio:2013,
            calificacion:7.0,
            descripcion:"Un niño alienígena es enviado desde el planeta Krypton a la Tierra, donde crece como Clark Kent. Al descubrir sus poderes, debe enfrentarse a los supervivientes de su mundo natal que amenazan la paz en la Tierra.",
            imagen:"https://www.shockya.com/news/wp-content/uploads/Man-of-Steel-Epic-Logo-Poster.jpg",
            fecha: new Date()
        },
    ];    
    // Guardar en localStorage:
    localStorage.setItem("peliculas",JSON.stringify(peliculasEjemplo));
}

/**
 * Cargar peliculas desde localStorage
 */
function cargarPeliculas(){
    let peliculas = JSON.parse(localStorage.getItem("peliculas"));
    peliculasGlobales = peliculas ? peliculas : [];
    // Mostrar peliculas en el grid:
    renderizarGrid(peliculasGlobales);
    renderizarSlider();
}

/**
 * Renderizar grid peliculas
 */
function renderizarGrid( pelis ){
    let grid=document.querySelector("#gridPeliculas");
    let sinResultados=document.querySelector("#sinResultados");    
    if(pelis.length === 0){
        sinResultados.style.display="block";
        grid.innerHTML="";
        return;
    }
    sinResultados.style.display="none";
    grid.innerHTML=pelis.map( p => 
        `
            <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="movie-card">
                    <img src="${p.imagen}" alt="${p.titulo}" class="movie-image" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/c/c2/No_image_poster.png'">
                    <div class="movie-content">
                        <h5 class="movie-title">${p.titulo}</h5>
                        <span class="movie-genre">${p.genero}</span>                        
                        <div class="movie-meta"><strong>${p.anio}</strong> - ${p.director}</div>
                        <div class="movie-rating">⭐${p.calificacion}/10</div>
                        <div class="movie-description">${p.descripcion}</div>
                        <div class="movie-actions">
                            <button class="btn btn-info" onclick="verDetalles(${p.id})"> <i class="bi bi-eye"></i> Ver detalles</button>
                            <button class="btn btn-warning" onclick="editarPelicula(${p.id})"> <i class="bi bi-pencil-square"></i> Editar</button>
                            <button class="btn btn-danger" onclick="eliminarPelicula(${p.id})"> <i class="bi bi-trash"></i> Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        `
    ).join("");    
}

/**
 * Agregar o editar peliculas
 */
function guardarPelicula(){
    // Obtener datos del formulario:
    let titulo = document.querySelector("#inputTitulo").value.trim();
    let genero = document.querySelector("#inputGenero").value.trim();
    let director = document.querySelector("#inputDirector").value.trim();
    let anio = document.querySelector("#inputAnio").value.trim();
    let calificacion = document.querySelector("#inputCalificacion").value.trim();
    let descripcion = document.querySelector("#inputDescripcion").value.trim();
    let imagen = document.querySelector("#inputImagen").value.trim();
    
    // Validar si estamos editando o agregando:
    if(peliculaEnEdicion){
        //alert("ℹ️ Está editando una pelicula!")        
        let index = peliculasGlobales.findIndex(p => p.id === peliculaEnEdicion.id);
        if(index !== -1){
            peliculasGlobales[index] = {
                ...peliculasGlobales[index], // Copiar propiedades existentes de peliculasGlobales
                titulo,
                genero,
                director,
                anio,
                calificacion,
                descripcion,
                imagen
            }
            alert("Película actualizada correctamente ✅");
        }
    }else{
        //alert("ℹ️ Está agregando una pelicula!")
        // Agregar nueva película:
        let nuevaPelicula = {
            id: new Date().getTime(),
            titulo,
            genero,
            director,
            anio,
            calificacion,
            descripcion,
            imagen,
            fecha: new Date()
        };
        // Agregar nueva película a la lista de películas:
        peliculasGlobales.unshift(nuevaPelicula);
        alert("Película agregada correctamente ✅");        
    }
    // Agregar nueva película al localStorage:
    localStorage.setItem("peliculas",JSON.stringify(peliculasGlobales));
    peliculaEnEdicion = null; // Limpiar variable de edición
    // Cargar peliculas en el dashboard:
    cargarPeliculas();       
    // Cerrar/esconder modal:
    bootstrap.Modal.getInstance(document.querySelector("#modalAdd")).hide();
    //document.querySelector("#modalAgregarPelicula").style.display="none";
    // Limpiar formulario:
    document.querySelector("#formPelicula").reset();
    //document.querySelector("#inputTitulo").value="";
    //document.querySelector("#inputGenero").value="";
    //document.querySelector("#inputDirector").value="";
    //document.querySelector("#inputAnio").value="";
    //document.querySelector("#inputCalificacion").value="";
    //document.querySelector("#inputDescripcion").value="";
    //document.querySelector("#inputImagen").value="";
    // Refrescar la pagina:
    //location.reload();        
    
    
}
/**
 * Editar pelicula
 */
function editarPelicula(id){
    // Buscar la pelicula por id:
    let pelicula = peliculasGlobales.find(p => p.id === id);
    if(pelicula){
        // Cambiar titulo del modal:
        document.querySelector("#modalAddLabel").textContent = "Editar Película";
        // Cambiar texto del boton:
        document.querySelector("#btnGuardarPelicula").textContent = "Actualizar";
        // Llenar el formulario con los datos de la pelicula:
        document.querySelector("#inputTitulo").value = pelicula.titulo;
        document.querySelector("#inputGenero").value = pelicula.genero;
        document.querySelector("#inputDirector").value = pelicula.director;
        document.querySelector("#inputAnio").value = pelicula.anio;
        document.querySelector("#inputCalificacion").value = pelicula.calificacion;
        document.querySelector("#inputDescripcion").value = pelicula.descripcion;
        document.querySelector("#inputImagen").value = pelicula.imagen;
        // Guardar la pelicula en edicion:
        peliculaEnEdicion = pelicula;
        // Mostrar el modal:
        let modal=new bootstrap.Modal(document.querySelector("#modalAdd"));
        modal.show();
    }
}

/**
 * Eliminar pelicula
 */
function eliminarPelicula(id){
    // Encontrar la película para mostrar el nombre:
    let pelicula = peliculasGlobales.find(p => p.id === id);
    if (!pelicula) return;
    // Confirmar eliminación:
    let confirmar = confirm(`¿Está seguro de eliminar la película "${pelicula.titulo}"?`);
    if(confirmar){
        // Buscar o filtar las peliculas diferentes al id:
        peliculasGlobales = peliculasGlobales.filter(p => p.id !== id);
        // Actualizar localStorage y vista:
        localStorage.setItem("peliculas", JSON.stringify(peliculasGlobales));
        // Cargar peliculas en el dashboard:
        cargarPeliculas(); // Emplear este o el renderizarGrid(peliculasGlobales);
        // Mostrar mensaje de eliminacion:
        alert("Película eliminada correctamente ✅");
    }
}

/**
 * Ver detalles de una pelicula
 */
function verDetalles(id){
    // Buscar la pelicula por id para mostrar los detalles:
    let pelicula = peliculasGlobales.find(p => p.id === id);
    if(pelicula){
        // Llenar el modal con los datos de la pelicula:
        document.querySelector("#detallesTitulo").textContent = pelicula.titulo;
        document.querySelector("#detallesGenero").textContent = pelicula.genero;
        document.querySelector("#detallesDirector").textContent = pelicula.director;
        document.querySelector("#detallesAnio").textContent = pelicula.anio;
        document.querySelector("#detallesCalificacion").textContent = pelicula.calificacion;
        document.querySelector("#detallesDescripcion").textContent = pelicula.descripcion;
        document.querySelector("#detallesImagen").src = pelicula.imagen;
        // Mostrar el modal de detalles:
        let modal = new bootstrap.Modal(document.querySelector("#modalDetalles"));
        modal.show();
    }
}

/** 
 * Renderizar slider de películas recientes
*/
function renderizarSlider(){
    let sliderContainer = document.querySelector("#carouselMovies"); // Seleccionar #carouselMovies como el contenedor donde se inyectarán las tarjetas de las películas, en lugar de limpiar todo el contenedor pardre #sliderPeliculas (Lo que habría borrado los botones de navegación).
    if(!sliderContainer) return;    
    // Limpiar contenido previo del carrusel (No del contenedor principal):
    sliderContainer.innerHTML = "";    
    // Obtener las últimas 10 películas agregadas (Invertir array o usar fecha si existe):    
    let peliculasRecientes = peliculasGlobales.slice(0, 10);//Asumiendo que las nuevas se agregan al inicio con unshift, se toman las primeras 10    
    peliculasRecientes.forEach(p => {
        // Crear el elemento de la tarjeta pelicula:
        let card = document.createElement("div");
        card.className = "slider-movie-card";        
        card.innerHTML = `            
            <img src="${p.imagen}" alt="${p.titulo}" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/c/c2/No_image_poster.png'">
            <div class="slider-movie-info">
                <h6>${p.titulo}</h6>
                <small class="text-muted">${p.anio}</small>
            </div>
        `;        
        // Agregar evento para ver detalles:
        card.addEventListener("click", () => verDetalles(p.id));
        // Agregar al contenedor del carrusel:
        sliderContainer.appendChild(card);
    });
}

/** 
 * Desplazar el slider horizontalmente 
 */
function scrollSlider(direccion){
    let slider = document.querySelector("#carouselMovies");
    if(!slider) return;    
    let scrollAmount = 300; // Ancho aproximado de desplazamiento    
    slider.scrollBy({ // Ahora aplica el desplazamiento (scrollBy) al elemento #carouselMovies, que es el que contiene las películas y debe desplazarse horizontalmente, manteniendo los botones fijos en los extremos.
        left: scrollAmount * direccion,
        behavior: "smooth"
    });    
}


/**
 * Filtrar peliculas por busqueda de texto y/o genero
 */
function filtrarPeliculas(){
    let termino = document.querySelector("#inputBuscar").value.toLowerCase().trim();
    let generoSeleccionado = document.querySelector("#selectGenero").value;    
    let propsExcluidas = ["genero","descripcion", "imagen"];
    let resultados = peliculasGlobales.filter(p => {
        // Filtrar por texto (Busqueda):
        let coincideTexto = true;
        if(termino !== ""){
            coincideTexto = Object.keys(p).some(key => {
                if(propsExcluidas.includes(key)) return false;
                let valor = p[key];
                if(valor === null || valor === undefined) return false;
                return String(valor).toLowerCase().includes(termino);
            });
        }
        // Filtrar por genero:
        let coincideGenero = true;
        if(generoSeleccionado !== ""){
            // Normalizar valores para comparar (Acción vs Accion)
            let generoPelicula = p.genero ? p.genero.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "") : "";
            coincideGenero = generoPelicula === generoSeleccionado;
        }
        return coincideTexto && coincideGenero;
    });
    renderizarGrid(resultados);
}

/**
 * Limpiar filtros de busqueda y genero
 * @description Limpia los campos de busqueda y genero y recarga todas las películas
 */
function limpiarFiltros(){
    document.querySelector("#inputBuscar").value = "";
    document.querySelector("#selectGenero").value = "";
    cargarPeliculas(); // Recargar todas las películas
}

