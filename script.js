let selectedAlgorithms = [];
classifiers = ["knn", "logreg", "dt"],
    knn_hyperparams = ["n_neighbor", "leaf_size", "p"],
    dt_hyperparams = ["max_features", "max_depth", "min_samples_split", "min_samples_leaf"],
    logreg_hyperparams = ["C", "tol"];

document.addEventListener('DOMContentLoaded', function () {
    const collapsible1 = document.getElementById('collapsible1');
    const heatPlot = document.getElementById('heat-plot');

    collapsible1.addEventListener('click', function () {
        if (heatPlot.style.display === 'none' || heatPlot.style.display === '') {
            heatPlot.style.display = 'block';
        } else {
            heatPlot.style.display = 'none';
        }
        collapsible1.classList.toggle('active');
    });

    heatPlot.style.display = 'none';

    const collapsible2 = document.getElementById('collapsible2');
    const chartsContainer = document.getElementById('charts-container');

    collapsible2.addEventListener('click', function () {
        if (chartsContainer.style.display === 'none' || chartsContainer.style.display === '') {
            chartsContainer.style.display = 'block';
        } else {
            chartsContainer.style.display = 'none';
        }
        collapsible2.classList.toggle('active');
    });

    chartsContainer.style.display = 'none';

    loadAndRenderData();
});

function loadAndRenderData() {
    d3.csv("./python_backend/corrmat.csv")
        .then(function(data) {
            const newData = {};
            data.forEach(element => {
                original = element;
                var reqKey = original[''];
                delete original[''];
                newData[reqKey] = {...original};
            });
            drawHeatMap(newData);
        });

    d3.csv("./python_backend/classifiers_with_method.csv").then(data => {
        const maxPerformance = new Map();
        data.forEach(d => {
            const method = d.method;
            const performance = parseFloat(d.cv_judgment_metric);
            if (!maxPerformance.has(method) || performance > maxPerformance.get(method)) {
                maxPerformance.set(method, performance);
            }
        });

        const sortedMethods = Array.from(maxPerformance.keys()).sort((a, b) => maxPerformance.get(b) - maxPerformance.get(a));
         
        const colorScale = d3.scaleOrdinal()
            .domain(sortedMethods)
            .range(d3.schemeCategory10);
  
        d3.csv("./python_backend/hyperpartitions.csv").then(hyperpartitions => {
            const methodCounts = new Map();
            hyperpartitions.forEach(d => {
                const method = d.method;
                methodCounts.set(method, (methodCounts.get(method) || 0) + 1);
            });
            const maxPerformanceAll = d3.max(data, d => parseFloat(d.cv_judgment_metric));
  
            document.getElementById('charts-container').innerHTML = '';
  
            sortedMethods.forEach(method => {
                const filteredData = data.filter(d => d.method === method);
                const performanceData = filteredData.map(d => parseFloat(d.test_judgment_metric));
                
                renderHistogram(performanceData, method, maxPerformance.get(method), colorScale(method), methodCounts.get(method) || 0, maxPerformanceAll);
            });
        });
    });
}

function drawHeatMap(mappedDataFreq){
    const margin = {top: 30, right: 40, bottom: 100, left: 100},
        width = 300 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
    
    const svg = d3.select("#heat-plot")
      .append("svg")
      .attr("width", width + margin.left + margin.right) 
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`);
    
    console.log(Object.keys(mappedDataFreq));
    const myVars = Object.keys(mappedDataFreq).reverse();
    const myGroups = Object.keys(mappedDataFreq);
  
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("padding", "5px")
        .style("background-color", "white")
        .style("border", "1px solid black")
        .style("border-radius", "5px")
        .style("visibility", "hidden");
  
    const x = d3.scaleBand()
      .range([0, width])
      .domain(myGroups)
      .padding(0.01);
  
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")  
      .style("text-anchor", "end")  
      .attr("transform", "rotate(-90)")  
      .attr("dx", "-0.7em")  
      .attr("dy", "-0.6em");
  
    const y = d3.scaleBand()
      .range([height, 0])
      .domain(myVars)
      .padding(0.01);
    svg.append("g")
      .call(d3.axisLeft(y));
  
    const colorScale = d3.scaleSequential(d3.interpolatePlasma)
      .domain([0, d3.max(Object.values(mappedDataFreq).map(obj => d3.max(Object.values(obj))))]);
  
    const cells = svg.selectAll("rect")
      .data(Object.keys(mappedDataFreq).flatMap(xVal =>
        Object.keys(mappedDataFreq[xVal]).map(yVal => ({ xVal, yVal, value: mappedDataFreq[xVal][yVal] }))
      ))
      .enter()
      .append("rect")
      .attr("x", d => x(d.yVal))
      .attr("y", d => y(d.xVal))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", d => colorScale(d.value))
      .on("mouseover", function(event, d) {
          tooltip.style("visibility", "visible")
              .text(`Correlation: ${d.value}`);
      })
      .on("mousemove", function(event) {
          tooltip.style("top", `${event.pageY + 5}px`)
              .style("left", `${event.pageX + 5}px`);
      })
      .on("mouseout", function() {
          tooltip.style("visibility", "hidden");
      });
}

document.addEventListener('DOMContentLoaded', function () {
    d3.csv("./python_backend/classifiers_with_method.csv").then(data => {
        const maxPerformance = new Map();
        data.forEach(d => {
            const method = d.method;
            const performance = parseFloat(d.cv_judgment_metric);
            if (!maxPerformance.has(method) || performance > maxPerformance.get(method)) {
                maxPerformance.set(method, performance);
            }
        });

        const sortedMethods = Array.from(maxPerformance.keys()).sort((a, b) => maxPerformance.get(b) - maxPerformance.get(a));
         
        const colorScale = d3.scaleOrdinal()
            .domain(sortedMethods)
            .range(d3.schemeCategory10);
  
        d3.csv("./python_backend/hyperpartitions.csv").then(hyperpartitions => {
            const methodCounts = new Map();
            hyperpartitions.forEach(d => {
                const method = d.method;
                methodCounts.set(method, (methodCounts.get(method) || 0) + 1);
            });
            const maxPerformanceAll = d3.max(data, d => parseFloat(d.cv_judgment_metric));
  
            document.getElementById('charts-container').innerHTML = '';
  
            sortedMethods.forEach(method => {
                const filteredData = data.filter(d => d.method === method);
                const performanceData = filteredData.map(d => parseFloat(d.cv_judgment_metric));
                
                renderHistogram(performanceData, method, maxPerformance.get(method), colorScale(method), methodCounts.get(method) || 0, maxPerformanceAll);
            });
        });
    });
});

const renderHistogram = (data, method, maxPerformance, color, count, maxAll) => {
    const margin = { top: 40, right: 30, bottom: 30, left: 60 };
    const width = 200 - margin.left - margin.right;
    const height = 150 - margin.top - margin.bottom;

  
    const svg = d3.select('#charts-container')
        .append('svg')
        .attr('id', `${method}-chart`)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
  
    const chartGroup = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
  
    const binCount = d3.histogram()
        .domain([0, 1])
        .thresholds(10)
        .value(d => d)(data);
  
    const y = d3.scaleLinear()
        .domain([1, 0])
        .range([0, height]);
  
    const x = d3.scaleLinear()
        .domain([0, maxAll])
        .range([0, width]);
  
    const barWidth = (maxPerformance / maxAll) * width;
  
    chartGroup.selectAll('.bar')
        .data(binCount)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', (d, i) => y((i + 1) / 10))
        .attr('width', d => {
            const barLength = d.length;
            if (barLength > 0) {
                return barWidth * (barLength / d3.max(binCount, d => d.length));
            } else {
                return 0;
            }
        })
        .attr('height', (height / 10)-1)
        .style('fill', color);
  
    chartGroup.append('g')
        .call(d3.axisLeft(y).ticks(10).tickFormat((d, i) => i === 0 ? '' : d3.format('.1f')(d)));
  
    chartGroup.append('line')
        .attr('x1', 0)
        .attr('y1', height)
        .attr('x2', width)
        .attr('y2', height)
        .style('stroke', 'gray')
        .style('stroke-width', 1);
  
    chartGroup.append('line')
        .attr('x1', width)
        .attr('y1', 0)
        .attr('x2', width)
        .attr('y2', height)
        .style('stroke', 'gray')
        .style('stroke-width', 1);
  
    const textGroup = chartGroup.append('g')
        .attr('transform', `translate(${width / 2}, ${-margin.top / 2})`);
  
    textGroup.append('text')
        .attr('x', -53)
        .attr('y', 7) 
        .attr('text-anchor', 'left')
        .attr('dy', '0.5em')
        .text(`${method}`)      
        .style('font-size', '12px');
  
    textGroup.append('text')
        .attr('x', 0)
        .attr('y', 10) 
        .attr('text-anchor', 'middle')
        .attr('dy', '0.5em')
        .text(`${data.length}`)
        .style('font-size', '12px');
  
    textGroup.append('text')
        .attr('x', 20)
        .attr('y', 10)
        .attr('text-anchor', 'right')
        .attr('dy', '0.5em')
        .text(`${maxPerformance.toFixed(3)}`)
        .style('font-size', '12px');
  
    svg.append('foreignObject')
        .attr('x', 2)
        .attr('y', 21)
        .attr('width', 100)
        .attr('height', 30)
        .html(`<input type="checkbox" id="${method}">`);

    const addCheckboxEventListeners = () => {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', handleCheckboxChange);
            });
        };
    
        const handleCheckboxChange = (event) => {
            const checkbox = event.target;
            console.log(`Checkbox with ID ${checkbox.id} was clicked`);
            selectedAlgorithms.push(checkbox.id);
            selectedAlgorithms = Array.from(new Set(selectedAlgorithms));
            console.log("selectedAlgorithms: ", selectedAlgorithms);
            generateGridHistograms(selectedAlgorithms);
            fetchDataAndPlot();
        };
    
        addCheckboxEventListeners();
  
    chartGroup.append('circle')
        .attr('cx', width)
        .attr('cy', height)
        .attr('r', 15)
        .style('fill', 'white')
        .style('stroke', '#2a74f5')
        .style('stroke-width', 2);
  
    chartGroup.append('text')
        .attr('x', width)
        .attr('y', height)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .text(`${count}/${count}`)
        .style('font-size', '10px')
        .style('fill', 'black');
};

const addCheckboxEventListeners = () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
};

const handleCheckboxChange = (event) => {
    const selectedAlgorithms = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.id);

    generateGridHistograms(selectedAlgorithms);
};

addCheckboxEventListeners();

function generateGridHistograms(selectedAlgorithms){

    d3.select("#grid-container").selectAll("svg").remove();


    console.log(selectedAlgorithms)


    Promise.all([d3.csv('./python_backend/hyperpartitions.csv'), d3.csv('./python_backend/classifiers.csv')])
    .then(function([dataHP, dataCF]) {

            const modelsByHyperpartition = {};
            const algorithmsById = {};


            dataHP.forEach(hp => {
                algorithmsById[hp.id] = hp.method;
            })

            dataCF.forEach(datapoint => {
                const algo = algorithmsById[datapoint.hyperpartition_id];
                
                if (selectedAlgorithms.includes(algo)){
                    const hpId = datapoint.hyperpartition_id

                    if (!modelsByHyperpartition[hpId]) {
                        modelsByHyperpartition[hpId] = [];
                    }

                    modelsByHyperpartition[hpId].push({
                        model_location: datapoint.model_location,
                        test_judgment_metric: parseFloat(datapoint.test_judgment_metric)
                    });
                }
            
            });
            console.log("mbhp", modelsByHyperpartition)

            Object.values(modelsByHyperpartition).forEach(models => {
                models.sort((a, b) => b.test_judgment_metric - a.test_judgment_metric);
            });

            const hyperpartitionsWithMaxMetric = {};

            Object.keys(modelsByHyperpartition).forEach((hyperpartitionId) => {
                const models = modelsByHyperpartition[hyperpartitionId];
                const highestJudgmentMetric = Math.max(...models.map(model => model.test_judgment_metric));
                hyperpartitionsWithMaxMetric[hyperpartitionId] = {
                    models: models,
                    highestJudgmentMetric: highestJudgmentMetric
                };
            });

            const hyperpartitionsArray = Object.entries(hyperpartitionsWithMaxMetric).map(([hyperpartitionId, data]) => ({
                hyperpartitionId: hyperpartitionId,
                highestJudgmentMetric: data.highestJudgmentMetric
            }));

            hyperpartitionsArray.sort((a, b) => b.highestJudgmentMetric - a.highestJudgmentMetric);

            const numRows = Math.ceil(Math.sqrt(Object.keys(modelsByHyperpartition).length));
            const numCols = 3

            const histogramWidth = 180;
            const histogramHeight = 25;

            
            const horizontalGap = 80;
            const verticalGap = 50;

            

            const gridContainer = d3.select("#grid-container");
            hyperpartitionsArray.forEach(({hyperpartitionId}, index) => {

                const { models } = hyperpartitionsWithMaxMetric[hyperpartitionId]
                const barWidth = 30;

                const maxHeight = d3.max(models, d=> d.test_judgment_metric); 
                

                const scaleFactor = histogramHeight / maxHeight
                const rowIndex = Math.floor(index / numCols);
                const colIndex = index % numCols;

                const svgX = colIndex * (histogramWidth + horizontalGap);
                const svgY = rowIndex * (histogramHeight + verticalGap);


                const svg = gridContainer.append("svg")
                    .attr("x", svgX)
                    .attr("y", svgY)
                    .attr("width", histogramWidth + 2) 
                    .attr("height", histogramHeight) 
                    .style("border", "black")
                    .style("margin", "5px");

                svg.append("rect")
                    .attr("width", histogramWidth)
                    .attr("height", histogramHeight)
                    .style("fill", "none")
                    .style("stroke", "black")
                    .style("stroke-width", 1);


                const barsGroup = svg.append("g");

                
                barsGroup.selectAll("rect")
                    .data(models)
                    .enter()
                    .append("rect")
                    .attr("x", (d, i) => i * barWidth)
                    .attr("y", d => histogramHeight - d.test_judgment_metric * scaleFactor) 
                    .attr("width", barWidth-1)
                    .attr("height", d => d.test_judgment_metric * scaleFactor)
                    .attr("fill", "orange");
            })
    })

};

document.addEventListener('DOMContentLoaded', function () {
    const collapsible3 = document.getElementById('collapsible3');
    const gridContainer = document.getElementById('grid-container');

    collapsible3.addEventListener('click', function () {
        if (gridContainer.style.display === 'none' || gridContainer.style.display === '') {
            gridContainer.style.display = 'block';
        } else {
            gridContainer.style.display = 'none';
        }
        collapsible3.classList.toggle('active');
    });

    gridContainer.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function()
{
    //load datasets
    Promise.all([d3.csv('./datasets/drybean/classifiers.csv'), d3.csv('./datasets/drybean/dataruns.csv'), 
    d3.csv('./datasets/drybean/datasets.csv'), d3.csv('./datasets/drybean/hyperpartitions.csv')])
    .then(function (values) {
        //save datasets in variables
        drybean = [values[0], values[1], values[2], values[3]]
        // pollution = [values[4], values[5], values[6], values[7]]

        //initialize selected
        var dataSelected = d3.select('#dataset-dropdown').property('value')
        currentDataset = getDataset(dataSelected)
        
        //call panelb1 function
        panelB1(currentDataset)

        //on change for dropdown
        d3.select('#dataset-dropdown').on('change', function(d) 
        {
            var dataSelected = d3.select('#dataset-dropdown').property('value')
            currentDataset = getDataset(dataSelected)
            
            //call panelb1 function to updata
            panelB1(currentDataset)
        });
    });
});

function getDataset(data)
{
    currentDataset = drybean
    return currentDataset;
}

function panelB1(data)
{
    var margin = { top: 20, right: 10, bottom: 20, left: 10 },
    width = 300 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

    //set datasets to variables
    var classifiers = data[0]
    var dataruns = data[1]
    var datasets = data[2]
    var hyperparts = data[3]
    console.log(data)

    //create svg
    d3.select('#panel-b1-svg')
        .selectAll('*').remove()
    var svg = d3 .select("#panel-b1-svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //metric used
    svg.append('text')
        .text('Metric: ' + dataruns[0]['metric'])
    
    //best classifier
    var bestMetric = 0;
    var bestSD = 0;
    var bestID = 0;
    for(var i = 0; i < classifiers.length; i++)
    {
        if(classifiers[i]['cv_judgment_metric'] > bestMetric)
        {
            bestMetric = classifiers[i]['cv_judgment_metric']
            bestSD = classifiers[i]['cv_judgment_metric_stdev']
            bestID = classifiers[i]['hyperpartition_id']
        }
    }
    var bestClassifier = hyperparts[+bestID + 1]['method']
    var boxandtext = svg.append('g');
    boxandtext.append('rect')
        .attr('x', 105) 
        .attr('y', 15)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('width', 30)
        .attr('height', 20) 
        .style('fill', 'lightblue');
    boxandtext.append('text')
        .text('Best classifier: ' + bestClassifier + ' ' + Number(bestMetric).toFixed(3) 
            + ' +- ' + Number(bestSD).toFixed(3))
        .attr('dy', '30')
    
    //total classifiers
    svg.append('text')
        .text('Total classifiers: ' + classifiers.length)
        .attr('dy', '60')

    //algorithm
    svg.append('text')
        .text('Algorithm:')
        .attr('dy', '90')
    var algs = []
    for(i = 0; i < hyperparts.length; i++)
    {
        if(!algs.includes(hyperparts[i]['method']))
            algs.push(hyperparts[i]['method'])
    }
    var algCount = algs.length
    var donutwidth = 50,
        donutheight = 50,
        radius = Math.min(donutwidth, donutheight) / 2;
    const pie = d3.pie()
            .value(d=>d)
    var data_ready = [algCount]
    var svgX = 257
    var svgY = 334
    const donutsvg = d3.select("#donut1")
        .style("left", svgX + "px")
        .style("top", svgY + "px")
        .append("g")
        .attr("transform", `translate(${donutwidth / 2},${donutheight / 2})`);
    donutsvg
        .selectAll('donut')
        .data(pie(data_ready))
        .join('path')
        .transition()
        .duration(1000)
        .attr('d', d3.arc()
            .innerRadius(18)
            .outerRadius(radius)
        )
        .attr('fill', 'green')
    svg.append('text')
        .text(algCount + '/' + algCount)
        .attr('dy', '133')
        .attr('dx', '15')
        .attr('font-size', '10px')

    //hyperpartition
    svg.append('text')
        .text('Hyperpartition:')
        .attr('dy', '90')
        .attr('dx', '150')
    var hyperCount = hyperparts.length
    data_ready = [hyperCount]
    svgX = 107
    svgY = 334
    const donutsvg1 = d3.select("#donut2")
        .style("left", svgX + "px")
        .style("top", svgY + "px")
        .append("g")
        .attr("transform", `translate(${donutwidth / 2},${donutheight / 2})`);
    donutsvg1
        .selectAll('donut1')
        .data(pie(data_ready))
        .join('path')
        .transition()
        .duration(1000)
        .attr('d', d3.arc()
            .innerRadius(18)
            .outerRadius(radius)
        )
        .attr('fill', 'green')
    svg.append('text')
        .text(hyperCount + '/' + hyperCount)
        .attr('dy', '133')
        .attr('dx', '160')
        .attr('font-size', '10px')

    //performance
    svg.append('text')
        .text('Performance:')
        .attr('dy', '180')
    var histwidth = 230,
        histheight = 60,
        histmargin = {top: 10, right: 25, bottom: 20, left: 40};
    var histsvg = d3.select("#panel-b1-histsvg")
        .append("g")
        .attr("transform", "translate(" + histmargin.left + "," + histmargin.top + ")");
    var y = d3.scaleLinear()
        .domain([0, 1])
        .range([histheight, 0])
    histsvg.append("g")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y).ticks(5)); 
    var histogram = d3.histogram()
        .value(function(d) { return d.cv_judgment_metric; })
        .domain(y.domain()) 
        .thresholds(y.ticks(4));
    var bins = histogram(classifiers);
    var x = d3.scaleLinear()
        .range([0, histwidth])
        .domain([0, d3.max(bins, function(d) { return d.length; })]);
    histsvg.append("g")
        .attr("transform", "translate(0," + histheight + ")")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x));
    histsvg.selectAll("rect")
        .data(bins)
        .join("rect")
        .transition()
        .duration(1000)
        .attr("x", 0) 
        .attr("y", function(d) { return y(d.x1); }) 
        .attr("width", function(d) { return x(d.length); }) 
        .attr("height", function(d) { return y(d.x0) - y(d.x1) - 1; })
        .style("fill", "blue");
    histsvg.append('text')
        .text('F-score')
        .attr('transform', 'rotate(-90)')
        .attr('x', -55)
        .attr('y', -30)
        .attr('font-size', "12px")
    histsvg.append('text')
        .text('Number of Classifiers')
        .attr('x', 45)
        .attr('y', 90)
        .attr('font-size', "12px")
    panelB2(classifiers, hyperparts)
}

function panelB2(classifiers, hyperparts)
{
    var margin = { top: 20, right: 10, bottom: 20, left: 10 },
    width = 300 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

    var svg = d3.select('#panel-b2-svg')
        .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var temp = [];
    for(var i = 0; i < classifiers.length; i++)
    {
        temp.push([Number(classifiers[i]['cv_judgment_metric']).toFixed(4), classifiers[i]['cv_judgment_metric_stdev'], classifiers[i]['hyperpartition_id']])
    }
    temp = temp.sort()
    temp = temp.reverse()
    var input = document.getElementById('classifierInput').value;
    console.log(input)
    var boxandtext = svg.append('g');
    for(var i = 0; i < input; i++)
    {
        boxandtext.append('rect')
            .attr('x', 8) 
            .attr('y', i * (200/input) - 15)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', 30)
            .attr('height', 20) 
            .style('fill', 'lightblue')
        boxandtext.append('text')
            .text(hyperparts[+temp[i][2] + 1]['method'])
            .attr('y', i * (200/input))
            .attr('x', 10)
        boxandtext.append('rect')
            .attr('x', 68) 
            .attr('y', i * (200/input) - 15)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', 120)
            .attr('height', 20) 
            .style('fill', 'lightgray')
        boxandtext.append('text')
            .text(Number(temp[i][0]).toFixed(4) 
            + ' +- ' + Number(temp[i][1]).toFixed(3))
            .attr('y', i * (200/input))
            .attr('x', 70)
        if (i < input - 1)
        {
            boxandtext.append('line')
                .attr('x1', 0)
                .attr('y1', (i + 1) * (200 / input) - 23) 
                .attr('x2', 500) 
                .attr('y2', (i + 1) * (200 / input) - 23) 
                .style('stroke', 'lightgrey')
                .style('stroke-width', 1)
        }
    }
    //on change for dropdown
    d3.select('#classiferInput').on('change', function(d) 
    {
        d3.select('#panel-b2-svg')
            .selectAll('*').remove()
        var temp = [];
        for(var i = 0; i < classifiers.length; i++)
        {
            temp.push([Number(classifiers[i]['cv_judgment_metric']).toFixed(4), classifiers[i]['cv_judgment_metric_stdev'], classifiers[i]['hyperpartition_id']])
        }
        temp = temp.sort()
        temp = temp.reverse()
        var input = document.getElementById('classifierInput').value;
        console.log(input)
        var boxandtext = svg.append('g');
        for(var i = 0; i < input; i++)
        {
            boxandtext.append('rect')
                .attr('x', 8) 
                .attr('y', i * (200/input) - 15)
                .attr('rx', 5)
                .attr('ry', 5)
                .attr('width', 30)
                .attr('height', 20) 
                .style('fill', 'lightblue')
            boxandtext.append('text')
                .text(hyperparts[+temp[i][2] + 1]['method'])
                .attr('y', i * (200/input))
                .attr('x', 10)
            boxandtext.append('rect')
                .attr('x', 68) 
                .attr('y', i * (200/input) - 15)
                .attr('rx', 5)
                .attr('ry', 5)
                .attr('width', 120)
                .attr('height', 20) 
                .style('fill', 'lightgray')
            boxandtext.append('text')
                .text(Number(temp[i][0]).toFixed(4) 
                + ' +- ' + Number(temp[i][1]).toFixed(3))
                .attr('y', i * (200/input))
                .attr('x', 70)
            if (i < input - 1)
            {
                boxandtext.append('line')
                    .attr('x1', 0)
                    .attr('y1', (i + 1) * (200 / input) - 23) 
                    .attr('x2', 500) 
                    .attr('y2', (i + 1) * (200 / input) - 23) 
                    .style('stroke', 'lightgrey')
                    .style('stroke-width', 1)
            }
        }
    });
}

async function fetchDataAndPlot() {
    const response = await fetch('./python_backend/classifier_results.json');
    const data = await response.json();

    const nnScatter = data.filter(d => d["Classifier type"] === "knn" && d["Params chosen"].hasOwnProperty('n_neighbors'));
    const lsScatter = data.filter(d => d["Classifier type"] === "knn" && d["Params chosen"].hasOwnProperty('leaf_size'));
    const pScatter = data.filter(d => d["Classifier type"] === "knn" && d["Params chosen"].hasOwnProperty('p'));

    const cScatter = data.filter(d => d["Classifier type"] === "logreg" && d["Params chosen"].hasOwnProperty('C'));
    const tolScatter = data.filter(d => d["Classifier type"] === "logreg" && d["Params chosen"].hasOwnProperty('tol'));

    const mfScatter = data.filter(d => d["Classifier type"] === "dt" && d["Params chosen"].hasOwnProperty("max_features"));
    const mdScatter = data.filter(d => d["Classifier type"] === "dt" && d["Params chosen"].hasOwnProperty("max_depth"));
    const mssScatter = data.filter(d => d["Classifier type"] === "dt" && d["Params chosen"].hasOwnProperty("min_samples_split"));
    const mslScatter = data.filter(d => d["Classifier type"] === "dt" && d["Params chosen"].hasOwnProperty("min_samples_leaf"));

    const nnPlotData = nnScatter.map(d => ({
        n_neighbors: d["Params chosen"].n_neighbors,
        testScore: d["Test Score"]
    }));
    const lsPlotData = lsScatter.map(d => ({
        leaf_size: d["Params chosen"].leaf_size,
        testScore: d["Test Score"]
    }));
    const pPlotData = pScatter.map(d => ({
        p: d["Params chosen"].p,
        testScore: d["Test Score"]
    }));

    const cPlotData = cScatter.map(d => ({
        C: d["Params chosen"].C,
        testScore: d["Test Score"]
    }));
    const tolPlotData = tolScatter.map(d => ({
        tol: d["Params chosen"].tol,
        testScore: d["Test Score"]
    }));

    const mfPlotData = mfScatter.map(d => ({
        tol: d["Params chosen"].max_features,
        testScore: d["Test Score"]
    }));
    const mdPlotData = mdScatter.map(d => ({
        tol: d["Params chosen"].max_depth,
        testScore: d["Test Score"]
    }));
    const mssPlotData = mssScatter.map(d => ({
        tol: d["Params chosen"].min_samples_split,
        testScore: d["Test Score"]
    }));
    const mslPlotData = mslScatter.map(d => ({
        tol: d["Params chosen"].min_samples_leaf,
        testScore: d["Test Score"]
    }));

    if (selectedAlgorithms.includes("knn")) {
        createPlot('plot1', nnPlotData, 'n_neighbors');
        createPlot('plot2', lsPlotData, 'leaf_size');
        createPlot('plot3', pPlotData, 'p');
        const index = selectedAlgorithms.indexOf("knn");
        if (index !== -1) {
            selectedAlgorithms.splice(index, 1);
}
    } 

    if (selectedAlgorithms.includes("logreg")) {
        createPlot('plot1', cPlotData, 'C');
        createPlot('plot2', tolPlotData, 'tol');
        const index = selectedAlgorithms.indexOf("logreg");
        if (index !== -1) {
            selectedAlgorithms.splice(index, 1);
         } 
    }

    if (selectedAlgorithms.includes("dt")) {
        createPlot('plot1', mfPlotData, 'max_features');
        createPlot('plot2', mdPlotData, 'max_depth');
        createPlot('plot3', mssPlotData, 'min_samples_split');
        createPlot('plot4', mslPlotData, 'min_samples_leaf');
        const index = selectedAlgorithms.indexOf("dt");
        if (index !== -1) {
            selectedAlgorithms.splice(index, 1);
}
    }


}

function createPlot(containerId, plotData, hyperparam_name) {

    const plotContainer = document.getElementById('plot-container');
    
    const container = document.createElement('div');
    container.id = containerId;
    container.className = 'plot-div';

    plotContainer.appendChild(container);

    const margin = { top: 20, right: 30, bottom: 40, left: 100 };
    const scatterHeight = 60;
    const areaHeight = 30;


    const width = 150;

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', scatterHeight + areaHeight + margin.top + margin.bottom);

    const nn_svg = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleLinear()
        .domain([d3.min(plotData, d => d[hyperparam_name]), d3.max(plotData, d => d[hyperparam_name])])
        .range([0, width]);

    const yScatter = d3.scaleLinear()
        .domain([d3.min(plotData, d => d.testScore), d3.max(plotData, d => d.testScore)])
        .range([scatterHeight, 0]);

    nn_svg.append('g')
        .attr('transform', `translate(0, ${scatterHeight})`)
        .call(d3.axisBottom(x).ticks(0))
        .append('text')
        .attr('fill', '#000');

    nn_svg.append('g')
        .call(d3.axisLeft(yScatter).ticks(5))
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('x', -30)
        .attr('text-anchor', 'end')
        .text('F-Score');

    nn_svg.selectAll('circle')
        .data(plotData)
        .enter()
        .append('circle')
        .attr('cx', d => x(d[hyperparam_name]))
        .attr('cy', d => yScatter(d.testScore))
        .attr('r', 4)
        .style('fill', 'orange');

    const area_svg = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top + scatterHeight})`);

    const histogram = d3.histogram()
        .value(d => d[hyperparam_name])
        .domain(x.domain())
        .thresholds(x.ticks(10));

    const bins = histogram(plotData);

    const yArea = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([areaHeight, 0]);

    const area = d3.area()
        .x(d => x(d.x0))
        .y0(areaHeight)
        .y1(d => yArea(d.length))
        .curve(d3.curveBasis);

    area_svg.append('path')
        .datum(bins)
        .attr('fill', 'orange')
        .attr('d', area);

    area_svg.append('g')
        .attr('transform', `translate(0, ${areaHeight})`)
        .call(d3.axisBottom(x).ticks(5))
        .attr('x', width / 2)
        .attr('y', 500)
        .attr('text-anchor', 'middle')
        .text(hyperparam_name);

    area_svg.append('g')
        .call(d3.axisLeft(yArea).ticks(0));
}

fetchDataAndPlot();

document.addEventListener('DOMContentLoaded', function () {
    const collapsible4 = document.getElementById('collapsible4');
    const plotContainer = document.getElementById('plot-container');

    collapsible4.addEventListener('click', function () {
        if (plotContainer.style.display === 'none' || plotContainer.style.display === '') {
            plotContainer.style.display = 'flex';
        } else {
            plotContainer.style.display = 'none';
        }

        collapsible4.classList.toggle('active');
    });

    plotContainer.style.display = 'none';
});
