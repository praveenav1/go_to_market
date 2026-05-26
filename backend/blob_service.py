"""
Azure Blob Storage Service
Handles integration with Azure Blob Storage for video content
"""

import os
import requests

import json
from io import BytesIO

from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv


load_dotenv()


class BlobStorageService:
    
    """Service for managing Azure Blob Storage operations"""
    
    def __init__(self):
        """Initialize Blob Storage Service with credentials from environment"""
        self.connection_string = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
        self.container_name = os.getenv('AZURE_STORAGE_CONTAINER_NAME', 'gtm-videos')
        self.container_url = os.getenv('AZURE_BLOB_CONTAINER_URL', '').rstrip('/')
        self.sas_token = os.getenv('AZURE_BLOB_SAS_TOKEN', '').lstrip('?')
        self.client = None
        
        if self.connection_string:
            try:
                self.client = BlobServiceClient.from_connection_string(
                    self.connection_string
                )
                print("✓ Blob Storage Service initialized successfully")
            except Exception as e:
                print(f"✗ Failed to initialize Blob Storage: {str(e)}")

    def build_blob_url(self, blob_name):
        """
        Build a video URL using container URL + optional SAS token.

        Args:
            blob_name (str): Blob file name inside the container

        Returns:
            str: Blob URL with SAS token (if configured)
        """
        if not blob_name:
            return ''

        # If the caller already provides an absolute URL, preserve it.
        if blob_name.startswith('http://') or blob_name.startswith('https://'):
            return blob_name

        if not self.container_url:
            return blob_name

        base_url = f"{self.container_url}/{blob_name.lstrip('/')}"
        if self.sas_token:
            return f"{base_url}?{self.sas_token}"
        return base_url

    def _build_blob_sas_url(self, blob_name):
        if not self.container_url:
            return None

        blob_name = blob_name.lstrip('/')
        base_url = f"{self.container_url}/{blob_name}"
        return f"{base_url}?{self.sas_token}" if self.sas_token else base_url

    def get_blob_sas_url(self, blob_name, expiry_hours=24):
        """
        Generate a SAS URL for a blob
        
        Args:
            blob_name (str): Name of the blob file
            expiry_hours (int): SAS URL expiry time in hours
        
        Returns:
            str: SAS URL for the blob or None if failed
        """
        if not self.client:
            print("Blob Storage client not initialized")
            return None
        
        try:
            container_client = self.client.get_container_client(
                self.container_name
            )
            blob_client = container_client.get_blob_client(blob_name)
            
            sas_url = blob_client.url
            return sas_url
        except Exception as e:
            print(f"Error generating SAS URL for {blob_name}: {str(e)}")
            return None
    
    def list_blobs(self):
        """
        List all blobs in the container
        
        Returns:
            list: List of blob names
        """
        if not self.client:
            return []
        
        try:
            container_client = self.client.get_container_client(
                self.container_name
            )
            blobs = container_client.list_blobs()
            return [blob.name for blob in blobs]
        except Exception as e:
            print(f"Error listing blobs: {str(e)}")
            return []
    
    def upload_blob(self, file_path, blob_name):
        """
        Upload a file to Blob Storage
        Tries direct HTTP upload first (uses SAS token), then falls back to SDK
        
        Args:
            file_path (str): Local file path
            blob_name (str): Name for the blob in storage
        
        Returns:
            str: Blob name if successful, None otherwise
        """
        if not os.path.exists(file_path):
            print(f"✗ File not found: {file_path}")
            return None
        
        # Try direct HTTP upload first (if container URL and SAS token available)
        if self.container_url and self.sas_token:
            print("DEBUG: Attempting direct HTTP upload to Azure")
            upload_url = f"{self.container_url}/{blob_name}?{self.sas_token}"
            
            try:
                with open(file_path, 'rb') as f:
                    file_data = f.read()
                
                headers = {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': 'application/octet-stream'
                }
                
                print(f"DEBUG: Uploading to {upload_url[:80]}...")
                response = requests.put(upload_url, data=file_data, headers=headers)
                
                if response.status_code in [200, 201]:
                    print(f"✓ Uploaded {blob_name} to Blob Storage via direct HTTP")
                    return blob_name
                else:
                    print(f"DEBUG: Direct HTTP upload failed with status {response.status_code}: {response.text[:200]}")
            except Exception as e:
                print(f"DEBUG: Direct HTTP upload failed: {str(e)}")
        
        # Fallback to SDK if available
        if self.client:
            print("DEBUG: Falling back to SDK upload")
            try:
                container_client = self.client.get_container_client(
                    self.container_name
                )
                with open(file_path, 'rb') as data:
                    container_client.upload_blob(blob_name, data, overwrite=True)
                print(f"✓ Uploaded {blob_name} to Blob Storage via SDK")
                return blob_name
            except Exception as e:
                print(f"✗ SDK upload also failed: {str(e)}")
        
        print(f"✗ Could not upload {blob_name} - no valid upload method available")
        return None
    
    def delete_blob(self, blob_name):
        """
        Delete a blob from storage
        
        Args:
            blob_name (str): Name of the blob to delete
        
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.client:
            return False
        
        try:
            container_client = self.client.get_container_client(
                self.container_name
            )
            container_client.delete_blob(blob_name)
            print(f"✓ Deleted {blob_name} from Blob Storage")
            return True
        except Exception as e:
            print(f"✗ Error deleting blob {blob_name}: {str(e)}")
            return False

    def upload_json_blob(self, blob_name, data):
        try:
            json_bytes = json.dumps(data, indent=2).encode('utf-8')

            if self.client:
                container_client = self.client.get_container_client(self.container_name)
                container_client.upload_blob(
                    name=blob_name,
                    data=BytesIO(json_bytes),
                    overwrite=True,
                    content_type='application/json'
                )
                return True

            if self.container_url and self.sas_token:
                upload_url = self._build_blob_sas_url(blob_name)
                headers = {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': 'application/json'
                }
                response = requests.put(upload_url, data=json_bytes, headers=headers)
                if response.status_code in [200, 201]:
                    return True
                print(f"Error uploading JSON blob via SAS: {response.status_code} {response.text[:200]}")
                return False

            return False
        except Exception as e:
            print(f"Error uploading JSON blob: {str(e)}")
            return False

    def download_json_blob(self, blob_name):
        try:
            if self.client:
                container_client = self.client.get_container_client(self.container_name)
                blob_client = container_client.get_blob_client(blob_name)

                if not blob_client.exists():
                    return []

                data = blob_client.download_blob().readall()
                return json.loads(data.decode('utf-8'))

            if self.container_url and self.sas_token:
                download_url = self._build_blob_sas_url(blob_name)
                response = requests.get(download_url)
                if response.status_code == 200:
                    return json.loads(response.content.decode('utf-8'))
                if response.status_code == 404:
                    return []
                print(f"Error downloading JSON blob via SAS: {response.status_code} {response.text[:200]}")
                return []

            return []
        except Exception as e:
            print(f"Error downloading JSON blob: {str(e)}")
            return []     