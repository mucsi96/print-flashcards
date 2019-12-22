import { createWriteStream } from 'fs';
import { isAbsolute, resolve } from 'path';
import PDFDocument from 'pdfkit';
import { calculateCardHeight, calculateCardWidth } from './card';
import { createPages, renderPage } from './page';

export type Options = {
  cards: Card[];
  pageWidth: number;
  pageHeight: number;
  orientation: 'portrait' | 'landscape';
  topMargin: number;
  bottomMargin: number;
  rightMargin: number;
  leftMargin: number;
  verticalGap: number;
  horizontalGap: number;
  cardsOnPage: number;
  columnsOnPage: number;
  cardRenderer: (options: CardRendererOptions) => void;
  outputFile: string;
};

export type Card = {
  front: string;
  back: string;
};

export type CardRendererOptions = {
  page: PDFKit.PDFDocument;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export function createFlashcards(options: Options): void {
  const {
    pageWidth,
    pageHeight,
    orientation,
    topMargin,
    rightMargin,
    bottomMargin,
    leftMargin,
    outputFile
  } = options;

  const document = new PDFDocument({
    pdfVersion: '1.7ext3',
    autoFirstPage: false,
    size: [pageWidth, pageHeight],
    layout: orientation,
    margins: {
      top: topMargin,
      right: rightMargin,
      bottom: bottomMargin,
      left: leftMargin
    }
  });

  const pages = createPages(options);
  const cardWidth = calculateCardWidth(options);
  const cardHeight = calculateCardHeight(options);

  pages.forEach(words => {
    renderPage({
      document,
      words,
      cardWidth,
      cardHeight,
      ...options
    });
  });

  const outputFilePath = isAbsolute(outputFile)
    ? outputFile
    : resolve(process.cwd(), outputFile);
  document.pipe(createWriteStream(outputFilePath, 'utf8'));
  document.end();
}
