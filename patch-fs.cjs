const fs = require('fs');

const patchError = (err) => {
  return err && (err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'ENOENT');
};

const originalReaddirSync = fs.readdirSync;
fs.readdirSync = function (path, options) {
  try {
    return originalReaddirSync.apply(this, arguments);
  } catch (err) {
    if (patchError(err)) {
      return [];
    }
    throw err;
  }
};

const originalReaddir = fs.readdir;
fs.readdir = function (path, options, callback) {
  const cb = typeof options === 'function' ? options : callback;
  const opts = typeof options === 'function' ? undefined : options;

  const newCallback = (err, files) => {
    if (patchError(err)) {
      return cb(null, []);
    }
    return cb(err, files);
  };

  if (typeof options === 'function') {
    return originalReaddir.call(this, path, newCallback);
  }
  return originalReaddir.call(this, path, opts, newCallback);
};

const originalStatSync = fs.statSync;
fs.statSync = function (path, options) {
  try {
    return originalStatSync.apply(this, arguments);
  } catch (err) {
    if (patchError(err)) {
      return {
        isDirectory: () => false,
        isFile: () => false,
        isSymbolicLink: () => false,
      };
    }
    throw err;
  }
};

const originalLstatSync = fs.lstatSync;
fs.lstatSync = function (path, options) {
  try {
    return originalLstatSync.apply(this, arguments);
  } catch (err) {
    if (patchError(err)) {
      return {
        isDirectory: () => false,
        isFile: () => false,
        isSymbolicLink: () => false,
      };
    }
    throw err;
  }
};
