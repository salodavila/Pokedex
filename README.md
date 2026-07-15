# 🚀 PokeDashboard - Explorador de Pokémon en Tiempo Real

¡Bienvenido a **PokeDashboard**! Una aplicación web moderna, interactiva y responsiva que consume datos en tiempo real desde la popular [PokéAPI](https://pokeapi.co/). 

El objetivo principal de este proyecto es demostrar el uso de buenas prácticas en JavaScript vanilla, utilizando asincronía moderna (`async/await`), maquetación responsiva con CSS Grid y un manejo profesional de errores para garantizar la estabilidad de la aplicación.

---

## 📋 Características Principales

* **Carga Inicial Optimizada:** Consulta de forma paralela (`Promise.all`) y renderizado automático de los primeros 10 Pokémon de la Pokédex.
* **Buscador en Tiempo Real:** Permite buscar cualquier Pokémon por su nombre o ID.
* **Diseño Moderno e Interactivo:** Interfaz atractiva y adaptativa construida con CSS Grid y Flexbox. Las tarjetas cambian de color dinámicamente según el tipo de Pokémon principal.
* **Información Detallada:** Visualización de estadísticas clave (❤️ Vida, ⚔️ Ataque, 🛡️ Defensa), habilidades e imágenes en alta definición.
* **Manejo Profesional de Errores:** Control de fallos de red o búsquedas fallidas (como Pokémon no existentes) mediante bloques `try/catch` sin interrumpir la ejecución de la app.

---

## 🛠️ Tecnologías Utilizadas

* **HTML5:** Estructura semántica del Dashboard.
* **CSS3:** Estilos responsivos utilizando variables de diseño, CSS Grid, Flexbox y transiciones suaves.
* **JavaScript (ES6+):** Lógica de control, manipulación dinámica del DOM y manejo de APIs.
* **PokeAPI:** API REST externa utilizada para la extracción de datos.

---

## 📂 Estructura del Proyecto

El proyecto mantiene una arquitectura limpia y modular de archivos separados:

```text
PokeDashboard/
│
├── index.html       # Estructura y marcado semántico de la aplicación
├── css/
    ├──style.css     # Hoja de estilos global, paleta de colores y responsive design
├── js/
    ├──app.js        # Lógica JavaScript, consumo asíncrono de API y renderizado de tarjetas
└── README.md        # Documentación general del proyecto