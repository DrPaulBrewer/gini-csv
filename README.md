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
  -r, --round <digits> round Gini coefficient to specified digits
  -V, --version        output the version number
  -s, --sum            sum all rows and calculate Gini coefficient once for entire file
  -n, --nocopy         do not copy Gini input columns to output file
  -v, --verbose        print more status messages
  -h, --help           output usage information
```


## Examples

### Example 1

    gini-csv -m y -r 2 profit.csv profitWithGini.csv

Reads from the input file `profit.csv`, matching against columns containing "y" as Gini calculation input columns, rounds the calculated Gini Coefficient to 2 digits,  and writes the output file profitWithGini.csv.

### Example 2

    gini-csv -m SumProfit -n in.csv out.csv

Reads from the input file `in.csv`, matching against columns containing "SumProfit" as Gini calculation input columns, and writes the output file `out.csv`.  The `-n`, short for `--nocopy` causes the Gini input columns to be omitted from the output file.  

### Example 3

    gini-csv -m Participant --sum in.csv out.csv

Reads from the input file `in.csv`, matching against columns containing "Participant" as Gini calculation input columns, and writes the output file `out.csv`.  Each Gini input column will first be summed over all rows in the entire file.  The `out.csv` file will consist of a header row and a single data row resulting from aggregating the relevant matching data and calculating the Gini coefficient.  The columns will be the constant columns in the data, the "*Participant*" columns, and the Gini coefficient.

## Temporary Usage via Docker without node/npm Installation

If you have installed [Docker](https://docs.docker.com/install/), you don't have to install the node/npm or gini-csv software.

Docker is a system for managing and running lightweight virtual machines, called containers, in relatively controlled isolation from your machine and from each other.  

It is unclear whether installing and using Docker is really any easier than installing and using nodejs directly. But it does add a second way to get started.  

A container for gini-csv is posted on [DockerHub](https://hub.docker.com) at:

    drpaulbrewer/gini-csv

### Example Docker Usage

    docker run -it \
       -v /research/123:/data \
       drpaulbrewer/gini-csv \
       gini-csv -m Profit /data/in.csv /data/out.csv

This docker command will download the container image `drpaulbrewer/gini-csv` if you don't have it.  The `-v` option attaches the directory `/research/123` from your computer to the directory `/data` in the docker container.  It will
run the `gini-csv` command, matching the columns in the input file `in.csv` that have "Profit" in the name as the inputs for
the Gini-coefficient calculation.  It will write the results to the file "/data/out.csv" in the container, which should then
appear at `/research/123/out.csv` in the computer.  

Note: The backslash (`\`) characters are for line continuation and should be omitted if the entire command is typed onto one line.

## Bad or Missing Data in Gini inputs

Blank columns and non-numeric data are preserved in outputs unless `--nocopy` is set.

Blank columns and non-numeric data are treated as a zero entry for calculating the Gini coefficient, and will
therefore yield a higher Gini coefficient than if these columns were completely ignored.

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
