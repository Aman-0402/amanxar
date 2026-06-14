from django.core.exceptions import ValidationError

MAX_FILE_SIZE = 3 * 1024 * 1024  # 3 MB


def validate_image_size(file):
    if file.size > MAX_FILE_SIZE:
        size_mb = file.size / (1024 * 1024)
        raise ValidationError(
            f'Image size must not exceed 3 MB. Current size: {size_mb:.2f} MB',
            code='file_too_large',
        )
