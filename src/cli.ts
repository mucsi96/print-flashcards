#!/usr/bin/env node
import program from 'commander';
import { readFileSync } from 'fs';
import { parse } from 'papaparse';
import { isAbsolute, resolve } from 'path';
import { Card, createFlashcards, Options } from '.';

type CLIOptions = {
  pageWidth: number;
  pageHeight: number;
  landscape: boolean;
  topMargin: number;
  bottomMargin: number;
  rightMargin: number;
  leftMargin: number;
  verticalGap: number;
  horizontalGap: number;
  cardsOnPage: number;
  columnsOnPage: number;
  cards: string;
  delimiter: string;
  renderer: string;
  output: string;
};

program
  .name('print-flashcards')
  .option(
    '-w, --page-width <number>',
    'page width in PostScript points',
    parseFloat,
    595.28
  )
  .option(
    '-h, --page-height <number>',
    'page height in PostScript points',
    parseFloat,
    841.89
  )
  .option('--landscape', 'sets orientation to landscape')
  .option(
    '-t, --top-margin <number>',
    'page top margin in PostScript points',
    parseFloat,
    72
  )
  .option(
    '-r, --right-margin <number>',
    'page right margin in PostScript points',
    parseFloat,
    72
  )
  .option(
    '-b, --bottom-margin <number>',
    'page bottom margin in PostScript points',
    parseFloat,
    72
  )
  .option(
    '-l, --left-margin <number>',
    'page left margin in PostScript points',
    parseFloat,
    72
  )
  .option(
    '-y, --vertical-gap <number>',
    'gap between card rows in PostScript points',
    parseFloat,
    0
  )
  .option(
    '-x, --horizontal-gap <number>',
    'gap between card columns in PostScript points',
    parseFloat,
    0
  )
  .option(
    '-n, --cards-on-page <number>',
    'number of cards on a page',
    parseInt,
    10
  )
  .option(
    '-m, --columns-on-page <number>',
    'number of columns on a page',
    parseInt,
    2
  )
  .option('-c, --cards <file path>', 'cards csv file path', 'flashcards.csv')
  .option('-d, --delimiter <string>', 'cards csv file delimiter', '\t')
  .option('--renderer <node module>', 'custom card renderer')
  .option('-o, --output <file path>', 'output pdf file path', 'flashcards.pdf');

function readCards(filePath: string, delimiter: string): Card[] {
  const cardsFile = isAbsolute(filePath)
    ? filePath
    : resolve(process.cwd(), filePath);
  const cardsFileContent = readFileSync(cardsFile, 'utf8');
  const result = parse(cardsFileContent.trim(), {
    delimiter
  });

  if (!result.data.length) {
    throw new Error('Empty cards file.');
  }

  if (result.data.some((line: string[]) => line.length !== 2)) {
    throw new Error(
      'Every row of CSV file should contain two columns. Check the delimiter.'
    );
  }

  return result.data.map((line: string[]) => ({
    front: line[0],
    back: line[1]
  }));
}

function getOptions(cliOptions: CLIOptions): Options {
  const cardRenderer =
    cliOptions.renderer && require(resolve(process.cwd(), cliOptions.renderer));

  return {
    cards: readCards(cliOptions.cards, cliOptions.delimiter),
    pageWidth: cliOptions.pageWidth,
    pageHeight: cliOptions.pageHeight,
    orientation: cliOptions.landscape ? 'landscape' : 'portrait',
    topMargin: cliOptions.topMargin,
    rightMargin: cliOptions.rightMargin,
    bottomMargin: cliOptions.bottomMargin,
    leftMargin: cliOptions.leftMargin,
    verticalGap: cliOptions.verticalGap,
    horizontalGap: cliOptions.horizontalGap,
    cardsOnPage: cliOptions.cardsOnPage,
    columnsOnPage: cliOptions.columnsOnPage,
    outputFile: cliOptions.output,
    cardRenderer
  };
}

try {
  createFlashcards(
    getOptions(program.parse(process.argv).opts() as CLIOptions)
  );
} catch (e) {
  /* istanbul ignore next */
  console.log(e.message);
  /* istanbul ignore next */
  process.exit(1);
}
