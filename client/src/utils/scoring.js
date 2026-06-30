import { polygonToCells, cellToLatLng, cellToBoundary } from 'h3-js';

// Convert bbox to H3 polygon format [lat, lng] pairs
const bboxToPolygon = (bbox) => {
    const [minLng, minLat, maxLng, maxLat] = bbox;
    return [
        [minLat, minLng],
        [minLat, maxLng],
        [maxLat, maxLng],
        [maxLat, minLng],
        [minLat, minLng], // close the polygon
    ];
};

// Count competitors within threshold degrees of a cell center (~1km at 0.009)
const countNearbyCompetitors = (elements, lat, lng, thresholdDeg = 0.003) => {
    return elements.filter((el) => {
        const elat = el.lat ?? el.center?.lat;
        const elon = el.lon ?? el.center?.lon;
        if (!elat || !elon) return false;
        return Math.abs(elat - lat) < thresholdDeg && Math.abs(elon - lng) < thresholdDeg;
    }).length;
};

// Parse Census ACS array-of-arrays response into a keyed object
const parseCensusData = (rawData) => {
    if (!rawData || !Array.isArray(rawData) || rawData.length < 2) return {};
    const headers = rawData[0];
    const values  = rawData[1];
    if (!Array.isArray(headers) || !Array.isArray(values)) return {};
    return headers.reduce((acc, key, i) => {
        acc[key] = parseFloat(values[i]) || 0;
        return acc;
    }, {});
};

const normalizeValue = (value, max) => {
    if (!value || max === 0) return 0.5;
    return Math.min(value / max, 1);
};

// Score demographic match using single Census tract data as a global modifier
const calculateDemoMatch = (parsedCensus, demographics) => {
    const hasSelections = Object.values(demographics).some(g => g.length > 0);
    if (!hasSelections) return 0.5; // no filters = neutral

    let matchScore = 0;
    let totalChecks = 0;

    // Income match
    if (demographics.income?.includes('$100k+')) {
        matchScore += parsedCensus['B19013_001E'] > 100000 ? 1 : 0;
        totalChecks++;
    }
    if (demographics.income?.includes('$60k-$100k')) {
        const income = parsedCensus['B19013_001E'];
        matchScore += (income >= 60000 && income <= 100000) ? 1 : 0;
        totalChecks++;
    }
    if (demographics.income?.includes('$30k-$60k')) {
        const income = parsedCensus['B19013_001E'];
        matchScore += (income >= 30000 && income < 60000) ? 1 : 0;
        totalChecks++;
    }
    if (demographics.income?.includes('Under $30k')) {
        matchScore += parsedCensus['B19013_001E'] < 30000 ? 1 : 0;
        totalChecks++;
    }

    // Population density match
    if (demographics.density?.includes('Urban')) {
        matchScore += parsedCensus['B01003_001E'] > 5000 ? 1 : 0;
        totalChecks++;
    }
    if (demographics.density?.includes('Suburban')) {
        const pop = parsedCensus['B01003_001E'];
        matchScore += (pop >= 1000 && pop <= 5000) ? 1 : 0;
        totalChecks++;
    }
    if (demographics.density?.includes('Rural')) {
        matchScore += parsedCensus['B01003_001E'] < 1000 ? 1 : 0;
        totalChecks++;
    }

    return totalChecks === 0 ? 0.5 : matchScore / totalChecks;
};

export const buildScoredGeoJSON = (overpassData, censusData, demographics, bbox, radius = 5, center = null) => {
    if (!overpassData?.elements || !bbox) {
        return { type: 'FeatureCollection', features: [] };
    }

    const elements = overpassData.elements;
    const parsedCensus = censusData ? parseCensusData(censusData) : null;

    const bboxWidth = Math.abs(bbox[2] - bbox[0]);
    const resolution = bboxWidth > 2.0 ? 7    // large city
        : bboxWidth > 0.5 ? 8    // city/district
            : 9;                     // neighborhood

    const thresholdDeg = resolution === 7 ? 0.02
        : resolution === 8 ? 0.009
            : 0.004;

    // Search center and radius for clipping cells to search area
    const centerLat = center?.lat ?? (bbox[1] + bbox[3]) / 2;
    const centerLng = center?.lng ?? (bbox[0] + bbox[2]) / 2;
    const radiusDeg = radius * 0.009; // convert km to degrees

    const polygon = bboxToPolygon(bbox);

    let cells;
    try {
        cells = polygonToCells(polygon, resolution);
    } catch (err) {
        console.error('H3 polygonToCells error:', err);
        return { type: 'FeatureCollection', features: [] };
    }

    // Filter cells to only those within the search radius
    const cellsInRadius = cells.filter((cell) => {
        const [lat, lng] = cellToLatLng(cell);
        const distFromCenter = Math.sqrt(
            Math.pow(lat - centerLat, 2) +
            Math.pow(lng - centerLng, 2)
        );
        return distFromCenter <= radiusDeg;
    });

    // Calculate cell counts once before mapping — not inside the loop
    const cellCounts = cellsInRadius.map((cell) => {
        const [lat, lng] = cellToLatLng(cell);
        return countNearbyCompetitors(elements, lat, lng, thresholdDeg);
    });

    const localMax = Math.max(...cellCounts, 1);

    const features = cellsInRadius.map((cell, i) => {
        const [lat, lng] = cellToLatLng(cell);
        const nearbyCount   = cellCounts[i];
        const competitorGap = 1 - (nearbyCount / localMax);

        const medianIncome = parsedCensus ? normalizeValue(parsedCensus['B19013_001E'], 250000) : 0.5;
        const popDensity   = parsedCensus ? normalizeValue(parsedCensus['B01003_001E'], 100000) : 0.5;
        const demoMatch    = parsedCensus ? calculateDemoMatch(parsedCensus, demographics) : 0.5;

        const weight = (competitorGap * 0.25) +
            (medianIncome  * 0.25) +
            (popDensity    * 0.20) +
            (demoMatch     * 0.20) +
            (competitorGap * 0.10);

        const boundary = cellToBoundary(cell).map(([lat, lon]) => [lon, lat]);
        boundary.push(boundary[0]);

        return {
            type: 'Feature',
            properties: { weight: Math.min(Math.max(weight, 0), 1) },
            geometry: { type: 'Polygon', coordinates: [boundary] }
        };
    });

    return { type: 'FeatureCollection', features };
};