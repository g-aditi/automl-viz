# AutoML-Viz

AutoML-Viz is an interactive visualization tool designed to support users in refining the search space of Automated Machine Learning (AutoML) processes and analyzing the results. This tool aims to alleviate the pain of manually selecting machine learning algorithms and tuning hyperparameters by providing users with a visual interface to interact with the AutoML process.

## Features

### Multi-granularity Visualization

Allows users to monitor the AutoML process, analyze the searched models, and refine the search space in real-time. Users can analyze searched models across three levels of detail:

1. Algorithm
2. Hyperpartition
3. Hyperparameter

### Workflow Guidance

The tool provides a guided workflow for effectively utilizing AutoML.

### Search Space Refinement

Real-time interaction with the search space enables users to adjust AutoML parameters on-the-fly, thereby addressing issues of distrust in automatic results and increasing search budgets.

## Analyses Based On Munzner's Nested Model

### Domain Abstraction

The target users of this tool have a certain level of expertise in machine learning, but previously suffered from a time-consuming and error-prone manual search when developing machine learning models. Some examples of target user groups are:

1. Decision Makers
2. Data Scientists
3. ML Researchers
4. Industries with data-intensive operations

### Data Abstraction

The expected type of dataset is a comma-separated value (.csv) file with quantitative features and one categorical feature defining the class of the datapoint. More details can be found [here](https://hdi-project.github.io/ATM/readme.html#data-format).

In general, each model in the AutoML process can be treated as a multivariate datapoint with the following abstraction:

| Model Detail     | Variable Type                     |
|------------------|-----------------------------------|
| Algorithm        | Categorical variable              |
| Hyperpartition   | A set of categorical variables    |
| Hyperparameter   | A set of quantitative variables   |
| Performance      | Quantitative variable             |

### Task Abstraction

Users of this tool will be able to:

1. Get an overview of the AutoML process.
2. Connect models with the search space.
3. Analyze in a multi-granular fashion.
4. Configure the search space in-situ.

### Idiom Abstraction

1. Performance of all tried models is summarized in a histogram.
2. List of top k models for users to compare and choose is in the form of a list.
3. Performance distribution of each machine learning algorithm is visualized as a histogram. Important statistics are displayed alongside each histogram.
4. Hyperpartitions of selected algorithms are summarized as a list of progress bars. Models are pushed into corresponding progress bars based on their hyperpartitions.
5. Relationship between performance and hyperparameters of a selected algorithm is visualized using scatter plots.
Distribution of hyperparameters is presented as area plots below each scatter plot.
6. A correlation heatmap shows the correlation between features of the dataset selected from the dropdown.

## Project Timeline

TBD

This repo is an extension of ATMSeer based on the contents of its [research paper](https://arxiv.org/pdf/1902.05009v1.pdf).
