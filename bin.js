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


(program
  .version('0.1.0')
  .arguments('[fromFilePath] [toFilePath]')
  .option('-n, --nocopy','do not copy Gini input columns to output file')
  .option('-m, --match <match>', 'use column names containing <match> as Gini calculation input columns')
  .option('-v, --verbose','print more status messages')
  .action(function (fromFilePath, toFilePath, options) {
    const match = options && options.match;
    const startDate = Date.now();
    if (options && options.verbose){
      console.log(new Date(startDate).toUTCString()+" -- "+"gini-csv");
      console.log("input  file: ", fromFilePath || 'stdin');
      console.log("output file: ",toFilePath || 'stdout');
      console.log("match      : "+match);
      if (options.nocopy) console.log("nocopy     : true, omitting Gini-calculation inputs from output file");
    }
    if ((typeof(fromFilePath)==="string") && (fromFilePath.length) && (fromFilePath===toFilePath)) {
      console.error("Conflict:  fromFilePath and toFilePath must be different");
      process.exit(1);
    }
    if ((typeof(match)!=='string') || (match.length===0)){
      console.error("Missing: --match <match> substring to identify column names that are Gini calculation inputs");
      process.exit(1);
    }
    let row = 0;
    let originalHeader = [];
    let isInputField = [];
    function spliceGiniColumn(data) {
      let gini = '';
      if (row === 0) {
        originalHeader = data.slice();
        isInputField = (
          originalHeader
          .map((v) => ((typeof(v) === "string") && (v.includes(match))))
        );
        if (options && options.verbose){
          const matching = isInputField.reduce((acc,cv)=>(+acc+cv),0);
          console.log(matching+" matching columns for Gini-coefficient calculation");
        }
        gini = 'gini_ss'
      } else {
        const nozero = options && options.nozero;
        const nonegative = options && options.nonegative;
        const inData = (
          data
          .filter((v, j) => (isInputField[j]))
          .map((v) => (+v || 0))
        );
        gini = giniSS(inData);
      }
      row++;
      if (options && options.verbose && (row%1000===0)) console.log("at row: "+row);
      const outData = (options.nocopy)? (data.filter((v,j)=>(!isInputField[j]))) : (data);
      outData.push(gini);
      return outData;
    }
    const parser = csvparse();
    // do not change parallel setting from 1, library default was 100 and causing rows to arrive out-of-order
    const transformer = transform(spliceGiniColumn, {parallel: 1});
    let iStream=null,oStream=null;
    if (fromFilePath)
      iStream = fs.createReadStream(fromFilePath, { encoding: 'utf8' });
    else
      iStream = process.stdin;
    if (toFilePath)
      oStream = fs.createWriteStream(toFilePath, { encoding: 'utf8' });
    else
      oStream = process.stdout;
    if (options && options.verbose)
      oStream.on('close', ()=>{
        console.log("done at row : "+row);
        console.log("elapsed time: "+(0.001*(Date.now()-startDate)).toFixed(3)+' sec');
      });
    (
      iStream
      .pipe(parser)
      .pipe(transformer)
      .pipe(stringifier)
      .pipe(oStream)
    );
  })
  .parse(process.argv)
);
