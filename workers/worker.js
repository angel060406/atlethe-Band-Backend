const { parentPort } = require('worker_threads');

function processRegisterRead(data) {
  return data;
}

// Función para calcular estadísticas
function computeTemperatureSummary(temps) {
  temps.sort((a, b) => a - b);
  const n = temps.length;
  if (n === 0) return null;
  
  const mean = temps.reduce((acc, v) => acc + v, 0) / n;
  const median = n % 2 !== 0 
    ? temps[Math.floor(n / 2)]
    : (temps[Math.floor(n / 2) - 1] + temps[Math.floor(n / 2)]) / 2;
  
  // Cálculo de la moda
  const freq = {};
  let maxFreq = 0;
  let mode = [];
  for (const val of temps) {
    freq[val] = (freq[val] || 0) + 1;
    if (freq[val] > maxFreq) maxFreq = freq[val];
  }
  for (const k in freq) {
    if (freq[k] === maxFreq) mode.push(Number(k));
  }
  mode = (mode.length === temps.length) ? 'No hay moda' : mode.join(', ');
  
  const diffs = temps.map(v => (v - mean) ** 2);
  const std = Math.sqrt(diffs.reduce((a, b) => a + b, 0) / n);
  const min = temps[0];
  const max = temps[temps.length - 1];
  
  return { mean, median, mode, std, min, max };
}

// Procesar el histórico de temperatura
function computeTemperatureHistory(data) {
  return data;
}

// Función para calcular el modelo binomial
function computeTemperatureBinomial(temps, threshold) {
  const n = temps.length;
  if (n === 0) return null;
  
  const successes = temps.filter(t => t > threshold).length;
  const p = successes / n;
  
  // Función factorial iterativa
  const factorial = (x) => (x <= 1) ? 1 : Array.from({ length: x }, (_, i) => i + 1).reduce((a, b) => a * b, 1);
  const combination = (n, k) => factorial(n) / (factorial(k) * factorial(n - k));
  
  const distribution = [];
  for (let k = 0; k <= n; k++) {
    const prob = combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    distribution.push({ k, prob });
  }
  
  return { n, threshold, p, distribution };
}

// Escuchar el mensaje del hilo principal y ejecutar la función correspondiente
parentPort.on('message', (task) => {
  let result;
  switch (task.type) {
    case 'registerRead':
      result = processRegisterRead(task.data);
      break;
    case 'temperatureSummary':
      result = computeTemperatureSummary(task.data);
      break;
    case 'temperatureHistory':
      result = computeTemperatureHistory(task.data);
      break;
    case 'temperatureBinomial':
      result = computeTemperatureBinomial(task.data.temps, task.data.threshold);
      break;
    default:
      result = null;
  }
  parentPort.postMessage(result);
});
