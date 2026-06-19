import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

db = None

try:
    if not firebase_admin._apps:
        # Check if service account JSON is provided via environment variable (recommended for production)
        firebase_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        
        if firebase_json:
            try:
                service_account_info = json.loads(firebase_json)
                cred = credentials.Certificate(service_account_info)
                firebase_admin.initialize_app(cred)
                print("[Firebase] Firebase initialized successfully from environment JSON.")
            except Exception as json_err:
                print(f"[Firebase Error] Failed to parse service account JSON from env: {json_err}")
        else:
            # Fall back to local serviceAccountKey.json file
            core_dir = os.path.dirname(os.path.abspath(__file__))  # Backend/app/core
            app_dir = os.path.dirname(core_dir)                    # Backend/app
            backend_dir = os.path.dirname(app_dir)                 # Backend
            service_account_path = os.path.join(backend_dir, "serviceAccountKey.json")
            
            if os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
                print("[Firebase] Firebase initialized successfully from local file.")
            else:
                print(f"[Firebase Error] Error: 'serviceAccountKey.json' file not found at {service_account_path} and FIREBASE_SERVICE_ACCOUNT_JSON env var is not set.")

    if firebase_admin._apps:
        db = firestore.client()
    else:
        print("[Firebase Warning] Firebase App not initialized. DB operations will fail.")

except Exception as e:
    print(f"[Firebase Error] Firebase Connection Error: {e}")
    db = None
