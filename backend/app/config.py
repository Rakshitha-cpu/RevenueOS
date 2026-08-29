import os
from typing import Optional
from dotenv import load_dotenv

# Load local .env for development
load_dotenv()

class ConfigManager:
    """
    Enterprise Configuration Manager.
    In a production environment, this integrates with Google Cloud Secret Manager or HashiCorp Vault.
    Gracefully falls back to local environment variables during development/testing.
    """
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConfigManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        self.env = os.getenv("ENVIRONMENT", "development")
        self.use_cloud_secrets = os.getenv("USE_CLOUD_SECRETS", "false").lower() == "true"
        self._secrets_cache = {}
        self._initialized = True

    def get_secret(self, secret_name: str, default: Optional[str] = None) -> str:
        """
        Retrieves a secret securely. 
        Checks Cloud Secret Manager in production, otherwise uses local env.
        """
        # 1. Check local cache
        if secret_name in self._secrets_cache:
            return self._secrets_cache[secret_name]
            
        # 2. Production: Fetch from Cloud Provider (Mocked for Hackathon)
        if self.use_cloud_secrets and self.env == "production":
            try:
                # e.g., client = secretmanager.SecretManagerServiceClient()
                # response = client.access_secret_version(...)
                # secret_value = response.payload.data.decode("UTF-8")
                
                # Mocking cloud retrieval for demo purposes
                secret_value = os.getenv(secret_name, default)
                self._secrets_cache[secret_name] = secret_value
                return secret_value
            except Exception as e:
                print(f"Failed to fetch {secret_name} from Cloud Vault: {e}")
                
        # 3. Development: Fallback to local environment variables
        secret_value = os.getenv(secret_name, default)
        self._secrets_cache[secret_name] = secret_value
        return secret_value

# Singleton instance for the app to use
config = ConfigManager()
