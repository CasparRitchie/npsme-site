export function localizePath(path, lang) {
  if (!path) return path;

  // don't touch external urls
  if (/^https?:\/\//i.test(path)) return path;

  // don't touch hashes
  if (path.includes("#")) return path;

  // already localized
  if (path.startsWith("/fr")) return path;

  // root
  if (path === "/") return lang === "fr" ? "/fr" : "/";

  return lang === "fr" ? `/fr${path}` : path;
}
