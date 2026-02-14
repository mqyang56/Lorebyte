const MAX_DIFF_LENGTH = 15_000;

export function truncateDiff(diff: string): string {
  if (diff.length <= MAX_DIFF_LENGTH) {
    return diff;
  }
  return (
    diff.slice(0, MAX_DIFF_LENGTH) +
    "\n\n[diff truncated — original was " +
    diff.length +
    " chars]"
  );
}

export function buildSystemPrompt(language: string): string {
  return `You are an expert at writing concise, meaningful git commit messages following the Conventional Commits specification.

Rules:
- Use the format: <type>(<optional scope>): <description>
- The description must use imperative mood (e.g. "add", not "added" or "adds")
- Keep the subject line under 72 characters
- Do NOT include a body or footer unless the change is complex
- If a body is needed, separate it from the subject with a blank line
- Write the commit message in ${language}

Available types:
| Type     | When to use                              |
|----------|------------------------------------------|
| feat     | A new feature                            |
| fix      | A bug fix                                |
| docs     | Documentation only changes               |
| style    | Formatting, missing semicolons, etc.     |
| refactor | Code change that neither fixes nor adds  |
| perf     | Performance improvement                  |
| test     | Adding or correcting tests               |
| build    | Build system or external dependencies    |
| ci       | CI configuration                         |
| chore    | Other changes that don't modify src/test |

Respond with ONLY the commit message, nothing else. No quotes, no markdown, no explanation.`;
}

export function buildUserPrompt(
  diff: string,
  currentMessage?: string
): string {
  const truncated = truncateDiff(diff);
  if (currentMessage) {
    return `The current commit message is:\n\n${currentMessage}\n\nOptimize and refine this commit message based on the staged changes below. Keep the original intent but improve clarity, accuracy, and adherence to Conventional Commits format.\n\n\`\`\`diff\n${truncated}\n\`\`\``;
  }
  return `Generate a commit message for the following staged changes:\n\n\`\`\`diff\n${truncated}\n\`\`\``;
}
