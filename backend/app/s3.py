
import uuid
from urllib.parse import urlparse
import boto3
from botocore.exceptions import ClientError
from app.config import settings

s3_client = boto3.client(
    "s3",
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
)

ALLOWED_CONTENT_TYPES= {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 5*1024*1024 #5 mb

def generate_presigned_upload(user_id:uuid.UUID, content_type:str)-> dict:
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError("Unsupported Content Types")
    
    ext = content_type.split("/")[-1]
    key = f"users/{user_id}/{uuid.uuid4()}.{ext}"

    try :
        presigned = s3_client.generate_presigned_post(
            Bucket = settings.S3_BUCKET_NAME,
            Key = key,
            Fields = {"Content-Type": content_type},
            Conditions = [
                {"Content-Type": content_type},
                ["content-length-range", 1, MAX_FILE_SIZE_BYTES],
            ],
            ExpiresIn=300, #5 minutes to complete the Upload
        )
    except ClientError as e :
        raise RuntimeError(f"Could not generate presigned URL: {e}")

    file_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"

    return {
        "upload_url": presigned["url"],
        "fields": presigned["fields"],
        "file_url": file_url
    }


def extract_s3_key(file_url: str) -> str | None:
    """Extracts the S3 object key from a full S3 URL."""
    try:
        parsed = urlparse(file_url)
        bucket_domain = f"{settings.S3_BUCKET_NAME}.s3"
        if bucket_domain in parsed.netloc:
            # S3 keys do not start with a leading slash
            return parsed.path.lstrip('/')
    except Exception as e:
        print(f"Failed to parse S3 URL {file_url}: {e}")
    return None


def delete_s3_object(key: str) -> None:
    """Deletes an object from the S3 bucket."""
    try:
        s3_client.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
        print(f"Successfully deleted S3 object: {key}")
    except ClientError as e:
        print(f"Failed to delete S3 object {key} from bucket {settings.S3_BUCKET_NAME}: {e}")


#