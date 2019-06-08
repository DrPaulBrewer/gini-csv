# gini-csv

[![Greenkeeper badge](https://badges.greenkeeper.io/DrPaulBrewer/gini-csv.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/DrPaulBrewer/gini-csv.svg?branch=master)](https://travis-ci.org/DrPaulBrewer/gini-csv)

Compute the Gini coefficient for each row of the indicated numeric .csv file data, with small sample correction.

This is a standalone program based on npm:gini-ss, npm:commander, and various csv-data streaming libraries.


## Installation

[Install nodejs](https://nodejs.org/en/download/) if you don't have it.  It includes the `node` JavaScript runtime as well as the `npm` package manager.  

To install the gini-csv command for general use:

     npm i gini-csv -g

## Usage

```
Usage: gini-csv [options] [fromFilePath] [toFilePath]

Options:
  -m, --match <match>  use column names containing <match> as Gini calculation input columns (required)
  -V, --version        output the version number
  -s, --sum            sum all rows and calculate Gini coefficient once for entire file
  -n, --nocopy         do not copy Gini input columns to output file
  -v, --verbose        print more status messages
  -h, --help           output usage information
```


## Examples

### Example 1

    gini-csv -m y profit.csv profitWithGini.csv

Reads from the input file `profit.csv`, matching against columns containing "y" as Gini calculation input columns, and writes
the output file profitWithGini.csv.

### Example 2

    gini-csv -m SumProfit -n in.csv out.csv

Reads from the input file `in.csv`, matching against columns containing "SumProfit" as Gini calculation input columns, and writes the output file `out.csv`.  The `-n`, short for `--nocopy` causes the Gini input columns to be omitted from the output file.  

### Example 3

    gini-csv -m Participant --sum in.csv out.csv

Reads from the input file `in.csv`, matching against columns containing "Participant" as Gini calculation input columns, and writes the output file `out.csv`.  Each Gini input column will first be summed over all rows in the entire file.  The `out.csv` file will consist of a header row and a single data row resulting from aggregating the relevant matching data and calculating the Gini coefficient.  The columns will be the constant columns in the data, the "*Participant*" columns, and the Gini coefficient.

## Small Sample Correction

The Gini coefficient with small sample correction has a value of 1.0 for the case of *perfect inequality*, when
for example, with income data, all of the incomes are zero except for one person has all the income.   
The traditional Gini instead yields `G = 1-(1/n) = (n-1)/n`.  The correction is simply multiplying by `n/(n-1)`

These converge as the number of samples n become large.

## Background

For more information, see the Wikipedia article for [Gini coefficient](https://en.wikipedia.org/wiki/Gini_coefficient)

## Tests

The Gini calculation module used, npm:gini-ss, has its own testing.  Currently there are no additional tests associated
with the gini-csv program. Tests may be added at a later time
or if issues independent of gini-ss are reported.

## Copyright

Copyright 2019 Paul Brewer, Economic and Financial Technology Consulting LLC

## License

[The MIT License](LICENSE.md)
