// Import country boundaries feature collection.
var dataset = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017');

// Apply filter where country name equals Kenya.
var KenyanBorder = dataset.filter(ee.Filter.eq('country_na', 'Kenya'));

// Print new "KenyanBorder" object and explorer features and properties.
// There should only be one feature representing Kenyan.
print(KenyanBorder);

// Add Kenya outline to the Map as a layer.
Map.centerObject(KenyanBorder, 6);
Map.addLayer(KenyanBorder);
// Import LST image collection.
var modis = ee.ImageCollection('MODIS/MOD11A2');

// Define a date range of interest; here, a start date is defined and the end
// date is determined by advancing 1 year from the start date.
var start = ee.Date('2015-01-01');
var dateRange = ee.DateRange(start, start.advance(1, 'year'));

// Filter the LST collection to include only images intersecting the desired
// date range.
var mod11a2 = modis.filterDate(dateRange);

// Select only the 1km day LST data band.
var modLSTday = mod11a2.select('LST_Day_1km');

// Scale to Kelvin and convert to Celsius, set image acquisition time.
var modLSTc = modLSTday.map(function(img) {
  return img
    .multiply(0.02)
    .subtract(273.15)
    .copyProperties(img, ['system:time_start']);
});

// Chart time series of LST for Kenya in 2015.
var ts1 = ui.Chart.image.series({
  imageCollection: modLSTc,
  region: KenyanBorder,
  reducer: ee.Reducer.mean(),
  scale: 1000,
  xProperty: 'system:time_start'})
  .setOptions({
     title: 'LST 2015 Time Series',
     vAxis: {title: 'LST Celsius'}});
print(ts1);

// Calculate 8-day mean temperature for Kenya in 2015.
var clippedLSTc = modLSTc.mean().clip(KenyanBorder);

// Add clipped image layer to the map.
Map.addLayer(clippedLSTc, {
  min: 10, max: 45,
  palette: ['blue', 'limegreen', 'yellow', 'darkorange', 'red']},
  'Mean temperature, 2015');
