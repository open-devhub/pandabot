module.exports = (uri) => {
  if (!uri) return '[none]';
  try {
    const re = /(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)/;
    const m = uri.match(re);
    if (m) return `${m[1]}${m[2]}:****@${m[4]}`;
    return uri;
  } catch {
    return '[redacted]';
  }
};
