import React, { useState } from 'react';
import { Card, Spinner, Row, Col, Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaRegEdit, FaTrash } from 'react-icons/fa';
import { updatePost, deletePost } from '../services/api';

function PostList({ posts, loading, onPostUpdated, onPostDeleted }) {
  const [showModal, setShowModal] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editImage, setEditImage] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleImageClick = (post) => {
    setActivePost(post);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleEditClick = () => {
    setEditImage(activePost.image);
    setEditCaption(activePost.caption);
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editImage || !editCaption) {
      setEditError('Image and caption are required.');
      return;
    }
    if (editImage.length > 2048) {
      setEditError('Image URL must be less than 2048 characters.');
      return;
    }
    if (editCaption.length > 255) {
      setEditError('Caption must be less than 255 characters.');
      return;
    }
    setEditLoading(true);
    try {
      await updatePost(activePost.id, { image: editImage, caption: editCaption });
      setShowEditModal(false);
      setShowModal(false);
      setActivePost(null);
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      setEditError('Failed to update post.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePost(activePost.id);
      setShowDeleteModal(false);
      setShowModal(false);
      setActivePost(null);
      if (onPostDeleted) onPostDeleted();
    } catch (err) {
      // Optionally show error
    }
  };

  const handleDeleteClose = () => {
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return <div className="text-center text-muted my-5">No posts found.</div>;
  }

  return (
    <>
      <Row xs={1} md={3} className="g-4">
        {posts.map((post) => (
          <Col key={post.id}>
            <Card className="mb-0 shadow-sm h-100 post-card" style={{ borderRadius: '18px', background: 'var(--bs-light)', border: '1.5px solid #e0e0e0' }}>
              {post.image && (
                <div style={{ overflow: 'hidden', borderTopLeftRadius: '18px', borderTopRightRadius: '18px' }}>
                  <Card.Img
                    variant="top"
                    src={post.image}
                    alt="Post"
                    style={{ objectFit: 'cover', height: 250, cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => handleImageClick(post)}
                    className="post-img-hover"
                  />
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
      {/* View Modal */}
      <Modal show={showModal} onHide={handleClose} centered dialogClassName="custom-view-modal">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Post Details</Modal.Title>
        </Modal.Header>
        {activePost && (
          <>
            <Modal.Body className="modal-body-custom">
              <div className="modal-img-container">
                <img
                  src={activePost.image}
                  alt="Post"
                  className="img-fluid modal-img"
                />
              </div>
              <hr className="modal-divider" />
              <div className="modal-caption mb-3">{activePost.caption}</div>
              <div className="d-flex justify-content-end gap-2 modal-action-btns">
                <Button variant="outline-secondary" size="sm" className="d-flex align-items-center" onClick={handleEditClick} style={{ boxShadow: 'none' }}>
                  <FaRegEdit className="me-1" /> Edit
                </Button>
                <Button variant="outline-danger" size="sm" className="d-flex align-items-center" onClick={handleDeleteClick} style={{ boxShadow: 'none' }}>
                  <FaTrash className="me-1" /> Delete
                </Button>
              </div>
            </Modal.Body>
            <Modal.Footer className="modal-footer-custom">
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleEditClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body style={{ height: '500px' }}>
            {editError && <Alert variant="danger">{editError}</Alert>}
            <Form.Group className="mb-3" controlId="editImageUrl">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                value={editImage}
                onChange={(e) => setEditImage(e.target.value)}
                required
                maxLength={2048}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editCaption">
              <Form.Label>Caption</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                required
                maxLength={255}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleEditClose} disabled={editLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Post</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: '500px' }}>
          Are you sure you want to delete this post?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <style>{`
        .post-card {
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .post-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 1.5px 6px rgba(0,0,0,0.08);
          transform: translateY(-2px) scale(1.01);
          border-color: #b3b3b3;
        }
        .post-img-hover:hover {
          transform: scale(1.04);
          filter: brightness(0.97);
        }
        .custom-view-modal .modal-content {
          border-radius: 18px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
          background: #f8fafc;
        }
        .modal-header-custom {
          border-bottom: none;
          background: #f3f6fa;
          border-top-left-radius: 18px;
          border-top-right-radius: 18px;
        }
        .modal-body-custom {
          background: #f8fafc;
          border-radius: 0 0 18px 18px;
          padding: 2rem 2.5rem 1.5rem 2.5rem;
        }
        .modal-img-container {
          max-height: 340px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e3e3e3;
          margin-bottom: 1.2rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .modal-img {
          max-width: 100%;
          max-height: 320px;
          width: auto;
          height: auto;
          border-radius: 10px;
          object-fit: contain;
        }
        .modal-divider {
          margin: 1.2rem 0 1rem 0;
          border-top: 1.5px solid #e3e3e3;
        }
        .modal-caption {
          text-align: center;
          font-size: 1.13rem;
          color: #333;
          font-weight: 500;
          letter-spacing: 0.01em;
        }
        .modal-action-btns .btn {
          min-width: 80px;
          font-size: 0.98rem;
        }
        .modal-footer-custom {
          border-top: none;
          background: #f3f6fa;
          border-bottom-left-radius: 18px;
          border-bottom-right-radius: 18px;
        }
      `}</style>
    </>
  );
}

export default PostList;
