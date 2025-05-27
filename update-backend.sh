#!/bin/bash

echo "🔄 Iniciando actualización del backend..."

# Ruta al proyecto
cd ~/workspace/WakaOnLan-Proyect/backendWakeTv || {
  echo "❌ No se pudo acceder al directorio del proyecto.";
  exit 1;
}

# Cambiar a rama test
echo "🌿 Cambiando a rama test..."
git checkout test

# Hacer pull de los últimos cambios
echo "⬇️ Haciendo git pull de test..."
git pull origin test

# Instalar nuevas dependencias si hay
echo "📦 Verificando dependencias..."
npm install

# Reiniciar el backend con pm2 usando entorno de producción
echo "🚀 Reiniciando backend con PM2 (entorno producción)..."
NODE_ENV=production pm2 restart backendWakeTv

echo "✅ Backend actualizado y reiniciado correctamente."
