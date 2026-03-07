/**
 * Polyfill untuk Cloudflare Edge: URLSearchParams.entries() harus mengembalikan iterator.
 * Memperbaiki error "urlObject.searchParams.entries() is not iterable" di Workers.
 */
export async function register() {
  if (typeof URLSearchParams === "undefined") return;
  
  try {
    const sp = new URLSearchParams("a=1");
    const it = sp.entries();
    
    // Gunakan 'any' untuk mem-bypass error strict typing TypeScript pada Symbol.iterator
    if (typeof (it as any)[Symbol.iterator] !== "function") {
      throw new Error("not iterable");
    }
    const first = (it as any).next();
    if (first.done === undefined) throw new Error("not iterator");
  } catch {
    const Orig = URLSearchParams;
    
    // PERBAIKAN: Gunakan (Orig.prototype as any) agar TS mengabaikan 
    // ekspektasi tipe URLSearchParamsIterator yang baru di Node 20+
    (Orig.prototype as any).entries = function entries(): IterableIterator<[string, string]> {
      const self = this as URLSearchParams;
      const pairs: [string, string][] = [];
      
      try {
        self.forEach((value, key) => {
          pairs.push([key, value]);
        });
      } catch {
        const str = self.toString();
        if (str) {
          str.split("&").forEach((pair) => {
            const eq = pair.indexOf("=");
            const k = eq >= 0 ? pair.slice(0, eq) : pair;
            const v = eq >= 0 ? pair.slice(eq + 1) : "";
            if (k) pairs.push([
              decodeURIComponent(k.replace(/\+/g, " ")), 
              decodeURIComponent(v.replace(/\+/g, " "))
            ]);
          });
        }
      }
      return pairs[Symbol.iterator]() as IterableIterator<[string, string]>;
    };
  }
}