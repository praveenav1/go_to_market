"""
Azure Blob Storage Service
Handles integration with Azure Blob Storage for video content
"""

import os
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
        
        Args:
            file_path (str): Local file path
            blob_name (str): Name for the blob in storage
        
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.client or not os.path.exists(file_path):
            return False
        
        try:
            container_client = self.client.get_container_client(
                self.container_name
            )
            with open(file_path, 'rb') as data:
                container_client.upload_blob(blob_name, data, overwrite=True)
            print(f"✓ Uploaded {blob_name} to Blob Storage")
            return True
        except Exception as e:
            print(f"✗ Error uploading blob {blob_name}: {str(e)}")
            return False
    
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
