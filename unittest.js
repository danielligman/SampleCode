class UnitTest {
	// Simple test harness

	static reportError(label, success) {
		if(!success){
			alert(label + " failed");
		}
	}

	static test1() {

		var content = 
			"{\"vertices\":[[0, 0],[2, 0],[2, 3],[0, 2]]," +
			"\"edges\":[[0,1],[1,2],[0,2],[0, 3],[2,3]]}";

		var result = ["{\"id\":110,\"vertices\":[{\"id\":101,\"x\":0,\"y\":0},{\"id\":103,\"x\":2,\"y\":3},{\"id\":102,\"x\":2,\"y\":0}],\"edges\":[]}", 
					"{\"id\":111,\"vertices\":[{\"id\":104,\"x\":0,\"y\":2},{\"id\":101,\"x\":0,\"y\":0},{\"id\":103,\"x\":2,\"y\":3}],\"edges\":[]}"];

		Utilities.resetID();

		// parse the json into a Data Object
		var data = Utilities.parseJson(content);

		// detect the internal faces ... storing them as Polygon(s) within Data class
		data.detectFaces();

		// iterate the faces and call your own drawFace() function defined elsewhere
		if(data.faces.length != result.length)
			return false;

		for (var i = 0; i < data.faces.length; i++) { 
			var str = JSON.stringify(data.faces[i]);
			if(str != result[i])
				return false;
		};

		return true;
	}

	static test2() {

		var content = 
			"{\"vertices\":[[10,0],[20,0],[30,0],[40,0],[40,50],[30,50],[20,50],[10,50]]," +
			"\"edges\":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[1,6],[2,5]]}";

		var result = [
			"{\"id\":119,\"vertices\":[{\"id\":101,\"x\":10,\"y\":0},{\"id\":108,\"x\":10,\"y\":50},{\"id\":107,\"x\":20,\"y\":50},{\"id\":106,\"x\":30,\"y\":50},{\"id\":105,\"x\":40,\"y\":50},{\"id\":104,\"x\":40,\"y\":0},{\"id\":103,\"x\":30,\"y\":0},{\"id\":102,\"x\":20,\"y\":0}],\"edges\":[]}", 
			"{\"id\":120,\"vertices\":[{\"id\":107,\"x\":20,\"y\":50},{\"id\":106,\"x\":30,\"y\":50},{\"id\":105,\"x\":40,\"y\":50},{\"id\":104,\"x\":40,\"y\":0},{\"id\":103,\"x\":30,\"y\":0},{\"id\":102,\"x\":20,\"y\":0}],\"edges\":[]}", 
			"{\"id\":121,\"vertices\":[{\"id\":106,\"x\":30,\"y\":50},{\"id\":105,\"x\":40,\"y\":50},{\"id\":104,\"x\":40,\"y\":0},{\"id\":103,\"x\":30,\"y\":0}],\"edges\":[]}"
		];

		Utilities.resetID();

		// parse the json into a Data Object
		var data = Utilities.parseJson(content);

		// detect the internal faces ... storing them as Polygon(s) within Data class
		data.detectFaces();

		// iterate the faces and call your own drawFace() function defined elsewhere
		if(data.faces.length != result.length)
			return false;

		for (var i = 0; i < data.faces.length; i++) { 
			var str = JSON.stringify(data.faces[i]);
			if(str != result[i])
				return false;
		};

		return true;
	}


	static testAll() {
		UnitTest.reportError("Test1", UnitTest.test1());
		UnitTest.reportError("Test2", UnitTest.test2());
        alert("Unit tests completed.");
	}
};
