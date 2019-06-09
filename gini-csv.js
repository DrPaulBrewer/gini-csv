#!/usr/bin/env node

/* Copyright 2019 Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* jshint node:true,esnext:true,eqeqeq:true,undef:true,lastsemic:true */

const fs = require('fs');
const program = require('commander');
const csvparse = require('csv-parse');
const transform = require('stream-transform');
const stringify = require('csv-stringify');
const stringifier = stringify();
const giniSS = require("gini-ss");

const p1 = { parallel: 1 };

function passthru(acc, f) {
  return function (data) {
    f(acc, data);
    return data;
  };
}

function consumer(acc, f) {
  return function (data) {
    f(acc, data);
    return null;
  };
}

function constantFinder(acc) {
  let row = 0;
  acc.isConstField = [];
  return passthru(acc, function (a, d) {
    if (row === 0) {
      a.originalHeader = d.slice();
      a.isConstField = new Array(d.length).fill(true);
    } else if (row === 1) {
      a.firstValue = d.map(Number);
    } else {
      for (let i = 0, l = d.length; i < l; ++i) {
        const v = Number(d[i]);
        if ((a.isConstField[i]) && (v !== a.firstValue[i])){
          a.isConstField[i] = false;
        }
      }
    }
    row++;
  });
}

function rowZeroMatch(a, match, d) {
  a.originalHeader = d.slice();
  a.isInputField = [];
  for (let i = 0, l = d.length; i < l; ++i) {
    a.isInputField[i] = d[i].includes(match);
  }
}

function hideAndSum(acc, match) {
  let row = 0;
  return consumer(acc, function (a, d) {
    if (row === 0) {
      rowZeroMatch(a, match, d);
      a.sum = new Array(d.length).fill(0);
    } else {
      for (let i = 0, l = d.length; i < l; ++i) {
        if (a.isInputField[i]) {
          a.sum[i] = +(a.sum[i]) + (+d[i]);
        }
      }
    }
    row++;
  });
}

function summer2step(opt) {
  const match = opt && opt.match;
  const acc = {};
  const internalConstantFinder = transform(constantFinder(acc), p1);
  const transformer = transform(hideAndSum(acc, match), p1);
  const originalFlusher = transformer._flush.bind(transformer);
  transformer._flush = function (cb) {
    originalFlusher(function () {
      const mergedHeader = acc.originalHeader.filter((v, j) => (
        acc.isInputField[j] || acc.isConstField[j]
      ));
      transformer.push(mergedHeader);
      const mergeData = [];
      for (let i = 0, l = acc.originalHeader.length; i < l; ++i) {
        const relevant = acc.isInputField[i] || acc.isConstField[i];
        if (relevant) mergeData.push(
          (acc.isInputField[i]) ? (acc.sum[i]) : (acc.firstValue[i])
        );
      }
      transformer.push(mergeData);
      cb();
    });
  };
  return [internalConstantFinder,transformer];
}

function giniRowSplicer(opt) {
  const acc = {};
  const match = opt && opt.match;
  const nocopy = opt && opt.nocopy;
  let row = 0;
  return function (data) {
    let gini = '';
    if (row === 0) {
      rowZeroMatch(acc, match, data);
      gini = 'GiniSS';
    } else {
      const inData = (
        data
        .filter((v, j) => (acc.isInputField[j]))
        .map((v) => (+v || 0))
      );
      gini = giniSS(inData);
      if (opt.round!==undefined)
        gini = gini.toFixed(+opt.round);
    }
    row++;
    if (opt && opt.verbose && (row % 1000 === 0)) console.log("at row: " + row);
    const outData = (opt.nocopy) ? (data.filter((v, j) => (!acc.isInputField[j]))) : (data);
    outData.push(gini);
    return outData;
  }
}

function startPipeline(fromFilePath, toFilePath, options) {
  const match = options && options.match;
  const startDate = Date.now();
  if (options && options.verbose) {
    console.log(new Date(startDate).toUTCString() + " -- " + "gini-csv v"+options.version());
    console.log("input  file: ", fromFilePath || 'stdin');
    console.log("output file: ", toFilePath || 'stdout');
    console.log("match      : " + match);
    if (options.sum) console.log("sum        : true, summing over all rows before Gini calculation");
    if (options.nocopy) console.log("nocopy     : true, omitting Gini-calculation inputs from output file");
    if (options.round!==undefined) console.log("round      : "+options.round+" digits");
  }
  if ((typeof(fromFilePath) === "string") && (fromFilePath.length) && (fromFilePath === toFilePath)) {
    console.error("Conflict:  fromFilePath and toFilePath must be different");
    process.exit(1);
  }
  if ((typeof(match) !== 'string') || (match.length === 0)) {
    console.error("Missing: --match <match> substring to identify column names that are Gini calculation inputs");
    process.exit(1);
  }
  const doSum = options && options.sum;
  const parser = csvparse();
  // do not change parallel setting from 1, library default was 100 and causing rows to arrive out-of-order
  const transformer = transform(giniRowSplicer(options), p1);
  let iStream = null,
    oStream = null;
  if (fromFilePath)
    iStream = fs.createReadStream(fromFilePath, { encoding: 'utf8' });
  else
    iStream = process.stdin;
  if (toFilePath)
    oStream = fs.createWriteStream(toFilePath, { encoding: 'utf8' });
  else
    oStream = process.stdout;
  if (options && options.verbose)
    oStream.on('finish', () => {
      console.log("done       : " + (0.001 * (Date.now() - startDate)).toFixed(3) + ' seconds');
    });
  if (doSum) {
    const [findConstStep,sumStep] = summer2step(options);
    iStream
      .pipe(parser)
      .pipe(findConstStep)
      .pipe(sumStep)
      .pipe(transformer)
      .pipe(stringifier)
      .pipe(oStream);
  } else {
    iStream
      .pipe(parser)
      .pipe(transformer)
      .pipe(stringifier)
      .pipe(oStream);
  }
}

(program
  .version('0.3.0')
  .arguments('[fromFilePath] [toFilePath]')
  .option('-m, --match <match>', 'use column names containing <match> as Gini calculation input columns')
  .option('-n, --nocopy', 'do not copy Gini input columns to output file')
  .option('-s, --sum', 'sum all rows and calculate Gini coefficient once for entire file')
  .option('-r, --round <digits>','round Gini coefficient to specified digits')
  .option('-v, --verbose', 'print more status messages')
  .action(startPipeline)
  .parse(process.argv)
);
