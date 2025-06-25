import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CreatePost from '../components/CreatePost';

function NewPost() {
  const [show, setShow] = useState(true);
  const navigate = useNavigate();

  const handlePostCreated = () => {
    setShow(false);
    navigate('/'); // Redirect to home after posting
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col lg={6} md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="mb-4 text-center">Share a New Moment</h3>
              <CreatePost 
                show={show}
                onHide={() => navigate('/')}
                onPostCreated={handlePostCreated}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default NewPost;
