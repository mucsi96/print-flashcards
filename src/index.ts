import { createWriteStream } from 'fs';
import { isAbsolute, resolve } from 'path';
import PDFDocument from 'pdfkit';
import { createPages, renderPage } from './page';

export type Options = {
  layout: Layout;
  layoutTest: boolean;
  cards: Card[];
  cardRenderer: (options: CardRendererOptions) => void;
  outputFile: string;
};

export type Layout = {
  pageWidth: number;
  pageHeight: number;
  cardWidth: number;
  cardHeight: number;
  landscape: boolean;
  verticalOffset: number;
  horizontalOffset: number;
  rowGap: number;
  columnGap: number;
  cardsOnPage: number;
  columnsOnPage: number;
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
    layout: { pageWidth, pageHeight, landscape },
    outputFile
  } = options;

  const document = new PDFDocument({
    pdfVersion: '1.7ext3',
    autoFirstPage: false,
    size: [pageWidth, pageHeight],
    layout: landscape ? 'landscape' : 'portrait',
    margin: 0
  });

  const pages = createPages(options);

  pages.forEach((words, index) => {
    renderPage(
      {
        document,
        index,
        words
      },
      options
    );
  });

  const outputFilePath = isAbsolute(outputFile)
    ? outputFile
    : resolve(process.cwd(), outputFile);
  document.pipe(createWriteStream(outputFilePath, 'utf8'));
  document.end();
}
