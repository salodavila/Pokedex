// ==========================================
// REFERENCIAS A ELEMENTOS DEL DOM (HTML)
// ==========================================
// Seleccionamos el contenedor principal donde se mostrarán las tarjetas de los Pokémon
const pokemonGrid = document.getElementById('pokemonGrid');
// Seleccionamos la caja de texto donde el usuario escribe el nombre
const searchInput = document.getElementById('searchInput');
// Seleccionamos el botón que activa la búsqueda
const searchBtn = document.getElementById('searchBtn');
// Seleccionamos el botón para reiniciar el dashboard al estado inicial
const clearBtn = document.getElementById('clearBtn');
// Seleccionamos el div destinado a mostrar mensajes de "Cargando..." o "Errores"
const statusMessage = document.getElementById('statusMessage');

// Definimos la URL base de la PokeAPI para los endpoints de Pokémon
const API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

// ==========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================
// Escuchamos el evento de que el HTML ha sido completamente cargado en el navegador para iniciar la app
document.addEventListener('DOMContentLoaded', init);

// Función principal que configura los listeners (escuchadores) de eventos
function init() {
    // Llamamos inmediatamente a la función que descarga los primeros 10 Pokémon
    fetchInitialPokemon();
    
    // Al hacer clic en el botón Buscar, ejecutamos la función de búsqueda
    searchBtn.addEventListener('click', handleSearch);
    
    // Al hacer clic en el botón Restablecer, limpiamos todo y regresamos al inicio
    clearBtn.addEventListener('click', handleReset);
    
    // Escuchamos las teclas presionadas dentro de la caja de texto
    searchInput.addEventListener('keypress', (e) => {
        // Si la tecla que se presionó es específicamente 'Enter', ejecutamos la búsqueda
        if (e.key === 'Enter') handleSearch();
    });
}

// ==========================================
// OBTENCIÓN DE DATOS (API - ASYNC/AWAIT)
// ==========================================

// Función asíncrona para traer los primeros 10 Pokémon al cargar la página
async function fetchInitialPokemon() {
    // Mostramos un banner visual indicando al usuario que estamos cargando datos
    showStatus('Cargando catálogo inicial...', 'loading');
    // Limpiamos la pantalla por si había tarjetas previas dibujadas
    pokemonGrid.innerHTML = '';

    try {
        // Hacemos una petición HTTP (GET) asíncrona para obtener una lista limitada a 10 elementos
        const response = await fetch(`${API_BASE_URL}?limit=10`);
        
        // Si el servidor responde con un código de error (ej. 500, 404), lanzamos un error de inmediato
        if (!response.ok) throw new Error('No se pudo conectar con el servidor.');

        // Convertimos la respuesta HTTP en un objeto JSON manejable por JavaScript
        const data = await response.json();
        
        // La lista inicial solo nos da nombres y URLs. Necesitamos los detalles individuales.
        // Creamos un array de "promesas" llamando a la función fetchPokemonDetails por cada Pokémon
        const detailPromises = data.results.map(pokemon => fetchPokemonDetails(pokemon.url));
        
        // Ejecutamos TODAS las promesas en paralelo para optimizar la velocidad.
        // Esperamos (await) a que terminen todas antes de continuar.
        const pokemonList = await Promise.all(detailPromises);
        
        // Si todo salió bien, ocultamos el mensaje de carga
        hideStatus();
        // Mandamos la lista de objetos de Pokémon a la función encargada de dibujarlos en pantalla
        renderPokemonCards(pokemonList);

    } catch (error) {
        // Si algo falla en cualquier parte del bloque "try", se captura aquí el error
        console.error(error); // Imprimimos el error técnico en la consola para desarrollo
        // Mostramos un mensaje amigable en la interfaz para que el usuario sepa que algo falló
        showStatus('Hubo un error al cargar la lista inicial de Pokémon. Por favor intenta de nuevo.', 'error');
    }
}

// Función asíncrona auxiliar para obtener los detalles específicos de un Pokémon mediante su URL
async function fetchPokemonDetails(url) {
    // Hacemos la petición a la URL específica del Pokémon recibido
    const response = await fetch(url);
    // Si la petición falla, arrojamos un error que interrumpirá el flujo
    if (!response.ok) throw new Error('Error al obtener detalles del Pokémon.');
    // Devolvemos la promesa con el JSON detallado del Pokémon
    return await response.json();
}

// Función asíncrona encargada de realizar la búsqueda personalizada del usuario
async function handleSearch() {
    // Obtenemos el texto ingresado, quitamos espacios en blanco externos (.trim) y convertimos a minúsculas
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // Validación: si el campo de texto está vacío, advertimos al usuario y cancelamos la función
    if (!searchTerm) {
        showStatus('Por favor, escribe un nombre para buscar.', 'error');
        return;
    }

    // Mostramos estado de carga con el término que se está buscando
    showStatus(`Buscando a "${searchTerm}"...`, 'loading');
    // Limpiamos el grid para simular la transición de búsqueda
    pokemonGrid.innerHTML = '';

    try {
        // Hacemos la petición HTTP buscando directamente por el nombre del Pokémon
        const response = await fetch(`${API_BASE_URL}/${searchTerm}`);
        
        // Si la respuesta de la API no es exitosa (código de estado diferente a la serie 200)
        if (!response.ok) {
            // Si el código de estado es 404, significa que el Pokémon no existe en la base de datos de la API
            if (response.status === 404) {
                throw new Error('Pokémon no encontrado. Verifica que esté bien escrito.');
            }
            // Para cualquier otro código de error del servidor, arrojamos un error genérico
            throw new Error('Ocurrió un error en la búsqueda.');
        }

        // Convertimos el Pokémon encontrado a formato JSON
        const pokemon = await response.json();
        // Ocultamos el mensaje de carga
        hideStatus();
        // Renderizamos la tarjeta. Envolvemos el objeto único en un Array [] para reusar la función que dibuja
        renderPokemonCards([pokemon]);

    } catch (error) {
        // Capturamos cualquier error ocurrido durante el proceso de búsqueda
        console.error(error);
        // Mostramos el mensaje exacto del error en pantalla al usuario
        showStatus(error.message, 'error');
    }
}

// ==========================================
// RENDERIZADO DINÁMICO DE TARJETAS (DOM)
// ==========================================

// Función puramente síncrona que construye el HTML dinámico de los Pokémon y lo inserta en el DOM
function renderPokemonCards(pokemons) {
    // Aseguramos que la rejilla esté completamente limpia
    pokemonGrid.innerHTML = ''; 
    
    // Iteramos por cada objeto Pokémon que viene en el arreglo
    pokemons.forEach(pokemon => {
        // Guardamos el nombre del Pokémon
        const name = pokemon.name;
        
        // Intentamos obtener la imagen de alta calidad (official-artwork). Si no existe, usamos el sprite por defecto
        const imageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
        
        // Mapeamos el arreglo de tipos para extraer únicamente los nombres de los tipos en un array simple
        const types = pokemon.types.map(t => t.type.name);
        
        // Obtenemos los nombres de las habilidades y los unimos en una cadena de texto separada por comas
        const abilities = pokemon.abilities.map(a => a.ability.name).join(', ');
        
        // Buscamos dentro de las estadísticas los valores base de Vida (hp), Ataque (attack) y Defensa (defense)
        const hp = pokemon.stats.find(s => s.stat.name === 'hp').base_stat;
        const attack = pokemon.stats.find(s => s.stat.name === 'attack').base_stat;
        const defense = pokemon.stats.find(s => s.stat.name === 'defense').base_stat;

        // Creamos un nuevo elemento div en memoria que servirá como tarjeta contenedora
        const card = document.createElement('div');
        // Le asignamos la clase CSS "pokemon-card" para que tome los estilos visuales definidos en style.css
        card.classList.add('pokemon-card');
        
        // Rellenamos el HTML interno de la tarjeta usando un Template Literal (comillas invertidas ``)
        card.innerHTML = `
            <div class="pokemon-img-container">
                <img class="pokemon-img" src="${imageUrl}" alt="${name}">
            </div>
            <h2 class="pokemon-name">${name}</h2>
            
            <div class="types-container">
                ${types.map(type => `<span class="type-badge type-${type}">${type}</span>`).join('')}
            </div>
            
            <div class="details-section">
                <p class="details-title">Habilidades:</p>
                <p class="abilities">${abilities}</p>
                
                <p class="details-title">Estadísticas:</p>
                <div class="stats">
                    <span>❤️ HP: <strong>${hp}</strong></span>
                    <span>⚔️ ATK: <strong>${attack}</strong></span>
                    <span>🛡️ DEF: <strong>${defense}</strong></span>
                </div>
            </div>
        `;
        
        // Añadimos físicamente la tarjeta recién creada como un hijo del contenedor principal en la página
        pokemonGrid.appendChild(card);
    });
}

// ==========================================
// GESTIÓN DE ESTADOS DE LA INTERFAZ
// ==========================================

// Función para mostrar mensajes de estado (Cargando datos o Errores ocurridos)
function showStatus(message, type) {
    // Asignamos el texto del mensaje al div destinado para ello
    statusMessage.textContent = message;
    // Agregamos la clase general y la clase específica de estilo ('loading' o 'error')
    statusMessage.className = `status-message ${type}`;
}

// Función para esconder el mensaje de estado de la pantalla cuando el proceso termina con éxito
function hideStatus() {
    // Le aplicamos la clase "hidden" que tiene asignado un "display: none" en el CSS
    statusMessage.className = 'status-message hidden';
}

// Función para restablecer la aplicación al estado inicial limpia
function handleReset() {
    // Vaciamos el cuadro de búsqueda
    searchInput.value = '';
    // Ocultamos cualquier mensaje que estuviera en pantalla
    hideStatus();
    // Volvemos a traer los 10 Pokémon iniciales
    fetchInitialPokemon();
}