import { MAX_FILE_SIZE_BYTES, MAX_WORKSPACE_ICON_SIZE_BYTES } from '../utils/constants';

export function validateImageFile(
  file: File,
  maxBytes: number,
  tooLargeMessage: string
): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please select an image file';
  }
  if (file.size > maxBytes) {
    return tooLargeMessage;
  }
  return null;
}

export function validateProfileImageFile(file: File): string | null {
  return validateImageFile(file, MAX_FILE_SIZE_BYTES, 'File size must be less than 5MB');
}

export function validateWorkspaceIconFile(file: File): string | null {
  return validateImageFile(file, MAX_WORKSPACE_ICON_SIZE_BYTES, 'Image must be less than 2MB');
}
