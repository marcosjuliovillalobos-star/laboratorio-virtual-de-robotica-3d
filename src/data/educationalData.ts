export interface EducationalTopic {
  id: string;
  title: string;
  shortSummary: string;
  category: 'fundamentos' | 'hardware' | 'software' | 'pensamiento';
  icon: string;
  content: string[];
  keyTakeaway: string;
  questionTest: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const EDUCATIONAL_TOPICS: EducationalTopic[] = [
  {
    id: 'what-is-a-robot',
    title: '¿Qué es un Robot?',
    shortSummary: 'Una máquina programable capaz de percibir su entorno y actuar sobre él de forma autónoma.',
    category: 'fundamentos',
    icon: 'Bot',
    content: [
      'Un robot no es simplemente un muñeco con forma humana ni un juguete a control remoto.',
      'Un robot es un sistema electromecánico programable que posee sensores para captar información del mundo exterior, un controlador (microcomputadora) que procesa esa información siguiendo un algoritmo, y actuadores (como motores o luces) para generar acciones físicas concretas.',
      'Si una máquina no puede percibir su entorno ni tomar decisiones automáticas por programa, no es un robot autónomo; es solo un dispositivo teledirigido o una máquina fija.',
    ],
    keyTakeaway: 'Fórmula básica del robot: Sensores (Sienten) + Controlador (Piensa) + Actuadores (Actúan).',
    questionTest: {
      question: '¿Cuál de estos dispositivos cumple con la definición de robot autónomo?',
      options: [
        'Un auto a control remoto dirigido por una persona con palancas',
        'Una aspiradora inteligente que detecta paredes y limpia esquivándolas',
        'Una licuadora que gira a velocidad fija durante 1 minuto',
        'Un ventilador de techo que gira cuando se presiona la tecla de la pared',
      ],
      correctIndex: 1,
      explanation: 'La aspiradora posee sensores para medir distancias, procesa los datos y decide por sí misma hacia dónde doblar sin que nadie la controle con un control remoto.',
    },
  },
  {
    id: 'sensors-vs-actuators',
    title: 'Sensores vs. Actuadores',
    shortSummary: 'La diferencia esencial entre las "entradas" y las "salidas" del sistema.',
    category: 'hardware',
    icon: 'Cpu',
    content: [
      'SENSORES (Entradas): Son los "órganos de los sentidos" del robot. Captan magnitudes físicas de la realidad (luz, calor, sonido, distancia, tacto) y las transforman en señales eléctricas comprensibles para el controlador.',
      'Ejemplos de sensores: Sensor ultrasónico (distancia), sensor de luz LDR, pulsadores de choque (contacto), acelerómetros.',
      'ACTUADORES (Salidas): Son los "músculos y voz" del robot. Reciben órdenes eléctricas desde el controlador y las convierten en efectos físicos (movimiento, luz, sonido, calor).',
      'Ejemplos de actuadores: Motores de corriente continua (DC), servomotores, luces LED, buzzers acústicos.',
    ],
    keyTakeaway: 'Los sensores ingresan datos del mundo al robot; los actuadores producen cambios del robot hacia el mundo.',
    questionTest: {
      question: 'Si queremos que el robot emita un pitido cuando está marcha atrás, ¿qué componente necesitamos?',
      options: [
        'Un sensor ultrasónico (Entrada)',
        'Un buzzer acústico (Salida / Actuador)',
        'Un sensor de luz LDR (Entrada)',
        'Una batería recargable (Energía)',
      ],
      correctIndex: 1,
      explanation: 'El buzzer es un actuador de salida: convierte la señal eléctrica del controlador en vibración sonora audible.',
    },
  },
  {
    id: 'controller-and-energy',
    title: 'El Cerebro y el Corazón: Controlador y Batería',
    shortSummary: 'El microcontrolador procesa algoritmos y la batería suministra la energía vital.',
    category: 'hardware',
    icon: 'BatteryCharging',
    content: [
      'CONTROLADOR (Microcontrolador): Es una microcomputadora en un único chip. Contiene procesador, memoria y pines de entrada/salida (I/O). En él se almacena y ejecuta el código o los bloques que programas.',
      'BATERÍA (Fuente de Poder): Todo circuito requiere diferencia de potencial (voltaje) y flujo de electrones (corriente) para funcionar. Los motores consumen bastante corriente mecánica, por lo que una fuente de energía deficiente provocará reinicios o fallas en el robot.',
      'Sin batería, el controlador no despierta. Sin controlador, los motores están ciegos y no saben cuándo girar.',
    ],
    keyTakeaway: 'La energía alimenta los componentes; el controlador les da propósito y coordinación.',
    questionTest: {
      question: '¿Qué sucede si conectamos los motores directamente a la batería sin pasar por el controlador?',
      options: [
        'El robot esquivará obstáculos inteligentemente',
        'Los motores girarán a máxima velocidad continuamente sin poder frenar ni tomar decisiones',
        'El robot no se moverá nunca',
        'El sensor ultrasónico tomará el control automático',
      ],
      correctIndex: 1,
      explanation: 'Sin controlador intermediario, no hay cerebro para leer sensores ni ejecutar lógica: el motor solo recibe corriente constante y gira sin control.',
    },
  },
  {
    id: 'robot-pipeline',
    title: '¿Cómo piensa un Robot? (Ciclo E-P-S)',
    shortSummary: 'El ciclo infinito de Entrada → Procesamiento → Salida.',
    category: 'pensamiento',
    icon: 'GitBranch',
    content: [
      'Todos los robots operan en un bucle repetitivo de tres etapas fundamentales:',
      '1. ENTRADA (Sensar): El sensor ultrasónico envía una onda y mide el rebote. Valor leído: 15 cm.',
      '2. PROCESAMIENTO (Decidir): El controlador compara: "¿15 cm es menor que el umbral de 20 cm fijado en el programa?". Resultado lógico: VERDADERO (peligro inminente).',
      '3. SALIDA (Actuar): El programa ordena a los pines: Detener motor izquierdo, activar motor derecho en reversa (girar) y encender el LED rojo de advertencia.',
      'Este ciclo se repite cientos de veces por segundo, dando la ilusión de reflejos en tiempo real.',
    ],
    keyTakeaway: 'Todo comportamiento robótico inteligente se resume en: Sensar -> Decidir -> Actuar.',
    questionTest: {
      question: 'En el ciclo de un robot, ¿a qué fase corresponde "comparar si la distancia medida es menor a 20"?',
      options: [
        'Entrada (Sensado)',
        'Procesamiento (Decisión algorítmica)',
        'Salida (Acción motriz)',
        'Alimentación química',
      ],
      correctIndex: 1,
      explanation: 'Comparar valores, evaluar condiciones lógicas (si/entonces) y tomar resoluciones ocurre en la fase de Procesamiento dentro del microcontrolador.',
    },
  },
  {
    id: 'block-programming-logic',
    title: 'Algoritmos y Lógica de Bloques',
    shortSummary: 'Instrucciones ordenadas, paso a paso, sin ambigüedades.',
    category: 'software',
    icon: 'Layers',
    content: [
      'Un algoritmo es una secuencia finita, ordenada y no ambigua de instrucciones para resolver un problema determinado.',
      'Las computadoras no "adivinan"; ejecutan al pie de la letra lo que programamos.',
      'La programación por bloques permite a los estudiantes de secundaria concentrarse en la lógica del problema (secuencia, condiciones, repeticiones) sin frustrarse por errores tipográficos de sintaxis (como olvidar un punto y coma o una llave).',
      'Cada bloque visual encierra internamente instrucciones reales que luego se traducen a lenguajes como C++ / Arduino o Python.',
    ],
    keyTakeaway: 'Aprender la lógica algorítmica es la habilidad fundamental; la sintaxis de cualquier lenguaje viene después.',
    questionTest: {
      question: 'Si le decimos al robot "Avanzar hasta que encuentres una pared", ¿cuál es la estructura lógica adecuada?',
      options: [
        'Un bloque simple de Esperar 1 segundo',
        'Un bloque condicional: Si Distancia < umbral entonces Detenerse',
        'Apagar la batería para que no gaste energía',
        'Cambiar las ruedas por unas más grandes',
      ],
      correctIndex: 1,
      explanation: 'La condición lógica "Si la distancia es menor a un umbral" evalúa constantemente el sensor y ordena detenerse al cumplirse.',
    },
  },
];
