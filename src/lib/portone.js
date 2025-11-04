export async function ensurePortOne() {
  if (window.IMP) return window.IMP;

  await new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.0.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load PortOne script"));
    document.head.appendChild(s);
  });

  if (!window.IMP) throw new Error("PortOne init failed");
  return window.IMP;
}
