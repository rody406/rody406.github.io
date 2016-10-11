///From https://raw.githubusercontent.com/mdn/webgl-examples/gh-pages/tutorial/sample2/webgl-demo.js


var canvas;
var gl;
var objVerticesBuffer;
var mvMatrix;
var frame =0;
var perspectiveMatrix;


var vertexPositionAttributeLambert;

var whiteShader;
var redShader;
var blueShader;
var yellowShader;

var monkeyRoot = new Monkey();
monkeyRoot.bootRoot(0);


//
// start
//
// Called when the canvas is created to get the ball rolling.
// Figuratively, that is. There's nothing moving in this demo.
//
function start() {
    canvas = document.getElementById("glcanvas");

    initWebGL(canvas);      // Initialize the GL context

    // Only continue if WebGL is available and working

    if (gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

        // Initialize the shaders; this is where all the lighting for the
        // vertices and so forth is established.

        initShaders();

        // Here's where we call the routine that builds all the objects
        // we'll be drawing.

        initBuffers();

        // Set up to draw the scene periodically.

        setInterval(drawScene, 15);
    }
}

//
// initWebGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
function initWebGL() {
    gl = null;

    try {
        gl = canvas.getContext("experimental-webgl");
    }
    catch(e) {
    }

    // If we don't have a GL context, give up now

    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
    }
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just have
// one object -- a simple two-dimensional square.
//
function initBuffers() {


    ///Now do the obj buffer
    objVerticesBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, objVerticesBuffer);

    objVertices = getObj(obj).faces;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objVertices), gl.STATIC_DRAW);

}




//
// drawScene
//
// Draw the scene.
//

//Look at https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Lighting_in_WebGL
function drawScene() {
    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Establish the perspective with which we want to view the
    // scene. Our field of view is 45 degrees, with a width/height
    // ratio of 640:480, and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    perspectiveMatrix = makePerspective(60, 640.0/480.0, 0.1, 100.0);



    loadIdentity();

    mvTranslate([cameraX, cameraY, 0]);
	
	currentShader = yellowShader;
		
    mvTranslate([0, 0, -20]);
	mvRotateX(cameraRotateY);
		

    gl.useProgram(currentShader.shaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, objVerticesBuffer);
    gl.vertexAttribPointer(currentShader.attributes["vertexPositionAttribute"], 3, gl.FLOAT, false, 0, 0);
    setMatrixUniforms(currentShader);
    gl.drawArrays(gl.TRIANGLES, 0, objVertices.length/3);
		
	mvPush();
		currentShader = blueShader;
		
		
		mvRotateZ(frame/500);
		
		mvScale(.8, .8, .8);
		mvTranslate([0, -10, 0]);
		
			
		mvRotateZ(frame/10);
		
	
		gl.useProgram(currentShader.shaderProgram);
		gl.bindBuffer(gl.ARRAY_BUFFER, objVerticesBuffer);
		gl.vertexAttribPointer(currentShader.attributes["vertexPositionAttribute"], 3, gl.FLOAT, false, 0, 0);
		setMatrixUniforms(currentShader);
		gl.drawArrays(gl.TRIANGLES, 0, objVertices.length/3);
	
		mvPush();
			currentShader = whiteShader;
			
			mvRotateZ(-frame/10.2);
			
			mvScale(.5, .5, .5);
			
			mvTranslate([0, -5, 0]);
			
			mvRotateZ(frame/200);
			
			gl.useProgram(currentShader.shaderProgram);
			gl.bindBuffer(gl.ARRAY_BUFFER, objVerticesBuffer);
			gl.vertexAttribPointer(currentShader.attributes["vertexPositionAttribute"], 3, gl.FLOAT, false, 0, 0);
			setMatrixUniforms(currentShader);
			gl.drawArrays(gl.TRIANGLES, 0, objVertices.length/3);
		mvPop();
	mvPush();
	frame++

}

//
// initShaders
//
// Initialize the shaders, so WebGL knows how to light our scene.
//
function initShaders() {

    whiteShader = (new ShaderProgram("shader-fs-white", "shader-vs", [{localName: "vertexPositionAttribute", shaderName: "aVertexPosition"}]));
    redShader = new ShaderProgram("shader-fs-red", "shader-vs", [{localName: "vertexPositionAttribute", shaderName: "aVertexPosition"}])
    blueShader = new ShaderProgram("shader-fs-blue", "shader-vs", [{localName: "vertexPositionAttribute", shaderName: "aVertexPosition"}])
    yellowShader = new ShaderProgram("shader-fs-yellow", "shader-vs", [{localName: "vertexPositionAttribute", shaderName: "aVertexPosition"}])



    var vertexShaderLambert = getShader(gl, "shader-vs");
    var fragmentShaderLambert = getShader(gl, "shader-fs-red");

    shaderProgramLambert = gl.createProgram();
    gl.attachShader(shaderProgramLambert, vertexShaderLambert);
    gl.attachShader(shaderProgramLambert, fragmentShaderLambert);
    gl.linkProgram(shaderProgramLambert);

    if (!gl.getProgramParameter(shaderProgramLambert, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shader));
    }

    vertexPositionAttributeLambert = gl.getAttribLocation(shaderProgramLambert, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttributeLambert);

}

//
// getShader
//
// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl, id) {
    var shaderScript = document.getElementById(id);

    // Didn't find an element with the specified ID; abort.

    if (!shaderScript) {
        return null;
    }

    // Walk through the source element's children, building the
    // shader source string.

    var theSource = "";
    var currentChild = shaderScript.firstChild;

    while(currentChild) {
        if (currentChild.nodeType == 3) {
            theSource += currentChild.textContent;
        }

        currentChild = currentChild.nextSibling;
    }

    // Now figure out what type of shader script we have,
    // based on its MIME type.

    var shader;

    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;  // Unknown shader type
    }

    // Send the source to the shader object

    gl.shaderSource(shader, theSource);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

