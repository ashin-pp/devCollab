export const WORKSPACE_NAME_MIN = 2;
export const WORKSPACE_NAME_MAX = 50;

export function validateWorkspaceName(
  name: string,
  existingNames: string[] = []
): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Workspace name is required';
  if (trimmed.length < WORKSPACE_NAME_MIN || trimmed.length > WORKSPACE_NAME_MAX) {
    return `Workspace name must be ${WORKSPACE_NAME_MIN}–${WORKSPACE_NAME_MAX} characters`;
  }
  const taken = existingNames.some(
    (n) => n.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (taken) return 'A workspace with this name already exists';
  return null;
}

export function validateWorkspaceTeamSize(teamSize: string): string | null {
  if (!teamSize.trim()) return null;
  const size = parseInt(teamSize, 10);
  if (Number.isNaN(size) || size < 1 || size > 10000) {
    return 'Team size must be a number between 1 and 10000';
  }
  return null;
}
