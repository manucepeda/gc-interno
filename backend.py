#!/usr/bin/env python3
"""
Simple backend server for Curriculum Manager
Allows saving JSON data directly to the ucs-migrated.json file
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import urllib.parse
from datetime import datetime
import traceback

class CurriculumHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            with open('index.html', 'r', encoding='utf-8') as f:
                self.wfile.write(f.read().encode('utf-8'))
        
        elif self.path.endswith('.css'):
            self.send_response(200)
            self.send_header('Content-type', 'text/css')
            self.end_headers()
            try:
                with open(self.path[1:], 'r', encoding='utf-8') as f:
                    self.wfile.write(f.read().encode('utf-8'))
            except FileNotFoundError:
                self.send_error(404)
        
        elif self.path.endswith('.js'):
            self.send_response(200)
            self.send_header('Content-type', 'application/javascript')
            self.end_headers()
            try:
                with open(self.path[1:], 'r', encoding='utf-8') as f:
                    self.wfile.write(f.read().encode('utf-8'))
            except FileNotFoundError:
                self.send_error(404)
        
        elif self.path == '/api/subjects':
            # Get current subjects data
            try:
                with open('../data/ucs-migrated.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode('utf-8'))
            except Exception as e:
                self.send_error(500, str(e))
        
        else:
            self.send_error(404)
    
    def do_POST(self):
        if self.path == '/api/subjects/save':
            try:
                # Get the JSON data from the request
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                subjects_data = json.loads(post_data.decode('utf-8'))
                
                # Create backup of current file
                backup_name = f"../data/ucs-migrated-backup-{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                try:
                    with open('../data/ucs-migrated.json', 'r', encoding='utf-8') as f:
                        backup_data = f.read()
                    with open(backup_name, 'w', encoding='utf-8') as f:
                        f.write(backup_data)
                    print(f"Backup created: {backup_name}")
                except:
                    pass  # Continue even if backup fails
                
                # Save the new data
                with open('../data/ucs-migrated.json', 'w', encoding='utf-8') as f:
                    json.dump(subjects_data, f, ensure_ascii=False, indent=2)
                
                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = {
                    'success': True,
                    'message': 'Data saved successfully',
                    'timestamp': datetime.now().isoformat(),
                    'backup_file': backup_name
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                print(f"Data saved successfully at {datetime.now()}")
                
            except Exception as e:
                print(f"Error saving data: {e}")
                traceback.print_exc()
                self.send_error(500, str(e))
        
        else:
            self.send_error(404)
    
    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server(port=8083):
    server_address = ('', port)
    httpd = HTTPServer(server_address, CurriculumHandler)
    print(f"Curriculum Manager Backend running on http://localhost:{port}")
    print(f"Access the app at: http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")
        httpd.server_close()

if __name__ == '__main__':
    # Change to the curriculamgmt directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    run_server()
