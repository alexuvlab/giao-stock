/**
 * A tiny guard between an agent preview and a state-changing tool call.
 * Run: node examples/preview-check.mjs
 */

function assertMatchesPreview(preview, call) {
  if (preview.id !== call.previewId) {
    throw new Error("Rejected: call is not attached to this preview.");
  }

  if (preview.action !== call.action) {
    throw new Error(`Rejected: preview allows ${preview.action}, not ${call.action}.`);
  }

  if (!preview.allowedPaths.includes(call.path)) {
    throw new Error(`Rejected: ${call.path} was not in the preview.`);
  }

  return { ok: true, previewId: preview.id, action: call.action, path: call.path };
}

const preview = {
  id: "preview-readme-42",
  action: "write_file",
  allowedPaths: ["README.md"],
};

const allowedCall = {
  previewId: "preview-readme-42",
  action: "write_file",
  path: "README.md",
};

const changedCall = {
  previewId: "preview-readme-42",
  action: "write_file",
  path: ".github/workflows/release.yml",
};

console.log("Allowed:", assertMatchesPreview(preview, allowedCall));

try {
  assertMatchesPreview(preview, changedCall);
} catch (error) {
  console.log("Blocked:", error.message);
}
