#!/usr/bin/env bash
# ==============================================================================
# AETHERIA | Fluid & Sand Studio — Lanzador de Servidor Local
# ==============================================================================

DIR_ACTUAL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR_ACTUAL" || exit 1

PUERTO=${1:-8081}

echo "======================================================="
echo " 🌊 AETHERIA: FLUID & SAND STUDIO"
echo "======================================================="
echo "📁 Directorio: $DIR_ACTUAL"
echo "🌐 Servidor en: http://localhost:$PUERTO"
echo "-------------------------------------------------------"
echo "💡 Para detener el servidor presiona: CTRL + C"
echo "💡 Si el puerto $PUERTO está ocupado, puedes usar otro:"
echo "   ./iniciar_servidor.sh 8081"
echo "======================================================="

# Abrir en segundo plano en el navegador predeterminado tras 1 segundo
(sleep 1 && (xdg-open "http://localhost:$PUERTO" 2>/dev/null || open "http://localhost:$PUERTO" 2>/dev/null) &)

# Iniciar servidor HTTP con Python 3
python3 -m http.server "$PUERTO"
