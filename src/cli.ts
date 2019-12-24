#!/usr/bin/env node
import program from 'commander';
import { readFileSync } from 'fs';
import { parse } from 'papaparse';
import { isAbsolute, resolve } from 'path';
import { createFlashcards, Layout, Options } from '.';
import { Card } from './card';

type CLIOptions = {
  cards: string;
  delimiter: string;
  layout: string;
  layoutTest: boolean;
  renderer: string;
  output: string;
};

const layoutScheme = {
  pageWidth: 'number',
  pageHeight: 'number',
  cardWidth: 'number',
  cardHeight: 'number',
  landscape: 'boolean',
  verticalOffset: 'number',
  horizontalOffset: 'number',
  rowGap: 'number',
  columnGap: 'number',
  cardsOnPage: 'number',
  columnsOnPage: 'number'
};

program
  .name('print-flashcards')
  .option('-l, --layout <file path>', 'layout file path', 'layout.json')
  .option('-t, --layout-test', 'create layout test output', false)
  .option('-c, --cards <file path>', 'cards csv file path', 'flashcards.csv')
  .option('-d, --delimiter <string>', 'cards csv file delimiter', '\t')
  .option('-r, --renderer <node module>', 'custom card renderer')
  .option('-o, --output <file path>', 'output pdf file path', 'flashcards.pdf');

function readCards(filePath: string, delimiter: string): Card[] {
  const absolutePath = isAbsolute(filePath)
    ? filePath
    : resolve(process.cwd(), filePath);
  const fileContent = readFileSync(absolutePath, 'utf8');
  const result = parse(fileContent.trim(), {
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

function readLayout(filePath: string): Layout {
  const absolutePath = isAbsolute(filePath)
    ? filePath
    : resolve(process.cwd(), filePath);
  const fileContent = readFileSync(absolutePath, 'utf8');
  const layout = JSON.parse(fileContent) as Layout;

  Object.keys(layout).forEach(key => {
    if (!Object.keys(layoutScheme).includes(key)) {
      throw new Error(`Not recognized property ${key} in layout file`);
    }
  });

  Object.keys(layoutScheme).forEach(key => {
    if (!Object.keys(layout).includes(key)) {
      throw new Error(`Missing property ${key} in layout file`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expectedType = typeof (layout as any)[key];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actualType = (layoutScheme as any)[key];

    if (actualType !== expectedType) {
      throw new Error(
        `Property ${key} should be ${expectedType} in layout file`
      );
    }
  });

  return layout;
}

function getOptions(cliOptions: CLIOptions): Options {
  const cardRenderer =
    cliOptions.renderer && require(resolve(process.cwd(), cliOptions.renderer));

  return {
    cards: readCards(cliOptions.cards, cliOptions.delimiter),
    layout: readLayout(cliOptions.layout),
    layoutTest: cliOptions.layoutTest,
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
