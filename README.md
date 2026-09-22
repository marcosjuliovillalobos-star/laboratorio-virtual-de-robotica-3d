# Laboratorio Virtual de Construcción y Programación de Robots 3D
### Taller y Laboratorio de Robótica Educativa — 3.º Año de Escuela Secundaria

Aplicación web educativa interactiva, completa, gamificada y lista para usar en el aula, orientada a que los estudiantes de 3.º año comprendan de manera visual, práctica y conceptual los fundamentos de la robótica y la automatización.

---

## 🎯 Enfoque Pedagógico

El laboratorio responde al ciclo metodológico de aprendizaje activo:
```
CONSTRUIR  ➔  CONECTAR  ➔  PROGRAMAR  ➔  SIMULAR  ➔  CORREGIR  ➔  RESOLVER
```

### Objetivos de Aprendizaje para 3.º Año
1. **Comprender qué es un robot:** Un sistema electromecánico autónomo y programable que percibe, procesa y actúa.
2. **Diferencia entre Sensores y Actuadores:**
   - **Sensores (Entradas / Inputs):** Transforman magnitudes físicas del entorno (luz, distancia) en señales eléctricas para el microcontrolador.
   - **Actuadores (Salidas / Outputs):** Transforman señales del microcontrolador en acciones físicas (giro de motores, destellos de LED, sonido de buzzer).
3. **Rol del Controlador:** El "cerebro" electrónico que ejecuta el algoritmo instrucción por instrucción.
4. **Alimentación y Energía:** Comprender que ningún circuito opera sin suministro de voltaje continuo (Batería 9V/LiPo).
5. **Algoritmos y Estructuras de Control:** Secuencia, condicionales (`Si ... entonces`) y bucles de repetición.
6. **Manejo Positivo del Error:** La simulación permite probar hipótesis, observar fallas de lógica y corregirlas sin riesgo de dañar componentes físicos.

---

## 🛠️ Módulos y Pantallas del Laboratorio

### 1. Inicio (Dashboard Pedagógico)
- Introducción y guía de inicio rápido en 5 pasos.
- Indicador de progreso de taller: Misión actual, Puntos XP, Nivel e Insignias obtenidas.
- Resumen conceptual de las 3 preguntas fundamentales de la robótica.

### 2. Constructor 3D (Taller de Montaje Modular)
- **Visualizador 3D Interactivo con Three.js:** Rotación 360°, zoom orbital y presets de cámara (Frontal, Lateral, Superior, Isométrica, Centrar).
- **Catálogo de Componentes:** Chasis, Batería, Controlador (microcomputadora), Motores de corriente continua (DC), Ruedas de tracción, Rueda loca, Sensor ultrasónico HC-SR04, Sensor de luz (LDR), LED indicador y Buzzer piezoeléctrico.
- **Ficha Técnica Pedagógica:** Al seleccionar cualquier pieza, el estudiante visualiza su función, su tipo (Entrada/Salida/Procesamiento) y ejemplos reales.
- **Acción:** Montar y retirar piezas con actualización inmediata en el modelo 3D.

### 3. Conexiones Lógicas y Circuito
- Diagrama interactivo del flujo de energía y datos:
  `ENERGÍA ➔ CONTROLADOR ➔ SENSORES (Entrada) ➔ MOTORES / LEDS (Salida)`
- **Auditoría Pedagógica con detección de causas reales:**
  - Si hay motores pero no hay batería: *"Los motores están instalados pero no recibirán corriente."*
  - Si hay sensor sin controlador: *"El sensor emite lecturas pero no hay microcontrolador que las procese."*
  - Si faltan ruedas: *"El motor girará mecánicamente pero sin neumáticos no habrá tracción."*

### 4. Programador de Bloques Visuales
- Bloques de colores de alto contraste divididos en categorías:
  - **Movimiento (Verde):** Avanzar, Retroceder, Girar Izquierda (90°), Girar Derecha (90°), Detener.
  - **Sensores (Ámbar):** Si Distancia < X cm, Si Luz < X %.
  - **Control (Índigo):** Esperar X segundos, Repetir N veces.
  - **Salidas (Violeta):** Encender LED, Apagar LED, Activar Buzzer.
- Parámetros configurables (distancia en cm, segundos, etc.).
- Soporte para bloques anidados (acciones a ejecutar dentro de la condición del sensor).
- **Traductor a Código C++ / Arduino:** Muestra pedagógicamente cómo los bloques visuales se transforman en código fuente real de microcontrolador.

### 5. Simulador 3D y Telemetría
- Arena de pruebas con física simplificada, zona de partida (verde) y zona de meta (celeste).
- **Visualización en tiempo real del haz ultrasónico** que cambia de color y ángulo al detectar obstáculos.
- **Controles:** ▶ Ejecutar, ⏸ Pausar, ⏹ Detener y ↺ Reiniciar Posición.
- Animación dinámica de giro de ruedas, LED encendido y sonido de buzzer.
- **Consola de Telemetría:** Registra paso a paso las decisiones del algoritmo y las distancias medidas.
- Detección automática de meta y celebración con confeti.

### 6. Misiones Progresivas y Gamificación
- 5 misiones graduadas:
  1. *Robot Móvil:* Avanzar en línea recta.
  2. *Detector de Obstáculos:* Detenerse antes de chocar.
  3. *Evitar Obstáculos:* Esquivar barreras y alcanzar la meta.
  4. *Robot Explorador:* Navegación multisensorial en arena compleja.
  5. *Desafío Final:* Resolución libre de laberinto.
- **Sistema de Pistas Progresivas en 3 Niveles:**
  - Pista 1: Ayuda conceptual.
  - Pista 2: Componentes sugeridos.
  - Pista 3: Lógica recomendada.
- **6 Insignias Coleccionables:** Constructor, Ingeniero de Conexiones, Programador, Explorador, Robótico y Maestro Robótico.

### 7. Aprender (Glosario y Desafíos Conceptuales)
- Contenidos teóricos fundamentales con lenguaje accesible y rigor técnico.
- Mini-desafíos interactivos tipo test con retroalimentación explicativa inmediata.

### 8. Panel Docente (Control de Aula)
- **100% Pedagógico:** Sin registros de estudiantes ni bases de datos personales (cumple con privacidad y entorno desconectado).
- **Modo Demostración:** Desbloquea todas las misiones para proyectar en clase.
- **Nivel de Dificultad:** Inicial, Intermedio o Desafío.
- **Control de Pistas y Soluciones:** El docente puede activar o desactivar pistas para evaluar en forma autónoma.
- **Forzar Misión Activa:** Permite al profesor sincronizar a toda la clase en una misma actividad.
- **Reinicios Seguros:** Reiniciar robot, misión o progreso total con confirmación.

---

## 🔒 Privacidad, Desconexión y Accesibilidad
- **100% Local y Offline:** Funciona íntegramente en el navegador sin requerir base de datos externa ni internet.
- **Sin Datos Personales:** No solicita nombres, correos ni identificadores de estudiantes.
- **Sonidos Sintetizados por Web Audio API:** Efectos sonoros generados algorítmicamente en el navegador sin descargas de audio externas.
- **Persistencia en LocalStorage:** El progreso, las piezas montadas y el código se guardan automáticamente en la máquina del alumno.
