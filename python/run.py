"""
Starter script for the Auto Match API application
"""
import uvicorn

if __name__ == "__main__":
    # Run the FastAPI app with uvicorn
    print("Starting Semantic Similarity API – Auto Match v1.0...")
    print("Server will be available at http://localhost:8000")
    print("API documentation at http://localhost:8000/docs")
    print("Press Ctrl+C to stop the server")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)