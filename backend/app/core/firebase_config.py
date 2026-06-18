import firebase_admin
from firebase_admin import credentials, firestore
import os

db = None

try:
    if not firebase_admin._apps:
        # Robust path finding for serviceAccountKey.json
        core_dir = os.path.dirname(os.path.abspath(__file__))  # Backend/app/core
        app_dir = os.path.dirname(core_dir)                    # Backend/app
        backend_dir = os.path.dirname(app_dir)                 # Backend
        service_account_path = os.path.join(backend_dir, "serviceAccountKey.json")
        
        if os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            print("[Firebase] Firebase initialized successfully.")
        else:
            print(f"[Firebase Error] Error: 'serviceAccountKey.json' not found at {service_account_path}")

    if firebase_admin._apps:
        db = firestore.client()
    else:
        print("[Firebase Warning] Firebase App not initialized. DB operations will fail.")

except Exception as e:
    print(f"[Firebase Error] Firebase Connection Error: {e}")
    db = None
