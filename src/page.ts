import { Options } from '.';
import { defaultCardRenderer } from './card';

export function createPages({ cards, cardsOnPage }: Options): string[][] {
  return cards.reduce<string[][]>((acc, card, index) => {
    const cardOnPageIndex = index % cardsOnPage;
    const frontPage = cardOnPageIndex === 0 ? [] : acc[acc.length - 2];
    const backPage = cardOnPageIndex === 0 ? [] : acc[acc.length - 1];
    frontPage[cardOnPageIndex] = card.front;
    backPage[cardOnPageIndex] = card.back;
    return cardOnPageIndex === 0 ? [...acc, frontPage, backPage] : acc;
  }, []);
}

export function renderPage({
  document,
  words,
  columnsOnPage,
  leftMargin,
  cardWidth,
  horizontalGap,
  topMargin,
  cardHeight,
  verticalGap,
  cardRenderer = defaultCardRenderer
}: Options & {
  document: PDFKit.PDFDocument;
  words: string[];
  cardWidth: number;
  cardHeight: number;
}): void {
  const page = document.addPage();
  words.forEach((word, index) => {
    const column = index % columnsOnPage;
    const row = Math.floor(index / columnsOnPage);
    const x = leftMargin + column * (cardWidth + horizontalGap);
    const y = topMargin + row * (cardHeight + verticalGap);
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
