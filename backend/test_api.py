import pytest
from fastapi.testclient import TestClient
from main import app
from models.storage import storage
import os
import tempfile

client = TestClient(app)


@pytest.fixture
def test_project():
    project = storage.create_project("Test Project")
    yield project
    storage.delete_project(project.id)


def test_create_project():
    response = client.post("/api/projects", json={"name": "Test Project"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Project"
    assert "id" in data
    storage.delete_project(data["id"])


def test_get_project(test_project):
    response = client.get(f"/api/projects/{test_project.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_project.id
    assert data["name"] == test_project.name


def test_update_project(test_project):
    response = client.patch(
        f"/api/projects/{test_project.id}",
        json={"name": "Updated Name"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"


def test_delete_project():
    project = storage.create_project("To Delete")
    response = client.delete(f"/api/projects/{project.id}")
    assert response.status_code == 200

    response = client.get(f"/api/projects/{project.id}")
    assert response.status_code == 404


def test_upload_image(test_project):
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
        f.write(b"fake image data")
        temp_path = f.name

    try:
        with open(temp_path, "rb") as f:
            response = client.post(
                f"/api/projects/{test_project.id}/media",
                files={"file": ("test.jpg", f, "image/jpeg")}
            )
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "image"
        assert "media_id" in data
    finally:
        os.unlink(temp_path)


def test_upload_video(test_project):
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
        f.write(b"fake video data")
        temp_path = f.name

    try:
        with open(temp_path, "rb") as f:
            response = client.post(
                f"/api/projects/{test_project.id}/media",
                files={"file": ("test.mp4", f, "video/mp4")}
            )
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "video"
    finally:
        os.unlink(temp_path)


def test_upload_invalid_file(test_project):
    with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as f:
        f.write(b"not media")
        temp_path = f.name

    try:
        with open(temp_path, "rb") as f:
            response = client.post(
                f"/api/projects/{test_project.id}/media",
                files={"file": ("test.txt", f, "text/plain")}
            )
        assert response.status_code == 400
    finally:
        os.unlink(temp_path)


def test_upload_audio(test_project):
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        f.write(b"fake audio data")
        temp_path = f.name

    try:
        with open(temp_path, "rb") as f:
            response = client.post(
                f"/api/projects/{test_project.id}/audio",
                files={"file": ("test.mp3", f, "audio/mpeg")}
            )
        assert response.status_code == 200
        data = response.json()
        assert "audio_id" in data
    finally:
        os.unlink(temp_path)


def test_delete_audio(test_project):
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        f.write(b"fake audio data")
        temp_path = f.name

    try:
        with open(temp_path, "rb") as f:
            client.post(
                f"/api/projects/{test_project.id}/audio",
                files={"file": ("test.mp3", f, "audio/mpeg")}
            )

        response = client.delete(f"/api/projects/{test_project.id}/audio")
        assert response.status_code == 200
    finally:
        os.unlink(temp_path)


def test_create_render(test_project):
    response = client.post("/api/renders", json={"project_id": test_project.id})
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == test_project.id
    assert "id" in data


def test_get_render(test_project):
    render_response = client.post("/api/renders", json={"project_id": test_project.id})
    render_id = render_response.json()["id"]

    response = client.get(f"/api/renders/{render_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == render_id


def test_cancel_render(test_project):
    render_response = client.post("/api/renders", json={"project_id": test_project.id})
    render_id = render_response.json()["id"]

    response = client.post(f"/api/renders/{render_id}/cancel")
    assert response.status_code == 200


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
