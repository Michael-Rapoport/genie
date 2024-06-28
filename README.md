Running the Application
Install Dependencies: Ensure you have all dependencies installed by running:

pip install -r requirements.txt
Run Flask App: Start the Flask application with:

python app.py
Run with Docker:

Build the Docker image:
docker build -t my-web-crawler .
Run the Docker container:
docker run -p 5000:5000 my-web-crawler
Run with Docker Compose:

docker-compose up --build
Visit http://localhost:5000 in your web browser to access the web crawler application.

Final File Structure
Your project directory should look like this:

/my-web-crawler
│
├── app.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── templates
│   └── index.html
└── static
    └── script.js
