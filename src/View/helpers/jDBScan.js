/* 
 Author: Corneliu S. (github.com/upphiminn)
 2013
 */

const jDBSCAN = function () {
	// local instance vars.
	let eps;
	let minPts;
	let data = [];
	let clusters = [];
	let status = [];
	let distance = (c1, c2) => {
		return (c1.l - c2.l) * (c1.l - c2.l) + (c1.a - c2.a) * (c1.a - c2.a) + (c1.b - c2.b) * (c1.b - c2.b);
	}

	// core algorithm related
	function get_region_neighbours(point_idx) {
		const neighbours = [];
		let d = data[point_idx];

		for (let i = 0; i < data.length; i++) {
			if (point_idx === i) {
				continue;
			}

			if (distance(data[i], d) <= eps) {
				neighbours.push(i);
				// console.log("neighbours", distance(data[i], d), eps);
			}
		}

		return neighbours;
	}

	// function expand_cluster(point_idx, neighbours, cluster_idx) {
	// 	clusters[cluster_idx - 1].push(point_idx); // add point to cluster
	// 	status[point_idx] = cluster_idx; // assign cluster id

	// 	for (let i = 0; i < neighbours.length; i++) {
	// 		const curr_point_idx = neighbours[i];

	// 		if (status[curr_point_idx] === undefined) {
	// 			status[curr_point_idx] = 0; // visited and marked as noise by default
	// 			let curr_neighbours = get_region_neighbours(curr_point_idx);
	// 			let curr_num_neighbours = curr_neighbours.length;

	// 			if (curr_num_neighbours >= minPts) {
	// 				expand_cluster(curr_point_idx, curr_neighbours, cluster_idx);
	// 			}
	// 		}

	// 		if (status[curr_point_idx] < 1) {
	// 			// not assigned to a cluster but visited (= 0)
	// 			status[curr_point_idx] = cluster_idx;
	// 			clusters[cluster_idx - 1].push(curr_point_idx);
	// 		}
	// 	}
	// }

	function expand_cluster(point_idx, neighbours, cluster_idx) {
		let stack = []; // 创建一个栈，用于迭代替代递归  
		stack.push({ point_idx, neighbours }); // 将初始参数压入栈中  

		while (stack.length > 0) {
			const { point_idx, neighbours } = stack.pop(); // 从栈中取出参数  

			clusters[cluster_idx - 1].push(point_idx); // 将点添加到簇中  
			status[point_idx] = cluster_idx; // 分配簇的标识  

			for (let i = 0; i < neighbours.length; i++) {
				const curr_point_idx = neighbours[i];

				if (status[curr_point_idx] === undefined) {
					status[curr_point_idx] = 0; // 默认将其标记为已访问但噪声点  
					let curr_neighbours = get_region_neighbours(curr_point_idx);
					let curr_num_neighbours = curr_neighbours.length;

					if (curr_num_neighbours >= minPts) {
						stack.push({ point_idx: curr_point_idx, neighbours: curr_neighbours }); // 将参数压入栈中  
					}
				}

				if (status[curr_point_idx] < 1) {
					// 未分配到簇但已访问（= 0）  
					status[curr_point_idx] = cluster_idx;
					clusters[cluster_idx - 1].push(curr_point_idx);
				}
			}
		}
	}

	let dbscan = function () {
		status = [];
		clusters = [];

		for (let i = 0; i < data.length; i++) {
			if (status[i] === undefined) {
				status[i] = 0; // visited and marked as noise by default
				const neighbours = get_region_neighbours(i);
				const num_neighbours = neighbours.length;

				if (num_neighbours < minPts) {
					status[i] = 0; // noise
				} else {
					clusters.push([]); // empty new cluster
					const cluster_idx = clusters.length;
					expand_cluster(i, neighbours, cluster_idx);
				}
			}
		}

		return status;
	};

	// resulting clusters center points
	dbscan.getClusters = function () {
		const num_clusters = clusters.length;
		const clusters_centers = [];

		for (let i = 0; i < num_clusters; i++) {
			clusters_centers[i] = { l: 0, a: 0, b: 0 };

			for (let j = 0; j < clusters[i].length; j++) {
				clusters_centers[i].l += data[clusters[i][j]].l;
				clusters_centers[i].a += data[clusters[i][j]].a;
				clusters_centers[i].b += data[clusters[i][j]].b;
			}

			clusters_centers[i].l /= clusters[i].length;
			clusters_centers[i].a /= clusters[i].length;
			clusters_centers[i].b /= clusters[i].length;
			clusters_centers[i].dimension = clusters[i].length;
			clusters_centers[i].parts = clusters[i];
		}

		return clusters_centers;
	};

	// getters and setters
	dbscan.data = function (d) {
		if (arguments.length === 0) {
			return data;
		}

		if (Array.isArray(d)) {
			data = d;
		}

		return dbscan;
	};

	dbscan.eps = function (e) {
		if (arguments.length === 0) {
			return eps;
		}

		if (typeof e === 'number') {
			eps = e;
		}

		return dbscan;
	};

	dbscan.minPts = function (p) {
		if (arguments.length === 0) {
			return minPts;
		}

		if (typeof p === 'number') {
			minPts = p;
		}

		return dbscan;
	};

	return dbscan;
};

export default jDBSCAN;
