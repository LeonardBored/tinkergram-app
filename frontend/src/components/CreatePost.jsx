import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { createPost } from '../services/api';

function CreatePost({ show, onHide, onPostCreated }) {
  const [image, setImage] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!image || !caption) {
      setError('Image and caption are required.');
      return;
    }
    if (image.length > 2048) {
      setError('Image URL must be less than 2048 characters.');
      return;
    }
    if (caption.length > 255) {
      setError('Caption must be less than 255 characters.');
      return;
    }
    setLoading(true);
    try {
      await createPost({ image, caption });
      setImage('');
      setCaption('');
      onPostCreated();
    } catch (err) {
      setError('Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setImage('');
    setCaption('');
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Share a Moment</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="formImageUrl">
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              type="url"
              placeholder="Paste image URL here..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
              maxLength={2048}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formCaption">
            <Form.Label>Caption</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
              maxLength={255}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default CreatePost;
