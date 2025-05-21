const vscode = require("vscode");
const { execSync } = require("child_process");
const os = require("os");
const path = require("path");
const { LanguageClient, TransportKind } = require("vscode-languageclient/node");

let client;

function activate() {
  let command = "gluax";
  const devPath = process.env.GLUAXDEV;
  const args = ["lsp"];

  if (devPath) {
    const tmpDir = os.tmpdir();
    const tempExe = path.join(tmpDir, `gluax-lsp-${process.pid}.exe`);
    try {
      execSync(`go build -o "${tempExe}" .`, {
        cwd: devPath,
        stdio: "inherit",
        windowsHide: true,
      });
      console.log(`Built LSP binary at ${tempExe}`);
      command = tempExe;
    } catch (err) {
      vscode.window.showErrorMessage("Failed to build gluax lsp server");
      return; // abort activation if build failed
    }
  }

  const serverOptions = {
    run: { command, args, transport: TransportKind.stdio },
    debug: { command, args, transport: TransportKind.stdio },
  };

  const clientOptions = {
    documentSelector: [{ scheme: "file", language: "gluax" }],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher("**/*.gluax"),
    },
  };

  client = new LanguageClient(
    "gluaxLanguageServer",
    "Gluax Language Server",
    serverOptions,
    clientOptions
  );
  client.start();
}

function deactivate() {
  if (!client) return undefined;
  return client.stop();
}

module.exports = { activate, deactivate };
