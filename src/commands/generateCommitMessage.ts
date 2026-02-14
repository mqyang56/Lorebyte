import * as vscode from "vscode";
import { GitService } from "../git/gitService";
import { providerRegistry } from "../providers/providerRegistry";
import { getConfig } from "../config/configuration";
import { buildSystemPrompt, buildUserPrompt } from "../prompt/commitPrompt";

export async function generateCommitMessage(): Promise<void> {
  const config = getConfig();

  const provider = providerRegistry.get(config.provider);
  if (!provider) {
    vscode.window.showErrorMessage(
      `Lorebyte: Unknown provider "${config.provider}". Available: ${providerRegistry
        .getAll()
        .map((p) => p.id)
        .join(", ")}`
    );
    return;
  }

  const validationError = provider.validateConfig(
    config.apiKey,
    config.apiBaseUrl
  );
  if (validationError) {
    const action = await vscode.window.showErrorMessage(
      `Lorebyte: ${validationError}`,
      "Open Settings"
    );
    if (action === "Open Settings") {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "lorebyte"
      );
    }
    return;
  }

  const gitService = new GitService();

  let diff: string;
  try {
    diff = await gitService.getStagedDiff();
  } catch (err) {
    vscode.window.showWarningMessage(
      `Lorebyte: ${err instanceof Error ? err.message : String(err)}`
    );
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.SourceControl,
      title: "Lorebyte: Generating commit message…",
    },
    async () => {
      try {
        const currentMessage = gitService.getCommitMessage().trim();
        const response = await provider.chatCompletion(
          {
            model: config.model,
            messages: [
              { role: "system", content: buildSystemPrompt(config.language) },
              {
                role: "user",
                content: buildUserPrompt(
                  diff,
                  currentMessage || undefined
                ),
              },
            ],
          },
          config.apiKey,
          config.apiBaseUrl
        );

        const message = response.content.trim();
        if (!message) {
          vscode.window.showWarningMessage(
            "Lorebyte: Received an empty commit message from the API"
          );
          return;
        }

        gitService.setCommitMessage(message);
      } catch (err) {
        vscode.window.showErrorMessage(
          `Lorebyte: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  );
}
