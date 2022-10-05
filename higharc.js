// ---------------------------------------------------------------------------
//
// higharc.js
//
// Algorithm 1:
//      The Data object is constructed with the vertex and edge data (extracted 
//   from the JSON input).  The Data object provides the function detectFaces()
//   to compute the the interior polygons 
//
// Algorithm 2:
//     After Algorithm 1 has been computed, the Data object can also be used 
//   to determine adjacent faces by calling detectAdjacentFaces(initFace)
//   Pseudo-code implemented only
//  
// Algorithm 3:
//     Not implemented // hit test ... point => polygon
//
// Algorithm 4:
//     Not implemented yet  // neighboring face sets
//
// ---------------------------------------------------------------------------
// 
// Example Usage:
//
//      // init the json data
//      var content = "{\"vertices\":[[0, 0],[2, 0],[2, 3],[0, 2]]," +
//                     "\"edges\":[[0,1],[1,2],[0,2],[0, 3],[2,3]]}"
//
//      // parse the json into a Data Object
//   	var data = Utilities.parseJson(content);
//
//      // detect the internal faces ... storing them as Polygon(s) within Data class
//      data.detectFaces();
//
//		// iterate the faces and call your own drawFace() function defined elsewhere
//      data.faces.forEach(face => { drawFace(face) };
//
//
// ---------------------------------------------------------------------------

// TODO: 
//    In addition to this list, TODO comments are found throughout code 
//    where improvements can be made
//    
//    1. Move away from using javascript Object references in Polygon, Edges,  
//       Vertex to always referencing using a uniqueID.  Cache reference to all   
//       objects created in a map using the uniqueID as the key. 
//
//    2. There is tension between creating a data structure with most  
//       everything you will need upfront (compute early), and creating a minimal
//       one that recomputes most everything when requested (lazy compute).  I
//       don't feel I found the ideal balance in this implementation.
//
// ---------------------------------------------------------------------------


class Vertex {
	constructor(x, y) {
		this.id = Utilities.uniqueID();
		this.x = x;
		this.y = y;
		// this.edges = [];     // Note: performance cache the consuming edges for rapid access
		// this.polygons = [];  // Note: performance cache the consuming polygons for rapid access
	}
	static instanceWithJson(json) {
		return new Vertex(json[0], json[1]);
	}
}

class Edge  {
	constructor(v1, v2) {
		this.id = Utilities.uniqueID();
		this.v1 = v1;
		this.v2 = v2;

		// v2.edges.push(this); // Note: performance cache the consuming Edge for rapid access
		// v1.edges.push(this); // Note: performance cache the consuming Edge for rapid access
		// this.polygons = [];  // Note: performance cache the consuming Polygons for rapid access
	}
}

class Polygon  {
	constructor(vertices, edges) {
		this.id = Utilities.uniqueID();
		this.vertices = [];
		this.edges = [];

		edges.forEach(edge => {
			this.edges.push( edge );
		});

		vertices.forEach(vertex => {
			this.vertices.push( vertex );
		});
	}
}

/** 
 *
 *  'Data' is the top level data container (ex: vertex, edges)
 *      and the interface to that data (ex: detectFaces())
 *      and the cache for any derived/computed data (ex: faces)
 *  
 */

class Data {

	// Convert json input into vertex & edge lists
	constructor(json){
		this.vertices = [];
		this.edges = [];
		this.faces = [];

		// TODO: Triangles to be used for hit testing when implemented
		//  this.triangles = [];

		json.vertices.forEach(jsonVertex => {
			this.vertices.push( Vertex.instanceWithJson(jsonVertex) );
		});

		json.edges.forEach(jsonEdge => {

			// TODO : bounds/valid check jsonEdge[0];
			// TODO : bounds/valid check jsonEdge[1];

			var v1 = this.vertices[jsonEdge[0]];
			var v2 = this.vertices[jsonEdge[1]];
			var edge = new Edge(v1, v2);

			this.edges.push(edge);
		});

	}
	
	// compute the bounds: min/max of X/Y vertices
	detectBounds() {
		let bounds = { X: { min: Number.MAX_VALUE, max: Number.MIN_VALUE} , Y: { min:Number.MAX_VALUE, max:Number.MIN_VALUE }};
		this.vertices.forEach( vertex => {
			bounds.X.min = Math.min(bounds.X.min, vertex.x);
			bounds.X.max = Math.max(bounds.X.max, vertex.x);
			bounds.Y.min = Math.min(bounds.Y.min, vertex.y);
			bounds.Y.max = Math.max(bounds.Y.max, vertex.y);
		});
		return bounds;
	}


	/*
	 * Algorithm #1
	 *   Polygons are effectively cycles in an undirected graph
	 * 
	 *   The typical solution is to use Depth First Search (DFS) to find those cycles
	 *
	 *   Depth First Search is O(V+E)
	 */
	detectFaces() {

		// Depth First Search (DFS) variables :

		// numEdges: the # of cycles is limited by the size of the graph
		var numEdges = this.edges.length;

		// graph: specialized duplication of vertx/edge data and *might* be eliminated later
		var graph = Array.from(Array(numEdges), ()=>Array());

		// cycles: vertices in each polygon
		var cycles = Array.from(Array(numEdges), ()=>Array());
		
		// color: flag used for graph traversal
		var color = Array(numEdges).fill(0);
	
		// parent: verticies connect to each vertex via an edge
		var parent = Array(numEdges).fill(0);

		// cycleNum: the current cycle
		var cycleNum = 0;

		
		/**
		 *    Nested function to mark the vertex with different colors for different cycles
		 * 
		 *    A nested function as used to minimize the visibilty of this fn() externally
		 */
		function dfsCycle(u, p, color, parent)
		{
			// already (completely) visited vertex
			if (color[u] == 2) {
				return;
			}
		
			// cycle detected:
			//   backtrack based on parents to find the complete cycle
			if (color[u] == 1){
				var v = [];
				var cur = p;
				v.push(cur);
		
				// backtrack the vertex which are in the current cycle
				while (cur != u) {
					cur = parent[cur];
					v.push(cur);
				}
				cycles[cycleNum] = v;
				cycleNum++;
				return;
			}
			parent[u] = p;
		
			// partially visited.
			color[u] = 1;
		
			// simple dfs on graph
			for(var v of graph[u]) {
				// if it has not been visited previously
				if (v == parent[u]){
					continue;
				}
				dfsCycle(v, u, color, parent);
			}
		
			// completely visited.
			color[u] = 2;
		}

		/**
		 *   Utility function to add the edges to the graph
		 * 
		 *   A nested function as used to minimize the visibilty of this fn() externally
		 */
		function addEdge(self, e) {
			// TODO: vertex id being pushed into the graph is the index into the vertices array 
			//    better still ... use the uniqueId
			var id1 = self.vertices.indexOf(e.v1);
			var id2 = self.vertices.indexOf(e.v2);
  			graph[id1].push(id2);
  			graph[id2].push(id1);

		}

		// Begin processing the vertex and edge data to find the faces/polygons ...
		//    populate the graph with the edge data
		this.edges.forEach(edge => {
			addEdge(this, edge);
		});

		// call DFS to mark the cycles
		dfsCycle(1, 0, color, parent);

		// create the Face (polygon) from the cycle 
		for (var i = 0; i < cycleNum; i++) {
			var vertices = [];
			var edges = [];

			for(var vertex of cycles[i]) {
				// TODO: vertex is the index into the vertices array .. 
				//   better still ... use the uniqueId
				vertices.push(this.vertices[vertex]);

			}

			// create the Face/Polygon, set the ID, etc
			this.faces.push( new Polygon(vertices, edges));
		}

		return cycleNum;
	}

	/*
	 * Algorithm #2
	 *   Find adjacent faces to the input face ID
	 *
	 *   This is O(?)
	 */
	detectAdjacentFaces(faceID) {

		var adjacent = [];

		// Performance:
		//
		// 1. adjacent faces could be 'cached' during the initial polygon detection/creation
		//   ->  When a polygon is first created a ref/uniqueId/backPointer could be 
		//       stored with the edges and vertices when they are consumed... and would 
		//       not need to be calculated later 
		//          (i.e. memory vs. execution trade-off O(1) )
		//
		// 2. adjacent faces can also be detected afterwards, 
		//       but it can be slow... a simple one is O() ... very large
		//       
		//       pseudo code: 
		//          1. map faceID to a face object
		//          2. for each edge (edge1) in that face object
		//          3.   for each vertex in that edge
		//          4.     for all other faces in data set
		//          5.       for each edges (edge2) in those faces
		//          6.          if edge1 == edge2 => adjacent face found	
		//

		/*
		// map faceID to face object
		this.faces.forEach( face1 => {
			// switch faces to hash map to avoid this loop
			if(face1.id == faceID){
				// iterate all edges in all faces and test for match against edges from face1
				face1.edges.forEach( edge1 => {
					this.faces.forEach( face2 => {
						if(face1 != face2){
							face2.edges.forEach( edge2 => {
								if(edge1.id == edge2.id){
									// they share an edge
									adjacent.push(face2);
								}
							});
						}
					});
				});
			}
		});
		*/

		return alert("Not fully implemented... see code for details");
	}

};

class Utilities {

	// generate a uniqueID
	//    starting at 100
	static initID = 100;  
	static lastID = 100;  

	static resetID(){
		return Utilities.lastID = Utilities.initID;
	}

	static uniqueID(){
		Utilities.lastID += 1;
		return Utilities.lastID;
	}

	static parseJson(rawJson) {		
		const json = JSON.parse(rawJson)
		// TODO: perform basic/comprehensive/validity testing of incoming data here

		return new Data(json);
	}
};

