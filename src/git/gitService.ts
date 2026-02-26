import * as vscode from "vscode";

interface GitExtensionAPI {
  getAPI(version: 1): GitAPI;
}

interface GitAPI {
  repositories: Repository[];
}

interface Repository {
  rootUri: vscode.Uri;
  inputBox: { value: string };
  diff(cached: boolean): Promise<string>;
  state: {
    indexChanges: unknown[];
  };
}

export class GitService {
  private getAPI(): GitAPI {
    const gitExtension =
      vscode.extensions.getExtension<GitExtensionAPI>("vscode.git");
    if (!gitExtension) {
      throw new Error("Git extension not found");
    }
    if (!gitExtension.isActive) {
      throw new Error("Git extension is not active");
    }
    return gitExtension.exports.getAPI(1);
  }

  private getRepository(): Repository {
    const api = this.getAPI();
    if (api.repositories.length === 0) {
      throw new Error("No git repository found in workspace");
    }

    // When submodules are present, api.repositories contains both the root repo
    // and each submodule as separate entries. Find the one whose rootUri matches
    // the current workspace folder to avoid operating on a submodule repo.
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      const workspaceRoot = workspaceFolders[0].uri.fsPath;
      const matched = api.repositories.find(
        (r) => r.rootUri.fsPath === workspaceRoot
      );
      if (matched) {
        return matched;
      }
    }

    return api.repositories[0];
  }

  async getStagedDiff(): Promise<string> {
    const repo = this.getRepository();

    const diff = await repo.diff(true);
    if (!diff) {
      throw new Error(
        "No staged changes found. Stage some changes before generating a commit message."
      );
    }
    return diff;
  }

  getCommitMessage(): string {
    const repo = this.getRepository();
    return repo.inputBox.value;
  }

  setCommitMessage(message: string): void {
    const repo = this.getRepository();
    repo.inputBox.value = message;
  }
}
