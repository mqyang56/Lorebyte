import * as vscode from "vscode";
import { providerRegistry } from "./providers/providerRegistry";
import { OpenCodeZenProvider } from "./providers/openCodeZenProvider";
import { generateCommitMessage } from "./commands/generateCommitMessage";
import { listModels } from "./commands/listModels";

export function activate(context: vscode.ExtensionContext): void {
  providerRegistry.register(new OpenCodeZenProvider());

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "lorebyte.generateCommitMessage",
      generateCommitMessage
    ),
    vscode.commands.registerCommand("lorebyte.listModels", listModels)
  );
}

export function deactivate(): void {}
