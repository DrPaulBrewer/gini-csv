# gini-csv

[![Greenkeeper badge](https://badges.greenkeeper.io/DrPaulBrewer/gini-csv.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/DrPaulBrewer/gini-csv.svg?branch=master)](https://travis-ci.org/DrPaulBrewer/gini-csv)

Compute the Gini coefficient for each row of the indicated numeric .csv file data, with small sample correction.

This is a standalone program based on npm:gini-ss, npm:commander, and various csv-data streaming libraries.


## Installation

For global installation:

     npm i gini-csv -g

## Usage

```
Usage: gini-csv [options] [fromFilePath] [toFilePath]

Options:
  -m, --match <match>  use column names containing <match> as Gini calculation input columns (required)
  -V, --version        output the version number
  -n, --nocopy         do not copy Gini input columns to output file
  -v, --verbose        print more status messages
  -h, --help           output usage information
```

## Small Sample Correction

The Gini coefficient with small sample correction has a value of 1.0 for the case of *perfect inequality*, when
for example, with income data, all of the incomes are zero except for one person has all the income.   
The traditional Gini instead yields `G = 1-(1/n) = (n-1)/n`.  The correction is simply multiplying by `n/(n-1)`

These converge as the number of samples n become large.

## Background

For more information, see the Wikipedia article for [Gini coefficient](https://en.wikipedia.org/wiki/Gini_coefficient)

## Copyright

Copyright 2019 Paul Brewer, Economic and Financial Technology Consulting LLC

## License

[The MIT License](LICENSE.md)
