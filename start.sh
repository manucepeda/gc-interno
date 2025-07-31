#!/bin/bash

# Editor de Curriculum - FING
# Script de inicio mejorado

echo "🎓 Editor de Curriculum - FING"
echo "================================"

# Change to the script directory
cd "$(dirname "$0")"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 no encontrado. Por favor instala Python3."
    exit 1
fi

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
    echo "📁 Creando directorio de datos..."
    mkdir -p data
fi

# Check if data file exists, create basic one if not
if [ ! -f "data/ucs-migrated.json" ]; then
    echo "📄 Creando archivo de datos inicial..."
    cat > data/ucs-migrated.json << 'EOF'
[
  {
    "codigo": "P1",
    "nombre": "Programación 1",
    "creditos": 12,
    "semestre": 1,
    "dictation_semester": "both",
    "exam_only": false,
    "prerequisites": []
  }
]
EOF
fi

echo "🚀 Iniciando servidor..."
echo "📍 URL: http://localhost:8080/index.html"
echo "💡 Presiona Ctrl+C para detener"
echo ""

# Try to open in browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    sleep 2 && open "http://localhost:8080/index.html" &
fi

# Start the server
python3 server.py
