import json
import argparse
from pathlib import Path
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler

# ADICIONE ESTA VARIÁVEL GLOBAL
sensor_readings = []  # Armazena últimas leituras
MAX_READINGS = 100

class SensorDataHandler(BaseHTTPRequestHandler):
    """Handler for sensor data requests"""

    def __init__(self, output_dir, *args, **kwargs):
        self.output_dir = output_dir
        super().__init__(*args, **kwargs)

    def do_GET(self):
        """Return server ready status OR sensor data"""
        # MODIFIQUE ESTE MÉTODO
        if self.path == '/data':
            # Retorna dados dos sensores em JSON
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')  # Permite React acessar
            self.end_headers()
            self.wfile.write(json.dumps(sensor_readings).encode())
        else:
            # Status do servidor
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"1")

    def do_POST(self):
        """Handle incoming sensor data"""
        global sensor_readings  # ADICIONE ESTA LINHA
        
        try:
            content_length = int(self.headers["Content-Length"])
            post_data = self.rfile.read(content_length).decode("utf-8")
            sensor_data = json.loads(post_data)

            # ADICIONE ESTE BLOCO - Armazena dados na memória
            for sample in sensor_data["data"]:
                sensor_readings.append({
                    'timestamp': int(datetime.now().timestamp() * 1000),
                    'x': sample[0],
                    'y': sample[1],
                    'z': sample[2]
                })
            
            # Mantém apenas as últimas 100 leituras
            if len(sensor_readings) > MAX_READINGS:
                sensor_readings = sensor_readings[-MAX_READINGS:]

            # Salva em CSV (mantém funcionalidade original)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filepath = Path(self.output_dir) / f"sensor_data_{timestamp}.csv"
            self._save_data_to_csv(sensor_data, filepath)

            print(f"Data saved to {filepath}")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"Data received")

        except Exception as e:
            print(f"Error processing data: {str(e)}")
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b"Server error")

    def _save_data_to_csv(self, data, filepath):
        """Save sensor data to CSV file"""
        with open(filepath, "w") as f:
            for sample in data["data"]:
                f.write(f"{sample[0]},{sample[1]},{sample[2]}\n")

# Resto do código permanece igual...
def create_server(output_dir, port):
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    def handler(*args, **kwargs):
        return SensorDataHandler(output_dir, *args, **kwargs)
    return HTTPServer(("", port), handler)

def main():
    parser = argparse.ArgumentParser(description="Sensor Data Collection Server")
    parser.add_argument("-d", "--dir", type=str, default="sensor_data")
    parser.add_argument("-p", "--port", type=int, default=4242)
    args = parser.parse_args()
    
    server = create_server(args.dir, args.port)
    print("\nSensor Data Collection Server")
    print(f"Saving data to: {args.dir}")
    print(f"Server running on port {args.port}")
    print("Press Ctrl+C to stop\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down...")
        server.server_close()

if __name__ == "__main__":
    main()
