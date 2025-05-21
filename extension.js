const vscode = require("vscode");
const { execSync } = require("child_process");
const os = require("os");
const path = require("path");
const { LanguageClient, TransportKind } = require("vscode-languageclient/node");
const fs = require("fs");

let client;

function activate() {
  let serverExe;
  const devPath = process.env.GLUAXDEV;

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
      serverExe = tempExe;
    } catch (err) {
      vscode.window.showErrorMessage("Failed to build gluax lsp server");
      return; // abort activation if build failed
    }
  } else {
    serverExe = path.join(__dirname, "gluax_lsp.exe");
    if (!fs.existsSync(serverExe)) {
      vscode.window.showErrorMessage("gluax_lsp.exe not found");
      return;
    }
  }

  // 3) Point the serverOptions at your temp-path executable
  const serverOptions = {
    run: { command: serverExe, transport: TransportKind.stdio },
    debug: { command: serverExe, transport: TransportKind.stdio },
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
