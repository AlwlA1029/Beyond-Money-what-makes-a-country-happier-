Papa.parse("data/WHR26_2025_only.csv", {
    download: true,
    header: true,
    dynamicTyping: true,

    complete: function(results) {
        const data = results.data.filter(row =>
            row["Country name"] &&
            typeof row["Life evaluation (3-year average)"] === "number" &&
            typeof row["Explained by: Log GDP per capita"] === "number"
        );

        console.log("Data loaded:", data);
        
        createBubbleChart(data);
        createHeatmap(data);
    },
error: function(error) {
        console.error("Could not load CSV:", error);
        alert("There was a problem loading your CSV file. Please check its filename and location.");
    }
});


function createBubbleChart(data) {

const xValues = data.map(row =>
    row["Explained by: Log GDP per capita"]
);

const yValues = data.map(row =>
    row["Life evaluation (3-year average)"]
);

const n = xValues.length;

const meanX = xValues.reduce((a, b) => a + b, 0) / n;
const meanY = yValues.reduce((a, b) => a + b, 0) / n;

const numerator = xValues.reduce((sum, x, i) =>
    sum + (x - meanX) * (yValues[i] - meanY), 0
);

const denominator = xValues.reduce((sum, x) =>
    sum + Math.pow(x - meanX, 2), 0
);

const slope = numerator / denominator;
const intercept = meanY - slope * meanX;

const minX = Math.min(...xValues);
const maxX = Math.max(...xValues);

const trendLine = {
    x: [minX, maxX],
    y: [
        slope * minX + intercept,
        slope * maxX + intercept
    ],
    mode: "lines",
    type: "scatter",
    name: "Overall trend",
    line: {
        color: "#c47b45",
        width: 3,
        dash: "dash"
    },
    hoverinfo: "skip"
};

    const highlightedCountries = [
        "Finland",
        "Costa Rica",
        "Botswana"
    ];
    

    const selectedCountries = data.filter(row =>
        highlightedCountries.includes(row["Country name"]) ||
        row["Country name"].includes("Hong Kong")
    );
    

    const allCountries = {
        x: data.map(row => row["Explained by: Log GDP per capita"]),
        y: data.map(row => row["Life evaluation (3-year average)"]),
        mode: "markers",
        type: "scatter",
        name: "Other countries and regions",

        text: data.map(row => row["Country name"]),

        textposition: "top center",

textfont: {
    size: 12,
    color: "#203b35"
},


        marker: {
            size: data.map(row => {
                const health = Math.max(
                    0,
                    row["Explained by: Healthy life expectancy"] || 0
                );
                return 8 + Math.sqrt(health) * 14;
            }),

            color: data.map(row =>
                row["Explained by: Social support"]
            ),

            colorscale: "Viridis",
            showscale: true,

            colorbar: {
                title: "Social support<br>contribution"
            },

            opacity: 0.65,
            line: {
                width: 0.5,
                color: "#ffffff"
            }
        },

        hovertemplate:
            "<b>%{text}</b><br>" +
            "GDP contribution: %{x:.3f}<br>" +
            "Life evaluation: %{y:.3f}<extra></extra>"
    };

    const selectedNames = [
    "Finland",
    "Costa Rica",
    "Hong Kong SAR of China",
    "Botswana"
];

const selectedIndices = data
    .map((row, index) =>
        selectedNames.includes(row["Country name"]) ? index : -1
    )
    .filter(index => index !== -1);

const selectedOutlines = {
    x: selectedIndices.map(index => allCountries.x[index]),
    y: selectedIndices.map(index => allCountries.y[index]),

    mode: "markers+text",
    text: selectedCountries.map(row => row["Country name"]),

textposition: "top center",

textfont: {
    size: 12,
    color: "#203b35"
},
    type: "scatter",
    name: "Selected countries",

    marker: {
        size: selectedIndices.map(index =>
            allCountries.marker.size[index]
        ),
        sizemode: allCountries.marker.sizemode,
        sizeref: allCountries.marker.sizeref,
        sizemin: allCountries.marker.sizemin,

        color: "rgba(0,0,0,0)",

        line: {
            color: "#000000",
            width: 2.5
        }
    },

    hoverinfo: "skip"
};

    const layout = {
        title: {
            text: "Does a higher GDP contribution mean greater happiness?",
             dragmode: "pan",
            font: { size: 20, color: "#203b35" }
        },

        xaxis: {
            title: "Model contribution of log GDP per capita",
            gridcolor: "#e5e0d5"
        },

        yaxis: {
            title: "Life evaluation score",
            gridcolor: "#e5e0d5"
        },

        paper_bgcolor: "#f5f2e9",
        plot_bgcolor: "#f5f2e9",

        font: {
            family: "Arial, sans-serif",
            color: "#203b35"
        },

        margin: {
            t: 70,
            r: 40,
            b: 80,
            l: 80
        },

        legend: {
            orientation: "h",
            y: -0.25
        }
    };

    Plotly.newPlot(
        "bubble-chart",
        [allCountries, selectedOutlines, trendLine],
        layout,
      {
    responsive: true,
    scrollZoom: true,
    displayModeBar: true,
    modeBarButtonsToRemove: [
        "select2d",
        "lasso2d",
        "zoom2d",
        "zoomIn2d",
        "zoomOut2d",
    ],
    displaylogo: false,
    modebar: {
        remove: ["zoom"]
    }
}
    );
}


function createHeatmap(data) {

    // Four selected countries
    const countryNames = [
        "Finland",
        "Costa Rica",
        "Hong Kong SAR of China",
        "Botswana"
    ];

    const selected = countryNames.map(name =>
        data.find(row => row["Country name"] === name)
    ).filter(Boolean);

    // Seven contribution factors
    const factors = [
        {
            label: "Log GDP per capita",
            column: "Explained by: Log GDP per capita"
        },
        {
            label: "Social support",
            column: "Explained by: Social support"
        },
        {
            label: "Healthy life expectancy",
            column: "Explained by: Healthy life expectancy"
        },
        {
            label: "Freedom to make life choices",
            column: "Explained by: Freedom to make life choices"
        },
        {
            label: "Generosity",
            column: "Explained by: Generosity"
        },
        {
            label: "Perceptions of corruption",
            column: "Explained by: Perceptions of corruption"
        },
        {
            label: "Dystopia + residual",
            column: "Dystopia + residual"
        }
    ];

    // Original contribution values (no normalisation)
    const values = selected.map(country =>
        factors.map(factor =>
            Number(country[factor.column])
        )
    );

    // Country labels with rankings
    const countryLabels = selected.map(country =>
        `${country["Country name"]} (Rank ${country["Rank"]})`
    );

    const heatmap = {
        z: values,

x: factors.map(factor => factor.label),
y: countryLabels,

text: values.map(row =>
    row.map(value => value.toFixed(2))
),

texttemplate: "%{text}",

textfont: {
    size: 13,
    color: values.map(row =>
        row.map(value =>
            value > 1.3 ? "#ffffff" : "#203b35"
        )
    ),
    family: "Arial, sans-serif"
},

type: "heatmap",

colorscale: [
    [0, "#f5f2e9"],     
    [0.35, "#d8b66a"],  
    [0.65, "#789487"],  
    [1, "#203b35"]     
],

        zmin: -0.4,
        zmax: 2.4,

        colorbar: {
            title: "Contribution to<br>life-evaluation score",
            thickness: 18
        },

        hovertemplate:
            "<b>%{y}</b><br>" +
            "%{x}<br>" +
            "Contribution: %{z:.3f}" +
            "<extra></extra>",

        xgap: 1,
        ygap: 1
    };

    const layout = {
        title: {
            text: "Contribution to life-evaluation score",
            font: {
                size: 20,
                color: "#203b35"
            }
        },

        paper_bgcolor: "#f5f2e9",
        plot_bgcolor: "#f5f2e9",

        font: {
            family: "Arial, sans-serif",
            color: "#203b35"
        },

        xaxis: {
            title: "Factor",
            tickangle: -45,
            automargin: true
        },

        yaxis: {
            title: "",
            autorange: "reversed",
            automargin: true
        },

        margin: {
            t: 80,
            b: 160,
            l: 220,
            r: 100
        },

        height: 580,

        dragmode: "pan"
    };

    const config = {
        responsive: true,
        scrollZoom: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: [
            "select2d",
            "lasso2d",
            "zoom2d",
            "zoomIn2d",
            "zoomOut2d",
            
        ]
    };

    Plotly.newPlot(
        "heatmap-chart",
        [heatmap],
        layout,
        config
    );
}
