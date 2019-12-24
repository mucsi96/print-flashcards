export type Card = {
  front: string;
  back: string;
};

export type CardRendererOptions = {
  page: PDFKit.PDFDocument;
  text: string;
  front: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
};

export function defaultCardRenderer({
  page,
  text,
  x,
  y,
  width,
  height
}: CardRendererOptions): void {
  page.fontSize(18).fillColor('black');
  const textHeight = page.heightOfString(text, {
    width
  });
  page.text(text, x, y + (height - textHeight) / 2, {
    width,
    align: 'center'
  });
}
