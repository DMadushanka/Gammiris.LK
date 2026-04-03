/**
 * Clusters farmer requests by district to optimize truck routes.
 */
export const clusterRequestsByDistrict = (requests) => {
    return requests.reduce((acc, request) => {
        const { district } = request;
        if (!acc[district]) {
            acc[district] = {
                district,
                requests: [],
                totalQuantity: 0,
            };
        }
        acc[district].requests.push(request);
        acc[district].totalQuantity += request.quantity;
        return acc;
    }, {});
};

/**
 * Simple route optimizer (Greedy approach or placeholder for more complex logic)
 */
export const optimizeRoute = (cluster) => {
    // Logic to sort by proximity or priority
    return cluster.sort((a, b) => {
        // Basic sorting by quantity or distance (placeholder)
        return b.quantity - a.quantity;
    });
};
