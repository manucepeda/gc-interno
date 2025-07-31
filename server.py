#!/usr/bin/env python3
"""
Servidor para la aplicación de gestión de curriculum
Ejecutar desde la carpeta curriculamgmt:
    python3 server.py
"""

import http.server
import socketserver
import os
import sys
import json
import urllib.parse
from pathlib import Path

# Configuración
PORT = 8080
DIRECTORY = Path(__file__).parent
DATA_FILE = DIRECTORY / "data" / "ucs-migrated.json"

class CurriculumHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler HTTP con soporte para CORS y API endpoints"""
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        if self.path == '/api/subjects':
            self.handle_get_subjects()
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path == '/api/subjects/save':
            self.handle_save_subjects()
        else:
            super().do_POST()
    
    def handle_get_subjects(self):
        try:
            if DATA_FILE.exists():
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    subjects_data = json.load(f)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(subjects_data).encode('utf-8'))
                print(f"📤 Served {len(subjects_data)} subjects from {DATA_FILE}")
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {"error": "No data file found"}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode('utf-8'))
            print(f"❌ Error serving subjects: {e}")
    
    
    def handle_save_subjects(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            subjects_data = json.loads(post_data.decode('utf-8'))
            
            # Ensure data directory exists
            DATA_FILE.parent.mkdir(exist_ok=True)
            
            # Save to file
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(subjects_data, f, indent=2, ensure_ascii=False)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {"success": True, "message": f"Saved {len(subjects_data)} subjects successfully"}
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
            print(f"✅ Saved {len(subjects_data)} subjects to {DATA_FILE}")
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {"success": False, "error": str(e)}
            self.wfile.write(json.dumps(response).encode('utf-8'))
            print(f"❌ Error saving subjects: {e}")

def main():
    os.chdir(DIRECTORY)
    
    with socketserver.TCPServer(("", PORT), CurriculumHTTPRequestHandler) as httpd:
        print(f"🚀 Servidor iniciado en: http://localhost:{PORT}")
        print(f"📂 Sirviendo archivos desde: {DIRECTORY}")
        print(f"💾 Datos se guardan en: {DATA_FILE}")
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
