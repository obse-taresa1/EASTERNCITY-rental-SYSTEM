const fs = require('fs');

function collectUploadedFiles(req) {
  const files = [];

  if (req.file) files.push(req.file);

  if (Array.isArray(req.files)) {
    files.push(...req.files);
  } else if (req.files && typeof req.files === 'object') {
    Object.values(req.files).forEach((value) => {
      if (Array.isArray(value)) files.push(...value);
      else if (value) files.push(value);
    });
  }

  return files.filter((file) => file?.path);
}

function cleanupUploadedFiles(req) {
  collectUploadedFiles(req).forEach((file) => {
    try {
      fs.unlinkSync(file.path);
    } catch {
      // Ignore cleanup failures; the original request error should still be returned.
    }
  });
}

module.exports = {
  cleanupUploadedFiles,
  collectUploadedFiles,
};