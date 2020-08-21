export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export function downloadFile(
  anchorRef: HTMLAnchorElement,
  url: string,
  name: string,
) {
  anchorRef.href = url;
  anchorRef.setAttribute('download', name);
  anchorRef.click();
}

export const download = (url: string, filename: string) => {
  const ahref = document.createElement('a');
  document.body.appendChild(ahref);
  downloadFile(ahref, url, filename);
  document.body.removeChild(ahref);
};
