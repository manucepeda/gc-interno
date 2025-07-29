#!/usr/bin/env python3
"""
Servidor simple para la aplicación de gestión de curriculum
Ejecutar desde la carpeta curriculamgmt:
    python3 server.py
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# Configuración
PORT = 8080
DIRECTORY = Path(__file__).parent

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler HTTP con soporte para CORS"""
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def main():
    os.chdir(DIRECTORY)
    
    with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
        print(f"🚀 Servidor iniciado en: http://localhost:{PORT}")
        print(f"📂 Sirviendo archivos desde: {DIRECTORY}")
        print("💡 Presiona Ctrl+C para detener el servidor")
        print()
        print("🔗 Abrir en el navegador:")
        print(f"   http://localhost:{PORT}/index.html")
        print()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n✅ Servidor detenido")

if __name__ == "__main__":
    main()
