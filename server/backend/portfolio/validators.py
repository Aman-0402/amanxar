from django.core.exceptions import ValidationError

MAX_FILE_SIZE = 1024 * 1024  # 1 MB


def validate_image_size(file):
    """Validate that image file size does not exceed 1 MB"""
    if file.size > MAX_FILE_SIZE:
        size_mb = file.size / (1024 * 1024)
        raise ValidationError(
            f'Image size must not exceed 1 MB. Current size: {size_mb:.2f} MB',
            code='file_too_large',
        )
