declare module 'html-to-docx' {
  export default function HTMLToDocx(
    html: string,
    headerHTMLString?: string | null,
    options?: any,
    footerHTMLString?: string | null
  ): Promise<Blob>;
}
