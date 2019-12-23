import { Layout, Options } from '.';

export type PageMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export function createPages({
  cards,
  layout: { cardsOnPage, columnsOnPage }
}: Options): string[][] {
  return cards.reduce<string[][]>((acc, card, index) => {
    const pageIndex = index % cardsOnPage;
    const column = pageIndex % columnsOnPage;
    const row = Math.floor(pageIndex / columnsOnPage);
    const firstCardOnPage = column === 0 && row === 0;
    const frontPage = firstCardOnPage ? [] : acc[acc.length - 2];
    const backPage = firstCardOnPage ? [] : acc[acc.length - 1];

    frontPage[row * columnsOnPage + column] = card.front;
    backPage[row * columnsOnPage + (columnsOnPage - column - 1)] = card.back;

    return firstCardOnPage ? [...acc, frontPage, backPage] : acc;
  }, []);
}

export function getPageMargins(
  index: number,
  {
    pageWidth,
    pageHeight,
    cardsOnPage,
    columnsOnPage,
    cardHeight,
    cardWidth,
    rowGap,
    columnGap,
    verticalOffset,
    horizontalOffset
  }: Layout
): PageMargins {
  const rowsOnPage = cardsOnPage / columnsOnPage;
  const contentHeight = rowsOnPage * cardHeight + (rowsOnPage - 1) * rowGap;
  const contentWidth =
    columnsOnPage * cardWidth + (columnsOnPage - 1) * columnGap;
  const horizontalOffsetDirection = index % 2 === 0 ? 1 : -1;

  return {
    top: (pageHeight - contentHeight) / 2 + verticalOffset,
    right:
      (pageWidth - contentWidth) / 2 +
      horizontalOffsetDirection * horizontalOffset,
    bottom: (pageHeight - contentHeight) / 2 - verticalOffset,
    left:
      (pageWidth - contentWidth) / 2 -
      horizontalOffsetDirection * horizontalOffset
  };
}

export function renderPage(
  {
    document,
    index,
    words
  }: {
    document: PDFKit.PDFDocument;
    index: number;
    words: string[];
  },
  { layout, layoutTest, cardRenderer }: Options
): void {
  const { columnsOnPage, cardWidth, cardHeight, columnGap, rowGap } = layout;

  const margins = getPageMargins(index, layout);
  const page = document.addPage();
  words.forEach((word, wordIndex) => {
    const column = wordIndex % columnsOnPage;
    const row = Math.floor(wordIndex / columnsOnPage);
    const x = margins.left + column * (cardWidth + columnGap);
    const y = margins.top + row * (cardHeight + rowGap);

    if (layoutTest) {
      page.rect(x, y, cardWidth, cardHeight).stroke('black');
    }

    cardRenderer({
      page,
      text: word,
      x,
      y,
      width: cardWidth,
      height: cardHeight
    });
  });
}
