"""
AWS Client Manager for TARANG
Centralizes boto3 client initialization with error handling and credential validation.
"""
import os
import logging
from typing import Optional
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

logger = logging.getLogger(__name__)


class AWSClientManager:
    """
    Singleton manager for AWS service clients.
    Initializes clients lazily and validates credentials on first use.
    """
    
    _instance: Optional['AWSClientManager'] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        self.region = os.getenv("AWS_REGION", "us-east-1")
        self._bedrock_client = None
        self._polly_client = None
        self._s3_client = None
        self._transcribe_client = None
        self._healthlake_client = None
        self._credentials_valid = None
        
        self._initialized = True
        logger.info(f"AWSClientManager initialized (region={self.region})")
    
    def _validate_credentials(self) -> bool:
        """
        Validates AWS credentials by making a lightweight STS call.
        Returns True if credentials are valid, False otherwise.
        """
        if self._credentials_valid is not None:
            return self._credentials_valid
            
        try:
            sts = boto3.client('sts', region_name=self.region)
            sts.get_caller_identity()
            self._credentials_valid = True
            logger.info("AWS credentials validated successfully")
            return True
        except NoCredentialsError:
            logger.error("AWS credentials not found. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.")
            self._credentials_valid = False
            return False
        except ClientError as e:
            logger.error(f"AWS credential validation failed: {e}")
            self._credentials_valid = False
            return False
        except Exception as e:
            logger.error(f"Unexpected error validating AWS credentials: {e}")
            self._credentials_valid = False
            return False
    
    def get_bedrock_client(self):
        """
        Returns a boto3 client for Amazon Bedrock Runtime.
        Returns None if credentials are invalid.
        """
        if not self._validate_credentials():
            return None
            
        if self._bedrock_client is None:
            try:
                self._bedrock_client = boto3.client(
                    'bedrock-runtime',
                    region_name=self.region
                )
                logger.info("Bedrock client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Bedrock client: {e}")
                return None
                
        return self._bedrock_client
    
    def get_polly_client(self):
        """
        Returns a boto3 client for Amazon Polly.
        Returns None if credentials are invalid.
        """
        if not self._validate_credentials():
            return None
            
        if self._polly_client is None:
            try:
                self._polly_client = boto3.client(
                    'polly',
                    region_name=self.region
                )
                logger.info("Polly client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Polly client: {e}")
                return None
                
        return self._polly_client
    
    def get_s3_client(self):
        """
        Returns a boto3 client for Amazon S3.
        Returns None if credentials are invalid.
        """
        if not self._validate_credentials():
            return None
            
        if self._s3_client is None:
            try:
                self._s3_client = boto3.client(
                    's3',
                    region_name=self.region
                )
                logger.info("S3 client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize S3 client: {e}")
                return None
                
        return self._s3_client
    
    def get_transcribe_client(self):
        """
        Returns a boto3 client for Amazon Transcribe.
        Returns None if credentials are invalid.
        """
        if not self._validate_credentials():
            return None
            
        if self._transcribe_client is None:
            try:
                self._transcribe_client = boto3.client(
                    'transcribe',
                    region_name=self.region
                )
                logger.info("Transcribe client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Transcribe client: {e}")
                return None
                
        return self._transcribe_client
    
    def get_healthlake_client(self):
        """
        Returns a boto3 client for AWS HealthLake.
        Returns None if credentials are invalid.
        """
        if not self._validate_credentials():
            return None
            
        if self._healthlake_client is None:
            try:
                self._healthlake_client = boto3.client(
                    'healthlake',
                    region_name=self.region
                )
                logger.info("HealthLake client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize HealthLake client: {e}")
                return None
                
        return self._healthlake_client


# Singleton instance
aws_client_manager = AWSClientManager()
