from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    
    # Enable CORS - Allow all origins for development
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Load configuration
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev_key'),
    )
    
    # Register blueprints
    from .api import routes as api_routes
    app.register_blueprint(api_routes.bp)
    
    # Register new endpoints
    try:
        from .api import endpoints
        app.register_blueprint(endpoints.bp)
        print("Registered new endpoints successfully")
    except Exception as e:
        print(f"Error registering new endpoints: {e}")
    
    return app
