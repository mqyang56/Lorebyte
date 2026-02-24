import * as vscode from "vscode";
import { providerRegistry } from "../providers/providerRegistry";
import { getConfig } from "../config/configuration";

export async function listModels(): Promise<void> {
  const config = getConfig();
  const provider = providerRegistry.get(config.provider);

  if (!provider) {
    vscode.window.showErrorMessage(
      `Lorebyte: Unknown provider "${config.provider}".`
    );
    return;
  }

  if (config.isUsingDefaultKey) {
    const action = await vscode.window.showInformationMessage(
      "Lorebyte: You're using the built-in free key, which is locked to the default model. Set your own API key in Settings to browse and switch models.",
      "Open Settings"
    );
    if (action === "Open Settings") {
      vscode.commands.executeCommand("workbench.action.openSettings", "lorebyte.apiKey");
    }
    return;
  }

  try {
    const models = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Lorebyte: Fetching available models…",
      },
      () => provider.fetchRemoteModels(config.apiKey, config.apiBaseUrl)
    );

    if (models.length === 0) {
      vscode.window.showWarningMessage(
        "Lorebyte: No models returned from API."
      );
      return;
    }

    const picked = await vscode.window.showQuickPick(models, {
      placeHolder: `${models.length} models available — pick one to set as default`,
    });

    if (picked) {
      await vscode.workspace
        .getConfiguration("lorebyte")
        .update("model", picked, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(
        `Lorebyte: Model set to "${picked}"`
      );
    }
  } catch (err) {
    vscode.window.showErrorMessage(
      `Lorebyte: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
