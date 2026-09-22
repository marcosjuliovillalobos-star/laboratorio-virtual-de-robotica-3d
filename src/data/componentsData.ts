import { RobotComponentDef } from '../types/robot';

export const ROBOT_COMPONENTS: RobotComponentDef[] = [
  // ESTRUCTURA
  {
    id: 'chassis',
    name: 'Chasis Base',
    category: 'structure',
    description: 'Plataforma estructural principal sobre la cual se montan todos los componentes del robot.',
    pedagogicalFunction: 'Sostiene mecánicamente y distribuye el peso de los motores, sensores y circuitos.',
    typeExplanation: 'Estructura mecánica',
    input: 'Fijación mecánica de piezas',
    output: 'Soporte y rigidez para el conjunto',
    icon: 'Layers',
    color: '#0284c7', // cyan-600
    defaultPosition: [0, 0.4, 0],
    requiredConnections: [],
  },
  {
    id: 'upper_mount',
    name: 'Soporte Superior',
    category: 'structure',
    description: 'Nivel superior del chasis que eleva los sensores y controladores protegiéndolos.',
    pedagogicalFunction: 'Permite elevar el campo de visión del sensor y organizar el cableado.',
    typeExplanation: 'Estructura mecánica',
    input: 'Anclaje sobre el chasis base',
    output: 'Espacio de montaje elevado para sensores y placas',
    icon: 'Boxes',
    color: '#38bdf8', // sky-400
    defaultPosition: [0, 0.75, 0],
    requiredConnections: ['chassis'],
  },

  // ENERGÍA
  {
    id: 'battery',
    name: 'Batería Recargable (9V / LiPo)',
    category: 'energy',
    description: 'Fuente de alimentación eléctrica autónoma para alimentar la electrónica y los motores.',
    pedagogicalFunction: 'Convierte energía química en energía eléctrica (voltaje y corriente) para energizar el circuito.',
    typeExplanation: 'Alimentación',
    input: 'Recarga eléctrica química',
    output: 'Energía eléctrica continua (DC 7.4V - 9V)',
    icon: 'BatteryCharging',
    color: '#eab308', // yellow-500
    defaultPosition: [0, 0.55, -0.2],
    requiredConnections: ['chassis'],
  },

  // CONTROL
  {
    id: 'controller',
    name: 'Controlador (Cerebro)',
    category: 'control',
    description: 'Placa microcontroladora que ejecuta el programa cargado por el estudiante.',
    pedagogicalFunction: 'Es el cerebro del robot: lee sensores, toma decisiones lógicas y envía órdenes a los actuadores.',
    typeExplanation: 'Procesamiento',
    input: 'Señales eléctricas de sensores + Alimentación',
    output: 'Señales de control PWM y digitales hacia actuadores',
    icon: 'Cpu',
    color: '#10b981', // emerald-500
    defaultPosition: [0, 0.85, 0],
    requiredConnections: ['battery', 'chassis'],
  },

  // MOVIMIENTO
  {
    id: 'left_motor',
    name: 'Motor Izquierdo (DC + Reductor)',
    category: 'movement',
    description: 'Motor de corriente continua que impulsa la rueda izquierda mediante engranajes reductores.',
    pedagogicalFunction: 'Transforma energía eléctrica en par motriz y movimiento de giro mecánico.',
    typeExplanation: 'Salida (Actuador)',
    input: 'Voltaje y señal de control del microcontrolador',
    output: 'Rotación mecánica horaria / antihoraria',
    icon: 'Cog',
    color: '#f97316', // orange-500
    defaultPosition: [-0.65, 0.35, 0],
    requiredConnections: ['controller', 'battery'],
  },
  {
    id: 'right_motor',
    name: 'Motor Derecho (DC + Reductor)',
    category: 'movement',
    description: 'Motor de corriente continua que impulsa la rueda derecha de forma independiente.',
    pedagogicalFunction: 'Permite maniobras diferenciales (avanzar, girar a un lado o pivotar en el lugar).',
    typeExplanation: 'Salida (Actuador)',
    input: 'Voltaje y señal de control del microcontrolador',
    output: 'Rotación mecánica horaria / antihoraria',
    icon: 'Cog',
    color: '#f97316',
    defaultPosition: [0.65, 0.35, 0],
    requiredConnections: ['controller', 'battery'],
  },
  {
    id: 'left_wheel',
    name: 'Rueda Izquierda con Neumático',
    category: 'movement',
    description: 'Rueda de goma de alta adherencia acoplada al eje del motor izquierdo.',
    pedagogicalFunction: 'Transmite la fuerza de tracción al suelo evitando el deslizamiento incontrolado.',
    typeExplanation: 'Estructura mecánica',
    input: 'Giro del eje del motor izquierdo',
    output: 'Desplazamiento lineal sobre la superficie',
    icon: 'Disc',
    color: '#334155', // slate-700
    defaultPosition: [-0.78, 0.35, 0],
    requiredConnections: ['left_motor'],
  },
  {
    id: 'right_wheel',
    name: 'Rueda Derecha con Neumático',
    category: 'movement',
    description: 'Rueda de goma de alta adherencia acoplada al eje del motor derecho.',
    pedagogicalFunction: 'Completa la tracción diferencial permitiendo el avance recto o curvo.',
    typeExplanation: 'Estructura mecánica',
    input: 'Giro del eje del motor derecho',
    output: 'Desplazamiento lineal sobre la superficie',
    icon: 'Disc',
    color: '#334155',
    defaultPosition: [0.78, 0.35, 0],
    requiredConnections: ['right_motor'],
  },

  // SENSORES
  {
    id: 'ultrasonic',
    name: 'Sensor Ultrasónico (HC-SR04)',
    category: 'sensor',
    description: 'Emite pulsos de sonido de alta frecuencia y mide el tiempo de eco para calcular distancia.',
    pedagogicalFunction: 'Permite al robot "ver" obstáculos frontales mediante ecolocalización, sin tocarlos.',
    typeExplanation: 'Entrada (Sensor)',
    input: 'Eco de onda sonora reflejada en un obstáculo',
    output: 'Medición de distancia en centímetros (2 cm a 400 cm)',
    icon: 'Radar',
    color: '#06b6d4', // cyan-500
    defaultPosition: [0, 0.72, 0.65],
    requiredConnections: ['controller'],
  },
  {
    id: 'light_sensor',
    name: 'Sensor de Luz (LDR / Fotocelda)',
    category: 'sensor',
    description: 'Sensor resistivo sensible a la intensidad lumínica ambiental del entorno.',
    pedagogicalFunction: 'Permite programar comportamientos fototrópicos (seguir la luz o esconderse en sombras).',
    typeExplanation: 'Entrada (Sensor)',
    input: 'Fotones de luz ambiental incidente',
    output: 'Nivel analógico de iluminación (0 a 100%)',
    icon: 'SunMedium',
    color: '#a855f7', // purple-500
    defaultPosition: [0.35, 0.75, 0.4],
    requiredConnections: ['controller'],
  },

  // SALIDAS Y ACTUADORES
  {
    id: 'led',
    name: 'LED Indicador RGB',
    category: 'output',
    description: 'Diodo emisor de luz visible para señalar estados operativos, alertas o confirmaciones.',
    pedagogicalFunction: 'Facilita la comunicación visual del robot hacia los humanos (ej: verde=ok, rojo=alerta).',
    typeExplanation: 'Salida (Actuador)',
    input: 'Señal digital ON/OFF o PWM de color',
    output: 'Luz visible de alta luminosidad',
    icon: 'Sparkles',
    color: '#ef4444', // red-500
    defaultPosition: [-0.35, 0.78, 0.4],
    requiredConnections: ['controller'],
  },
  {
    id: 'buzzer',
    name: 'Buzzer Acústico (Zumbador)',
    category: 'output',
    description: 'Transductor piezoeléctrico que emite pitidos, beeps audibles y tonos de aviso.',
    pedagogicalFunction: 'Proporciona retroalimentación sonora al detectar eventos, giros o peligros.',
    typeExplanation: 'Salida (Actuador)',
    input: 'Frecuencia eléctrica en hertz (Hz) desde el controlador',
    output: 'Sonido audible (beeps)',
    icon: 'Volume2',
    color: '#8b5cf6', // violet-500
    defaultPosition: [0, 0.75, -0.4],
    requiredConnections: ['controller'],
  },
  {
    id: 'servo',
    name: 'Servomotor de Posición (SG90)',
    category: 'actuator',
    description: 'Motor con engranajes y potenciómetro interno capaz de rotar a un ángulo exacto (0° a 180°).',
    pedagogicalFunction: 'Permite orientar el sensor ultrasónico hacia izquierda/derecha o mover un brazo articulado.',
    typeExplanation: 'Salida (Actuador)',
    input: 'Señal PWM de posición angular',
    output: 'Posicionamiento angular preciso del eje',
    icon: 'Wrench',
    color: '#14b8a6', // teal-500
    defaultPosition: [0, 0.58, 0.65],
    requiredConnections: ['controller', 'battery'],
  },
];

export const COMPONENT_CATEGORIES = [
  { id: 'all', name: 'Todos' },
  { id: 'structure', name: 'Estructura' },
  { id: 'movement', name: 'Movimiento' },
  { id: 'control', name: 'Control' },
  { id: 'energy', name: 'Energía' },
  { id: 'sensor', name: 'Sensores' },
  { id: 'output', name: 'Salidas' },
  { id: 'actuator', name: 'Actuadores' },
];
