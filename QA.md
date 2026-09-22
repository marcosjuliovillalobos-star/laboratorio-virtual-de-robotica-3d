# Reporte de Aseguramiento de Calidad (QA) y Verificación Pedagógica
### Laboratorio Virtual de Construcción y Programación de Robots 3D

Este documento detalla las pruebas funcionales, pedagógicas y de rendimiento ejecutadas sobre la aplicación para garantizar su idoneidad en el aula de 3.º año de secundaria.

---

## 1. Matriz de Pruebas Funcionales

| Módulo | Caso de Prueba | Resultado Esperado | Estado |
| :--- | :--- | :--- | :---: |
| **Constructor 3D** | Montar y retirar componentes | Las piezas aparecen/desaparecen del chasis en la escena Three.js inmediatamente | ✅ Aprobado |
| **Constructor 3D** | Controles de cámara | Presets (Isométrica, Frontal, Lateral, Superior, Reset) orientan la vista suavemente | ✅ Aprobado |
| **Constructor 3D** | Ficha Técnica | Al hacer clic en una pieza o en la lista, se detalla qué hace, entrada, salida y tipo | ✅ Aprobado |
| **Conexiones** | Validación sin batería | Alerta roja: advierte que los motores no recibirán corriente | ✅ Aprobado |
| **Conexiones** | Validación sin controlador | Alerta roja: advierte que falta el cerebro para procesar órdenes | ✅ Aprobado |
| **Conexiones** | Validación 1 solo motor | Alerta amarilla: advierte tracción incompleta para giro diferencial | ✅ Aprobado |
| **Programador** | Agregar y reordenar bloques | Se agregan al algoritmo y los botones subir/bajar actualizan el orden | ✅ Aprobado |
| **Programador** | Bloques anidados (Condicionales) | Los bloques dentro de "Si Distancia < X" se insertan en su interior | ✅ Aprobado |
| **Programador** | Traductor C++ Arduino | Genera código sintáctico con `setup()`, `loop()` y lectura de pines | ✅ Aprobado |
| **Simulador 3D** | Haz de sensor ultrasónico | Dibuja el cono de detección y mide distancia en cm en tiempo real | ✅ Aprobado |
| **Simulador 3D** | Detección de colisión y parada | Si el bloque condicional detiene motores, el robot frena antes de chocar | ✅ Aprobado |
| **Simulador 3D** | Llegada a Meta | Detecta entrada al pad de meta (Z >= 6.8), reproduce sonido, confeti y suma XP | ✅ Aprobado |
| **Misiones** | Pistas progresivas (1, 2, 3) | Desenfoca las pistas progresivamente según la solicitud del alumno | ✅ Aprobado |
| **Misiones** | Cargar solución | Monta los componentes necesarios y carga los bloques recomendados | ✅ Aprobado |
| **Panel Docente** | Modo Demostración | Desbloquea todas las misiones simultáneamente para proyección | ✅ Aprobado |
| **Panel Docente** | Ocultar ayudas/soluciones | Deshabilita los botones de pistas en las vistas de los estudiantes | ✅ Aprobado |
| **Audio** | Web Audio API | Sintetiza beeps, clics y fanfarrias sin archivos de audio externos ni internet | ✅ Aprobado |

---

## 2. Validación Pedagógica para 3.º Año

- **Vocabulario:** Preciso y formativo sin caer en jerga inaccesible. Se refuerzan los términos *Actuador*, *Sensor*, *Controlador*, *Voltaje*, *Algoritmo*, *Condicional* y *Bucle*.
- **Visualización del Flujo:** El estudiante puede constatar visualmente que los datos fluyen desde el sensor hacia el controlador y luego a las ruedas.
- **Relación Hardware / Software:** La aplicación enseña que un programa correcto no funciona si falta el hardware correspondiente (ej: si programa "Si Distancia < 20 cm" pero no montó el sensor ultrasónico en el chasis, el sistema advierte el error).

---

## 3. Comportamiento Offline y Privacidad

- **Sin Servidor Externo:** Toda la lógica de simulación física y programación corre localmente en el hilo del navegador.
- **Cumplimiento de Privacidad Estudiantil:** No se solicitan nombres, contraseñas, correos ni identificadores de menores de edad.
- **Persistencia Segura:** Toda la información se guarda en `localStorage` del navegador bajo el prefijo `robotlab_`.
