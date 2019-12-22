import { CardRendererOptions, Options } from '.';

export function defaultCardRenderer({
  page,
  text,
  x,
  y,
  width,
  height
}: CardRendererOptions): void {
  page.fontSize(18);
  // page.font('Inter-Medium.otf');
  page.rect(x, y, width, height).stroke();
  const textHeight = page.heightOfString(text, {
    width
  });
  page.text(text, x, y + (height - textHeight) / 2, {
    width,
    align: 'center'
  });
}

export function calculateCardWidth({
  pageWidth,
  rightMargin,
  leftMargin,
  horizontalGap,
  columnsOnPage
}: Options): number {
  return (
    (pageWidth -
      rightMargin -
      leftMargin -
      horizontalGap * (columnsOnPage - 1)) /
    columnsOnPage
  );
}

export function calculateCardHeight({
  pageHeight,
  topMargin,
  bottomMargin,
  verticalGap,
  cardsOnPage,
  columnsOnPage
}: Options): number {
  const rowsOnPage = cardsOnPage / columnsOnPage;
  return (
    (pageHeight - topMargin - bottomMargin - verticalGap * (rowsOnPage - 1)) /
    rowsOnPage
  );
}
