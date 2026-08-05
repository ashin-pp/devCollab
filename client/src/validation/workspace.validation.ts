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

export function validateWorkspaceTeamSize(
  teamSize: string,
  options?: { maxAllowed?: number; minAllowed?: number }
): string | null {
  if (!teamSize.trim()) return null;
  const size = parseInt(teamSize, 10);
  const ceiling = options?.maxAllowed ?? 10000;
  const floor = options?.minAllowed ?? 1;

  if (Number.isNaN(size) || size < 1) {
    return 'Team size must be a positive number';
  }
  if (options?.minAllowed !== undefined && size < floor) {
    return `Max members cannot be lower than your current member count (${floor})`;
  }
  if (size > ceiling) {
    return options?.maxAllowed !== undefined
      ? `Team size cannot exceed your plan limit of ${ceiling}`
      : 'Team size must be a number between 1 and 10000';
  }
  return null;
}
