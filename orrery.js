
        // Initialize the Three.js scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        // Create a camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;

        // Create a renderer and add it to the DOM
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('canvas-container').appendChild(renderer.domElement);

        // Add orbit controls to allow user interaction
        const controls = new THREE.OrbitControls(camera, renderer.domElement);

        // Add a point light to simulate the Sun
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(0, 0, 0);  // Sun at the center
        scene.add(pointLight);

        // Function to add a Sun to the scene
        function addSun() {
            const sunGeometry = new THREE.SphereGeometry(2, 32, 32);  // Adjust size as needed
            const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Sun color (yellow)
            const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
            scene.add(sunMesh);
        }

        // Add Sun
        addSun();

        // Function to add a planet to the scene
        function addPlanet(name, radius, color, distanceFromSun) {
            const geometry = new THREE.SphereGeometry(radius, 32, 32);
            const material = new THREE.MeshBasicMaterial({ color: color });
            const planet = new THREE.Mesh(geometry, material);
            planet.position.x = distanceFromSun;
            scene.add(planet);

            // Create a label for the planet
            const label = document.createElement('div');
            label.className = 'label';
            label.textContent = name;
            label.style.position = 'absolute';
            label.style.color = 'white';
            label.style.fontSize = '12px';
            label.style.padding = '2px';
            document.body.appendChild(label);

            planet.userData.label = label;  // Attach label to planet
            return planet;
        }

        // Add planets
        const earth = addPlanet('Earth', 1, 0x0000ff, 10);  // Earth closer to the Sun
        const mars = addPlanet('Mars', 0.5, 0xff0000, 15);  // Mars

        // Function to fetch asteroid data from NASA API
        async function fetchAsteroids() {
            const apiKey = 'QAbotNKBlenUTnAh1WhdeyVP81vfnPu3zHoXRPdE';  // Replace with your NASA API key
            try {
                const response = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=2024-01-01&end_date=2024-01-07&api_key=${apiKey}`);
                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }
                const data = await response.json();
                return data.near_earth_objects;
            } catch (error) {
                console.error('Error fetching asteroids:', error);
                return [];
            }
        }

        // Add asteroids to the scene
        async function addAsteroidsToScene() {
            const asteroids = await fetchAsteroids();

            // Iterate over each asteroid and add it to the scene
            Object.keys(asteroids).forEach(date => {
                asteroids[date].forEach(asteroid => {
                    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
                    const material = new THREE.MeshBasicMaterial({ color: 0x808080 });  // Asteroids color set to grey
                    const asteroidMesh = new THREE.Mesh(geometry, material);

                    // Randomize position for demonstration purposes
                    asteroidMesh.position.set(
                        (Math.random() - 0.5) * 100,
                        (Math.random() - 0.5) * 100,
                        (Math.random() - 0.5) * 100
                    );
                    scene.add(asteroidMesh);

                    // Create a label for the asteroid
                    const label = document.createElement('div');
                    label.className = 'label';
                    label.textContent = asteroid.name;  // Assign the asteroid's name to the label
                    document.body.appendChild(label);   // Add the label to the DOM

                    asteroidMesh.userData.label = label;  // Attach label to asteroid
                });
            });
        }

        addAsteroidsToScene();

        // Function to update the labels' positions
        function updateAsteroidLabels() {
            scene.traverse(function (object) {
                if (object instanceof THREE.Mesh && object.userData.label) {
                    const label = object.userData.label;
                    const vector = new THREE.Vector3(object.position.x, object.position.y, object.position.z);

                    // Project 3D position to 2D space
                    vector.project(camera);

                    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

                    // Update the position of the HTML label
                    label.style.left = `${x}px`;
                    label.style.top = `${y}px`;
                }
            });
        }

        // Render loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            updateAsteroidLabels();  // Call the correct function to update labels
            renderer.render(scene, camera);
        }

        animate();
