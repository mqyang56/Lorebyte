import * as vscode from "vscode";

interface GitExtensionAPI {
  getAPI(version: 1): GitAPI;
}

interface GitAPI {
  repositories: Repository[];
}

interface Repository {
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
    return api.repositories[0];
  }

  async getStagedDiff(): Promise<string> {
    const repo = this.getRepository();

    if (repo.state.indexChanges.length === 0) {
      throw new Error(
        "No staged changes found. Stage some changes before generating a commit message."
      );
    }

    const diff = await repo.diff(true);
    if (!diff) {
      throw new Error("Staged diff is empty");
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
